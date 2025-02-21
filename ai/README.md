# TrustNet AI Backend

This is the AI backend for the TrustNet system, providing advanced analysis and scoring capabilities for trust assessment.

## Features

- Trust score calculation using machine learning
- Social media profile analysis
- Professional document analysis
- Reference validation
- Blockchain integration for score updates

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_lg
```

2. Configure environment:
- Copy `.env.example` to `.env`
- Update the values with your configuration

3. Run the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for the interactive API documentation.

## Components

### Trust Score Calculator
- Calculates overall trust scores based on multiple factors
- Uses TensorFlow for advanced scoring models
- Includes financial, professional, and social components

### Social Media Analyzer
- Analyzes LinkedIn and Twitter profiles
- Evaluates authenticity and engagement
- Provides platform-specific scoring

### Document Analyzer
- Processes professional documents (CV, certificates, etc.)
- Extracts and validates information
- Evaluates document authenticity

### Reference Validator
- Validates professional references
- Verifies relationships and credentials
- Provides confidence scores for references

## Security

- JWT-based authentication
- Secure blockchain integration
- Data encryption and privacy protection

## Integration

The backend integrates with:
- TrustNet smart contract
- Units Network blockchain
- Frontend application
- External APIs for verification