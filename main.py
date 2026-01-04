from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import re
import requests
from urllib.parse import urlparse
import json
from datetime import datetime
from enum import Enum
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    pipeline
)
import numpy as np
from functools import lru_cache

app = FastAPI(
    title="ML-Based AI Hallucination Detection System",
    description="Machine Learning powered hallucination detection using HuggingFace models",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# ML MODELS CONFIGURATION
# ============================================================================

class MLModels:
    """Singleton class to load and cache ML models"""
    _instance = None
    _models_loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLModels, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not MLModels._models_loaded:
            print("🤖 Loading ML Models...")
            self.load_models()
            MLModels._models_loaded = True
    
    def load_models(self):
        """Load HuggingFace models for hallucination detection"""
        try:
            # Model 1: Hallucination Detection (Vectara)
            print("📥 Loading Hallucination Detection Model...")
            self.hallucination_model_name = "vectara/hallucination_evaluation_model"
            self.hallucination_tokenizer = AutoTokenizer.from_pretrained(
                self.hallucination_model_name
            )
            self.hallucination_model = AutoModelForSequenceClassification.from_pretrained(
                self.hallucination_model_name
            )
            
            # Model 2: Zero-shot Classification for claim verification
            print("📥 Loading Zero-Shot Classification Model...")
            self.zero_shot_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli"
            )
            
            # Model 3: NER for citation extraction
            print("📥 Loading NER Model...")
            self.ner_pipeline = pipeline(
                "ner",
                model="dslim/bert-base-NER",
                aggregation_strategy="simple"
            )
            
            print("✅ All ML Models Loaded Successfully!")
            
        except Exception as e:
            print(f"⚠️ Error loading models: {e}")
            print("💡 Run: pip install transformers torch")
            self.hallucination_model = None
            self.zero_shot_classifier = None
            self.ner_pipeline = None

# Initialize models on startup
ml_models = MLModels()

# ============================================================================
# MODELS
# ============================================================================

class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    SUSPICIOUS = "suspicious"
    BROKEN = "broken"
    FAKE = "fake"
    HALLUCINATED = "hallucinated"

class Citation(BaseModel):
    text: str
    url: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = None
    title: Optional[str] = None
    entities: Optional[List[Dict]] = None

class MLPrediction(BaseModel):
    is_hallucination: bool
    confidence: float
    model_score: float
    reasoning: str

class VerificationRequest(BaseModel):
    content: str
    check_citations: bool = True
    check_claims: bool = True
    check_links: bool = True
    use_ml: bool = True

class CitationResult(BaseModel):
    citation: Citation
    status: VerificationStatus
    reasons: List[str]
    accessibility_score: float
    ml_analysis: Optional[MLPrediction] = None

class ClaimResult(BaseModel):
    claim: str
    confidence: float
    risk_level: str
    flags: List[str]
    ml_prediction: Optional[MLPrediction] = None

class VerificationResponse(BaseModel):
    summary: Dict[str, Any]
    citations: List[CitationResult]
    claims: List[ClaimResult]
    overall_trust_score: float
    ml_enabled: bool
    timestamp: str

# ============================================================================
# ML-BASED HALLUCINATION DETECTOR
# ============================================================================

class MLHallucinationDetector:
    """ML-powered hallucination detection using HuggingFace models"""
    
    @staticmethod
    def detect_hallucination(text: str, context: str = "") -> MLPrediction:
        """
        Use ML model to detect hallucinations
        
        Args:
            text: The claim/text to verify
            context: Optional context for comparison
        """
        try:
            if ml_models.hallucination_model is None:
                return MLPrediction(
                    is_hallucination=False,
                    confidence=0.5,
                    model_score=0.5,
                    reasoning="ML model not loaded"
                )
            
            # Prepare input
            if context:
                input_text = f"Context: {context}\nClaim: {text}"
            else:
                input_text = text
            
            # Tokenize
            inputs = ml_models.hallucination_tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            # Get prediction
            with torch.no_grad():
                outputs = ml_models.hallucination_model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=-1)
                
                # Model outputs: [factual, hallucinated]
                hallucination_prob = probs[0][1].item()
                factual_prob = probs[0][0].item()
            
            is_hallucination = hallucination_prob > 0.5
            confidence = max(hallucination_prob, factual_prob)
            
            if is_hallucination:
                reasoning = f"ML model detected hallucination with {hallucination_prob:.1%} probability"
            else:
                reasoning = f"ML model verified as factual with {factual_prob:.1%} probability"
            
            return MLPrediction(
                is_hallucination=is_hallucination,
                confidence=confidence,
                model_score=hallucination_prob,
                reasoning=reasoning
            )
            
        except Exception as e:
            return MLPrediction(
                is_hallucination=False,
                confidence=0.5,
                model_score=0.5,
                reasoning=f"ML prediction error: {str(e)}"
            )
    
    @staticmethod
    def classify_claim_type(text: str) -> Dict[str, float]:
        """
        Use zero-shot classification to determine claim type
        """
        try:
            if ml_models.zero_shot_classifier is None:
                return {}
            
            candidate_labels = [
                "factual statement",
                "opinion or speculation",
                "statistical claim",
                "citation or reference",
                "general knowledge"
            ]
            
            result = ml_models.zero_shot_classifier(
                text,
                candidate_labels,
                multi_label=False
            )
            
            return {
                label: score 
                for label, score in zip(result['labels'], result['scores'])
            }
            
        except Exception as e:
            return {}
    
    @staticmethod
    def extract_entities(text: str) -> List[Dict]:
        """
        Extract named entities using NER model
        """
        try:
            if ml_models.ner_pipeline is None:
                return []
            
            entities = ml_models.ner_pipeline(text)
            return [
                {
                    "text": ent["word"],
                    "type": ent["entity_group"],
                    "score": round(ent["score"], 3)
                }
                for ent in entities
            ]
            
        except Exception as e:
            return []

# ============================================================================
# ENHANCED CITATION EXTRACTOR WITH ML
# ============================================================================

class MLCitationExtractor:
    """Extract citations using both regex and ML"""
    
    @staticmethod
    def extract_citations(text: str) -> List[Citation]:
        citations = []
        
        # Pattern 1: APA style
        apa_pattern = r'([A-Z][a-z]+(?:,?\s+[A-Z]\.?)*)\s+\((\d{4})\)\.?\s*([^.]+)\.?\s*(https?://[^\s]+)?'
        for match in re.finditer(apa_pattern, text):
            citation_text = match.group(0)
            entities = MLHallucinationDetector.extract_entities(citation_text)
            
            citations.append(Citation(
                text=citation_text,
                author=match.group(1),
                year=int(match.group(2)),
                title=match.group(3).strip(),
                url=match.group(4) if match.group(4) else None,
                entities=entities
            ))
        
        # Pattern 2: [Author, Year, Title]
        bracket_pattern = r'\[([^,]+),\s*(\d{4}),\s*([^\]]+)\]'
        for match in re.finditer(bracket_pattern, text):
            citation_text = match.group(0)
            entities = MLHallucinationDetector.extract_entities(citation_text)
            
            citations.append(Citation(
                text=citation_text,
                author=match.group(1).strip(),
                year=int(match.group(2)),
                title=match.group(3).strip(),
                entities=entities
            ))
        
        # Pattern 3: URLs
        url_pattern = r'(?:according to|see|source:|reference:)?\s*(https?://[^\s]+)'
        for match in re.finditer(url_pattern, text, re.IGNORECASE):
            citations.append(Citation(
                text=match.group(0),
                url=match.group(1)
            ))
        
        return citations

# ============================================================================
# LINK VERIFIER
# ============================================================================

class LinkVerifier:
    """Verify URL accessibility"""
    
    @staticmethod
    def verify_url(url: str, timeout: int = 5) -> Dict[str, Any]:
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return {
                    "accessible": False,
                    "status_code": None,
                    "error": "Invalid URL format"
                }
            
            response = requests.head(url, timeout=timeout, allow_redirects=True)
            return {
                "accessible": response.status_code < 400,
                "status_code": response.status_code,
                "final_url": response.url,
                "error": None
            }
        except requests.exceptions.Timeout:
            return {"accessible": False, "status_code": None, "error": "Timeout"}
        except requests.exceptions.ConnectionError:
            return {"accessible": False, "status_code": None, "error": "Connection failed"}
        except Exception as e:
            return {"accessible": False, "status_code": None, "error": str(e)}

# ============================================================================
# ML-ENHANCED CITATION VALIDATOR
# ============================================================================

class MLCitationValidator:
    """Validate citations using ML"""
    
    @staticmethod
    def validate_citation(citation: Citation, use_ml: bool = True) -> CitationResult:
        reasons = []
        accessibility_score = 1.0
        status = VerificationStatus.VERIFIED
        ml_analysis = None
        
        # ML-based hallucination detection
        if use_ml and ml_models.hallucination_model:
            ml_analysis = MLHallucinationDetector.detect_hallucination(
                citation.text
            )
            
            if ml_analysis.is_hallucination:
                status = VerificationStatus.HALLUCINATED
                reasons.append(f"ML Model: {ml_analysis.reasoning}")
                accessibility_score -= 0.4
        
        # URL verification
        if citation.url:
            link_check = LinkVerifier.verify_url(citation.url)
            if not link_check["accessible"]:
                status = VerificationStatus.BROKEN
                reasons.append(f"URL not accessible: {link_check['error']}")
                accessibility_score -= 0.5
            else:
                reasons.append("URL is accessible")
        else:
            if status != VerificationStatus.HALLUCINATED:
                status = VerificationStatus.SUSPICIOUS
            reasons.append("No URL provided for verification")
            accessibility_score -= 0.3
        
        # Year validation
        if citation.year:
            current_year = datetime.now().year
            if citation.year > current_year:
                status = VerificationStatus.FAKE
                reasons.append(f"Future year detected: {citation.year}")
                accessibility_score -= 0.4
            elif citation.year < 1800:
                status = VerificationStatus.SUSPICIOUS
                reasons.append(f"Unusually old year: {citation.year}")
                accessibility_score -= 0.2
        
        # Entity analysis
        if citation.entities:
            persons = [e for e in citation.entities if e['type'] == 'PER']
            if persons:
                reasons.append(f"ML detected {len(persons)} person entities")
        
        accessibility_score = max(0.0, accessibility_score)
        
        return CitationResult(
            citation=citation,
            status=status,
            reasons=reasons,
            accessibility_score=accessibility_score,
            ml_analysis=ml_analysis
        )

# ============================================================================
# ML-ENHANCED CLAIM ANALYZER
# ============================================================================

class MLClaimAnalyzer:
    """Analyze claims using ML models"""
    
    SUSPICIOUS_PATTERNS = [
        r'\b(definitely|certainly|absolutely|undoubtedly)\b',
        r'\b(all|every|always|never)\b',
        r'\b\d{1,3}(?:\.\d+)?%\b',
        r'\b(?:studies show|research proves|scientists confirm)\b',
    ]
    
    @staticmethod
    def analyze_claim(claim: str, use_ml: bool = True) -> ClaimResult:
        flags = []
        confidence = 0.5
        ml_prediction = None
        
        # ML-based detection
        if use_ml and ml_models.hallucination_model:
            ml_prediction = MLHallucinationDetector.detect_hallucination(claim)
            
            if ml_prediction.is_hallucination:
                flags.append(f"ML Model: {ml_prediction.reasoning}")
                confidence = ml_prediction.model_score
            else:
                confidence = 1.0 - ml_prediction.model_score
            
            # Claim type classification
            if ml_models.zero_shot_classifier:
                claim_types = MLHallucinationDetector.classify_claim_type(claim)
                if claim_types:
                    top_type = max(claim_types.items(), key=lambda x: x[1])
                    if top_type[0] == "opinion or speculation" and top_type[1] > 0.7:
                        flags.append(f"Likely opinion/speculation ({top_type[1]:.1%})")
                        confidence += 0.15
        
        # Rule-based patterns (complementary to ML)
        for pattern in MLClaimAnalyzer.SUSPICIOUS_PATTERNS:
            if re.search(pattern, claim, re.IGNORECASE):
                flags.append("Overconfident language detected")
                confidence += 0.1
                break
        
        # Statistics without sources
        if re.search(r'\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\b', claim):
            if not re.search(r'https?://|according to', claim, re.IGNORECASE):
                flags.append("Specific statistics without source")
                confidence += 0.1
        
        confidence = min(confidence, 1.0)
        
        # Determine risk level
        if confidence >= 0.7:
            risk_level = "HIGH"
        elif confidence >= 0.5:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        if not flags:
            flags = ["No obvious hallucination indicators"]
        
        return ClaimResult(
            claim=claim,
            confidence=confidence,
            risk_level=risk_level,
            flags=flags,
            ml_prediction=ml_prediction
        )

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "ML-Based AI Hallucination Detection System",
        "version": "2.0.0",
        "ml_models": {
            "hallucination_detection": "vectara/hallucination_evaluation_model",
            "zero_shot_classification": "facebook/bart-large-mnli",
            "named_entity_recognition": "dslim/bert-base-NER"
        },
        "endpoints": {
            "verify": "/api/verify",
            "health": "/health",
            "models_info": "/api/models"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ml_models_loaded": ml_models._models_loaded,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/models")
async def models_info():
    """Get information about loaded ML models"""
    return {
        "models_loaded": ml_models._models_loaded,
        "hallucination_model": ml_models.hallucination_model is not None,
        "zero_shot_classifier": ml_models.zero_shot_classifier is not None,
        "ner_pipeline": ml_models.ner_pipeline is not None,
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }

@app.post("/api/verify", response_model=VerificationResponse)
async def verify_content(request: VerificationRequest):
    """
    ML-powered verification of AI-generated content
    """
    results = {
        "citations": [],
        "claims": [],
        "summary": {
            "total_citations": 0,
            "verified_citations": 0,
            "broken_links": 0,
            "suspicious_citations": 0,
            "hallucinated_citations": 0,
            "total_claims": 0,
            "high_risk_claims": 0,
            "ml_detected_hallucinations": 0
        }
    }
    
    # Extract and verify citations with ML
    if request.check_citations:
        extractor = MLCitationExtractor()
        validator = MLCitationValidator()
        
        citations = extractor.extract_citations(request.content)
        results["summary"]["total_citations"] = len(citations)
        
        for citation in citations:
            citation_result = validator.validate_citation(citation, request.use_ml)
            results["citations"].append(citation_result)
            
            if citation_result.status == VerificationStatus.VERIFIED:
                results["summary"]["verified_citations"] += 1
            elif citation_result.status == VerificationStatus.BROKEN:
                results["summary"]["broken_links"] += 1
            elif citation_result.status == VerificationStatus.HALLUCINATED:
                results["summary"]["hallucinated_citations"] += 1
            elif citation_result.status in [VerificationStatus.SUSPICIOUS, VerificationStatus.FAKE]:
                results["summary"]["suspicious_citations"] += 1
            
            if citation_result.ml_analysis and citation_result.ml_analysis.is_hallucination:
                results["summary"]["ml_detected_hallucinations"] += 1
    
    # Analyze claims with ML
    if request.check_claims:
        analyzer = MLClaimAnalyzer()
        
        sentences = re.split(r'[.!?]+', request.content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        results["summary"]["total_claims"] = len(sentences)
        
        for sentence in sentences:
            claim_result = analyzer.analyze_claim(sentence, request.use_ml)
            if claim_result.risk_level in ["HIGH", "MEDIUM"]:
                results["claims"].append(claim_result)
            
            if claim_result.risk_level == "HIGH":
                results["summary"]["high_risk_claims"] += 1
            
            if claim_result.ml_prediction and claim_result.ml_prediction.is_hallucination:
                results["summary"]["ml_detected_hallucinations"] += 1
    
    # Calculate overall trust score
    trust_score = 1.0
    
    if results["summary"]["total_citations"] > 0:
        citation_trust = results["summary"]["verified_citations"] / results["summary"]["total_citations"]
        hallucination_penalty = results["summary"]["hallucinated_citations"] / results["summary"]["total_citations"]
        citation_trust = max(0, citation_trust - hallucination_penalty)
        trust_score *= citation_trust
    
    if results["summary"]["total_claims"] > 0:
        claim_trust = 1.0 - (results["summary"]["high_risk_claims"] / results["summary"]["total_claims"])
        trust_score *= claim_trust
    
    # ML hallucination penalty
    total_analyzed = results["summary"]["total_citations"] + results["summary"]["total_claims"]
    if total_analyzed > 0 and results["summary"]["ml_detected_hallucinations"] > 0:
        ml_penalty = results["summary"]["ml_detected_hallucinations"] / total_analyzed
        trust_score *= (1.0 - ml_penalty * 0.5)
    
    trust_score = max(0.0, min(1.0, trust_score))
    
    return VerificationResponse(
        summary=results["summary"],
        citations=results["citations"],
        claims=results["claims"],
        overall_trust_score=round(trust_score, 2),
        ml_enabled=request.use_ml and ml_models._models_loaded,
        timestamp=datetime.now().isoformat()
    )

@app.post("/api/verify-url")
async def verify_single_url(url: str):
    """Verify a single URL"""
    result = LinkVerifier.verify_url(url)
    return result

@app.post("/api/analyze-claim")
async def analyze_single_claim(claim: str, use_ml: bool = True):
    """Analyze a single claim using ML"""
    analyzer = MLClaimAnalyzer()
    result = analyzer.analyze_claim(claim, use_ml)
    return result

@app.post("/api/detect-hallucination")
async def detect_hallucination(text: str, context: str = ""):
    """Direct ML-based hallucination detection"""
    prediction = MLHallucinationDetector.detect_hallucination(text, context)
    return prediction

if __name__ == "__main__":
    import uvicorn
    import socket
    
    def get_local_ip():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "Unable to determine"
    
    local_ip = get_local_ip()
    
    print("=" * 70)
    print("🤖 ML-Based AI Hallucination Detection System v2.0")
    print("=" * 70)
    print("\n📍 Access the API from:")
    print(f"   • This computer: http://localhost:8000")
    print(f"   • Same network:  http://{local_ip}:8000")
    print(f"\n📚 API Documentation:")
    print(f"   • http://localhost:8000/docs")
    print(f"   • http://{local_ip}:8000/docs")
    print("\n🤖 ML Models:")
    print("   • Hallucination Detection: vectara/hallucination_evaluation_model")
    print("   • Zero-Shot Classification: facebook/bart-large-mnli")
    print("   • Named Entity Recognition: dslim/bert-base-NER")
    print("\n" + "=" * 70)
    print("✨ Starting server... ML models will load on first request")
    print("=" * 70 + "\n")
    
    uvicorn.run(
        app, 
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=True
    )