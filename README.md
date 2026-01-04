###Problem Statement

Generative AI models often produce "Confident Hallucinations"—factually incorrect information, fake citations, and non-existent references presented as legitimate data. This creates significant misinformation risks, legal liabilities, and ethical concerns for users who rely on AI for research and decision-making. There is a critical need for a system that can detect, flag, and verify factual claims and citations to distinguish between reliable and unreliable AI-produced information.

##Project Name
VeriGen: ML-Based AI Hallucination Detection System

##Team Name
Tech Titans



##Project Overview
VeriGen is a high-performance FastAPI-based system designed to audit AI-generated text for accuracy. It uses a multi-layered Machine Learning approach to verify the three pillars of trust: Factual Claims, Citation Authenticity, and Link Accessibility. By combining Natural Language Processing (NLP) with real-time network verification, it provides a "Trust Score" to help users validate AI outputs.

Key Features
ML Hallucination Detection: Utilizes vectara/hallucination_evaluation_model to predict the probability of factual errors.

Zero-Shot Claim Classification: Categorizes sentences as factual, opinion, or statistical claims using facebook/bart-large-mnli.

NER Citation Analysis: Extracts and validates entities (Authors, Organizations, Dates) using dslim/bert-base-NER.

Live URL Auditing: Pings extracted links to identify broken or "ghost" references.

Setup and Installation Instructions
Prerequisites
Python 3.9+

pip (Python package manager)

Approximately 2GB of free RAM for ML model loading