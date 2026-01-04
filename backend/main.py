from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re
import requests
from urllib.parse import urlparse
from datetime import datetime
from enum import Enum
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    pipeline
)

# ============================================================================
# CREATE APP FIRST
# ============================================================================
app = FastAPI(
    title="ML-Based AI Hallucination Detection System",
    description="Machine Learning powered hallucination detection using HuggingFace models",
    version="2.0.0"
)

# ============================================================================
# CORS - MUST BE IMMEDIATELY AFTER APP CREATION
# ============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
            print("📥 Loading Hallucination Detection Model...")
            self.hallucination_model_name = "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli"
            self.hallucination_tokenizer = AutoTokenizer.from_pretrained(
                self.hallucination_model_name
            )
            self.hallucination_model = AutoModelForSequenceClassification.from_pretrained(
                self.hallucination_model_name
            )
            
            print("📥 Loading Zero-Shot Classification Model...")
            self.zero_shot_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli"
            )
            
            print("📥 Loading NER Model...")
            self.ner_pipeline = pipeline(
                "ner",
                model="dslim/bert-base-NER",
                aggregation_strategy="simple"
            )
            
            print("✅ All ML Models Loaded Successfully!")
            
        except Exception as e:
            print(f"⚠️ Error loading models: {e}")
            print("💡 Models will operate in fallback mode")
            self.hallucination_model = None
            self.zero_shot_classifier = None
            self.ner_pipeline = None

ml_models = MLModels()

# ============================================================================
# PYDANTIC MODELS
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
    @staticmethod
    def detect_hallucination(text: str, context: str = "") -> MLPrediction:
        try:
            if ml_models.hallucination_model is None:
                return MLPrediction(
                    is_hallucination=False,
                    confidence=0.5,
                    model_score=0.5,
                    reasoning="ML model not loaded - operating in fallback mode"
                )
            
            if context:
                input_text = f"Context: {context}\nClaim: {text}"
            else:
                input_text = text
            
            inputs = ml_models.hallucination_tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            with torch.no_grad():
                outputs = ml_models.hallucination_model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=-1)
                
                contradiction_prob = probs[0][0].item()
                neutral_prob = probs[0][1].item()
                entailment_prob = probs[0][2].item()
            
            is_hallucination = contradiction_prob > 0.5
            confidence = max(contradiction_prob, entailment_prob)
            
            if is_hallucination:
                reasoning = f"ML model detected potential hallucination (contradiction: {contradiction_prob:.1%})"
            else:
                reasoning = f"ML model suggests factual content (entailment: {entailment_prob:.1%})"
            
            return MLPrediction(
                is_hallucination=is_hallucination,
                confidence=confidence,
                model_score=contradiction_prob,
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
# CITATION EXTRACTOR
# ============================================================================

class MLCitationExtractor:
    @staticmethod
    def extract_citations(text: str) -> List[Citation]:
        citations = []
        
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
# CITATION VALIDATOR
# ============================================================================

class MLCitationValidator:
    @staticmethod
    def validate_citation(citation: Citation, use_ml: bool = True) -> CitationResult:
        reasons = []
        accessibility_score = 1.0
        status = VerificationStatus.VERIFIED
        ml_analysis = None
        
        if use_ml and ml_models.hallucination_model:
            ml_analysis = MLHallucinationDetector.detect_hallucination(citation.text)
            
            if ml_analysis.is_hallucination:
                status = VerificationStatus.HALLUCINATED
                reasons.append(f"ML Model: {ml_analysis.reasoning}")
                accessibility_score -= 0.4
        
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
# CLAIM ANALYZER
# ============================================================================

class MLClaimAnalyzer:
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
        
        if use_ml and ml_models.hallucination_model:
            ml_prediction = MLHallucinationDetector.detect_hallucination(claim)
            
            if ml_prediction.is_hallucination:
                flags.append(f"ML Model: {ml_prediction.reasoning}")
                confidence = ml_prediction.model_score
            else:
                confidence = 1.0 - ml_prediction.model_score
            
            if ml_models.zero_shot_classifier:
                claim_types = MLHallucinationDetector.classify_claim_type(claim)
                if claim_types:
                    top_type = max(claim_types.items(), key=lambda x: x[1])
                    if top_type[0] == "opinion or speculation" and top_type[1] > 0.7:
                        flags.append(f"Likely opinion/speculation ({top_type[1]:.1%})")
                        confidence += 0.15
        
        for pattern in MLClaimAnalyzer.SUSPICIOUS_PATTERNS:
            if re.search(pattern, claim, re.IGNORECASE):
                flags.append("Overconfident language detected")
                confidence += 0.1
                break
        
        if re.search(r'\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\b', claim):
            if not re.search(r'https?://|according to', claim, re.IGNORECASE):
                flags.append("Specific statistics without source")
                confidence += 0.1
        
        confidence = min(confidence, 1.0)
        
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
        "status": "operational",
        "ml_models": {
            "hallucination_detection": "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli",
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
        "models_operational": {
            "hallucination_detector": ml_models.hallucination_model is not None,
            "zero_shot_classifier": ml_models.zero_shot_classifier is not None,
            "ner_pipeline": ml_models.ner_pipeline is not None
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/models")
async def models_info():
    return {
        "models_loaded": ml_models._models_loaded,
        "hallucination_model": ml_models.hallucination_model is not None,
        "zero_shot_classifier": ml_models.zero_shot_classifier is not None,
        "ner_pipeline": ml_models.ner_pipeline is not None,
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "model_details": {
            "hallucination_detection": ml_models.hallucination_model_name if ml_models.hallucination_model else "Not loaded"
        }
    }

@app.post("/api/verify", response_model=VerificationResponse)
async def verify_content(request: VerificationRequest):
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
            elif citation_result.status == VerificationStatus.SUSPICIOUS:
                results["summary"]["suspicious_citations"] += 1
            elif citation_result.status == VerificationStatus.HALLUCINATED:
                results["summary"]["hallucinated_citations"] += 1
                results["summary"]["ml_detected_hallucinations"] += 1
    
    if request.check_claims:
        sentences = re.split(r'[.!?]+', request.content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        results["summary"]["total_claims"] = len(sentences)
        
        for sentence in sentences[:10]:
            claim_result = MLClaimAnalyzer.analyze_claim(sentence, request.use_ml)
            results["claims"].append(claim_result)
            
            if claim_result.risk_level == "HIGH":
                results["summary"]["high_risk_claims"] += 1
            
            if claim_result.ml_prediction and claim_result.ml_prediction.is_hallucination:
                results["summary"]["ml_detected_hallucinations"] += 1
    
    trust_score = 1.0
    
    if results["summary"]["total_citations"] > 0:
        citation_trust = results["summary"]["verified_citations"] / results["summary"]["total_citations"]
        trust_score *= (0.3 + 0.7 * citation_trust)
    
    if results["summary"]["total_claims"] > 0:
        high_risk_ratio = results["summary"]["high_risk_claims"] / results["summary"]["total_claims"]
        trust_score *= (1.0 - high_risk_ratio * 0.5)
    
    if results["summary"]["ml_detected_hallucinations"] > 0:
        trust_score *= 0.6
    
    trust_score = max(0.0, min(1.0, trust_score))
    
    return VerificationResponse(
        summary=results["summary"],
        citations=results["citations"],
        claims=results["claims"],
        overall_trust_score=trust_score,
        ml_enabled=request.use_ml,
        timestamp=datetime.now().isoformat()
    )

@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print("🚀 AI Hallucination Detection System Starting...")
    print("=" * 60)