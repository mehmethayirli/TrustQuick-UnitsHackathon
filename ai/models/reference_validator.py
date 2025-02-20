from typing import List, Dict
import numpy as np
from transformers import pipeline
import aiohttp
import asyncio
from datetime import datetime

class ReferenceValidator:
    def __init__(self):
        self.text_classifier = pipeline("zero-shot-classification")
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        
    async def validate_references(self, references: List[Dict]) -> float:
        if not references:
            return 50.0
            
        try:
            scores = []
            weights = []
            
            for ref in references:
                validation_result = await self.verify_single_reference(ref)
                scores.append(validation_result['confidence'])
                weights.append(self._calculate_reference_weight(ref))
                
            return np.average(scores, weights=weights)
        except Exception as e:
            print(f"Error validating references: {e}")
            return 50.0
            
    async def verify_single_reference(self, reference: Dict) -> Dict:
        try:
            # Initialize verification components
            verification_scores = []
            
            # Identity verification
            identity_score = await self._verify_identity(reference)
            verification_scores.append(identity_score)
            
            # Relationship verification
            relationship_score = await self._verify_relationship(reference)
            verification_scores.append(relationship_score)
            
            # Content analysis
            content_score = await self._analyze_reference_content(reference)
            verification_scores.append(content_score)
            
            # Calculate overall confidence
            confidence = np.mean(verification_scores)
            
            return {
                "verified": confidence >= 70,
                "confidence": confidence,
                "details": {
                    "identity_score": identity_score,
                    "relationship_score": relationship_score,
                    "content_score": content_score
                }
            }
        except Exception as e:
            print(f"Error verifying reference: {e}")
            return {
                "verified": False,
                "confidence": 0,
                "details": {"error": str(e)}
            }
            
    async def _verify_identity(self, reference: Dict) -> float:
        try:
            scores = []
            
            # Professional email verification
            if 'email' in reference:
                email_score = self._verify_professional_email(reference['email'])
                scores.append(email_score)
                
            # Social media verification
            if 'social_profiles' in reference:
                social_score = await self._verify_social_presence(reference['social_profiles'])
                scores.append(social_score)
                
            # Professional position verification
            if 'position' in reference:
                position_score = await self._verify_professional_position(reference)
                scores.append(position_score)
                
            return np.mean(scores) if scores else 50.0
        except Exception as e:
            print(f"Error verifying identity: {e}")
            return 50.0
            
    async def _verify_relationship(self, reference: Dict) -> float:
        try:
            scores = []
            
            # Verify relationship duration
            if 'relationship_duration' in reference:
                duration_score = self._verify_duration(reference['relationship_duration'])
                scores.append(duration_score)
                
            # Analyze relationship context
            context_score = await self._analyze_relationship_context(reference)
            scores.append(context_score)
            
            # Verify mutual connections if available
            if 'mutual_connections' in reference:
                mutual_score = await self._verify_mutual_connections(reference['mutual_connections'])
                scores.append(mutual_score)
                
            return np.mean(scores)
        except Exception as e:
            print(f"Error verifying relationship: {e}")
            return 50.0
            
    async def _analyze_reference_content(self, reference: Dict) -> float:
        try:
            if 'content' not in reference:
                return 50.0
                
            content = reference['content']
            
            # Sentiment analysis
            sentiment = self.sentiment_analyzer(content)[0]
            sentiment_score = 100 if sentiment['label'] == 'POSITIVE' else 0
            sentiment_score *= sentiment['score']
            
            # Content authenticity
            authenticity_score = await self._analyze_content_authenticity(content)
            
            # Specificity analysis
            specificity_score = self._analyze_content_specificity(content)
            
            # Professional relevance
            relevance_score = await self._analyze_professional_relevance(content)
            
            # Weights for different aspects
            weights = {
                'sentiment': 0.2,
                'authenticity': 0.3,
                'specificity': 0.25,
                'relevance': 0.25
            }
            
            final_score = (
                sentiment_score * weights['sentiment'] +
                authenticity_score * weights['authenticity'] +
                specificity_score * weights['specificity'] +
                relevance_score * weights['relevance']
            )
            
            return final_score
        except Exception as e:
            print(f"Error analyzing reference content: {e}")
            return 50.0
            
    def _calculate_reference_weight(self, reference: Dict) -> float:
        try:
            base_weight = 1.0
            
            # Adjust weight based on reference age
            if 'date' in reference:
                age_in_years = (datetime.now() - datetime.strptime(reference['date'], '%Y-%m-%d')).days / 365.25
                age_factor = np.exp(-age_in_years / 5)  # Exponential decay with half-life of 5 years
                base_weight *= age_factor
                
            # Adjust weight based on relationship type
            relationship_weights = {
                'manager': 1.2,
                'direct_supervisor': 1.2,
                'colleague': 1.0,
                'client': 0.9,
                'other': 0.8
            }
            relationship_type = reference.get('relationship_type', 'other').lower()
            base_weight *= relationship_weights.get(relationship_type, 0.8)
            
            # Normalize weight to be between 0 and 1
            return min(1.0, max(0.1, base_weight))
        except Exception as e:
            print(f"Error calculating reference weight: {e}")
            return 0.5