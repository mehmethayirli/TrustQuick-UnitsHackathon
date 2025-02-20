import tensorflow as tf
import numpy as np
from typing import Dict, List, Optional, Tuple
from transformers import pipeline
import PyPDF2
import docx
import io
import hashlib
from datetime import datetime
import re
import json
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')

class DocumentAnalyzer:
    def __init__(self):
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.text_classifier = pipeline("zero-shot-classification")
        self.model = self._build_model()
        self.stop_words = set(stopwords.words('turkish') + stopwords.words('english'))
        
    def _build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(32, activation='relu', input_shape=(6,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model

    async def analyze_document(self, file_path: str, file_type: str) -> Dict:
        try:
            # Read document
            text_content = await self._extract_text(file_path, file_type)
            if not text_content:
                return self._generate_error_response("Document content could not be read")
            
            # Basic analysis
            doc_stats = self._calculate_stats(text_content)
            
            # Content analysis
            content_scores = await self._analyze_content(text_content)
            
            # Reliability analysis
            reliability_score = await self._analyze_reliability(text_content, doc_stats)
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(doc_stats, content_scores, reliability_score)
            
            return {
                'overall_score': overall_score,
                'details': {
                    'document_stats': doc_stats,
                    'content_analysis': content_scores,
                    'reliability_score': reliability_score
                }
            }
            
        except Exception as e:
            print(f"Document analysis error: {e}")
            return self._generate_error_response(str(e))
    
    async def _extract_text(self, file_path: str, file_type: str) -> Optional[str]:
        try:
            if file_type == 'pdf':
                with open(file_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text()
                    return text
                    
            elif file_type == 'docx':
                doc = docx.Document(file_path)
                return "\n".join([paragraph.text for paragraph in doc.paragraphs])
                
            elif file_type == 'txt':
                with open(file_path, 'r', encoding='utf-8') as file:
                    return file.read()
                    
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            print(f"Text extraction error: {e}")
            return None
            
    def _calculate_stats(self, text: str) -> Dict:
        try:
            # Text cleaning
            clean_text = re.sub(r'[^\w\s]', ' ', text)
            
            # Word analysis
            words = word_tokenize(clean_text)
            words = [w.lower() for w in words if w.isalnum()]
            meaningful_words = [w for w in words if w not in self.stop_words]
            
            # Sentence analysis
            sentences = sent_tokenize(text)
            
            # Paragraph analysis
            paragraphs = [p for p in text.split('\n\n') if p.strip()]
            
            # Word frequency analysis
            freq_dist = FreqDist(meaningful_words)
            
            # POS tagging
            pos_tags = nltk.pos_tag(meaningful_words)
            noun_count = sum(1 for _, tag in pos_tags if tag.startswith('N'))
            verb_count = sum(1 for _, tag in pos_tags if tag.startswith('V'))
            
            return {
                'word_count': len(words),
                'unique_words': len(set(words)),
                'vocabulary_richness': len(set(meaningful_words)) / len(meaningful_words) if meaningful_words else 0,
                'avg_word_length': sum(len(w) for w in words) / len(words) if words else 0,
                'sentence_count': len(sentences),
                'avg_sentence_length': len(words) / len(sentences) if sentences else 0,
                'paragraph_count': len(paragraphs),
                'noun_ratio': noun_count / len(meaningful_words) if meaningful_words else 0,
                'verb_ratio': verb_count / len(meaningful_words) if meaningful_words else 0,
                'most_common_words': [word for word, _ in freq_dist.most_common(10)]
            }
            
        except Exception as e:
            print(f"Statistics calculation error: {e}")
            return None

    async def _analyze_content(self, text: str) -> Dict:
        try:
            # Split text into sections
            sections = [text[i:i+512] for i in range(0, len(text), 512)]
            
            # Professionalism analysis
            professionalism_scores = []
            for section in sections:
                prof_result = self.text_classifier(
                    section,
                    candidate_labels=[
                        "professional", "academic", "technical",
                        "formal", "casual", "informal"
                    ]
                )
                prof_score = sum(
                    score for label, score in zip(prof_result['labels'], prof_result['scores'])
                    if label in ["professional", "academic", "technical", "formal"]
                )
                professionalism_scores.append(prof_score)
            
            # Credibility analysis
            credibility_scores = []
            for section in sections:
                cred_result = self.text_classifier(
                    section,
                    candidate_labels=[
                        "objective", "evidence-based", "verifiable",
                        "subjective", "biased", "speculative"
                    ]
                )
                cred_score = sum(
                    score for label, score in zip(cred_result['labels'], cred_result['scores'])
                    if label in ["objective", "evidence-based", "verifiable"]
                )
                credibility_scores.append(cred_score)
            
            # Sentiment analysis
            sentiment_results = self.sentiment_analyzer(sections)
            sentiment_score = sum(1 for result in sentiment_results if result['label'] == 'POSITIVE') / len(sentiment_results)
            
            # Content quality analysis
            quality_score = self._analyze_content_quality(text)
            
            # Calculate final scores
            professionalism = (np.mean(professionalism_scores) * 0.7 + quality_score * 0.3) * 100
            credibility = (np.mean(credibility_scores) * 0.7 + quality_score * 0.3) * 100
            sentiment = sentiment_score * 100
            
            return {
                'professionalism': max(0, min(100, professionalism)),
                'credibility': max(0, min(100, credibility)),
                'sentiment': max(0, min(100, sentiment))
            }
            
        except Exception as e:
            print(f"Content analysis error: {e}")
            return {
                'professionalism': 50.0,
                'credibility': 50.0,
                'sentiment': 50.0
            }
    
    def _analyze_content_quality(self, text: str) -> float:
        try:
            # Word diversity check
            words = word_tokenize(text.lower())
            meaningful_words = [w for w in words if w not in self.stop_words]
            word_diversity = len(set(meaningful_words)) / len(meaningful_words) if meaningful_words else 0
            
            # Sentence structure analysis
            sentences = sent_tokenize(text)
            avg_sentence_length = len(words) / len(sentences) if sentences else 0
            sentence_complexity = min(avg_sentence_length / 20, 1.0)  # 20 words optimal
            
            # Technical term usage
            technical_terms = [
                'analysis', 'research', 'methodology', 'data', 'results',
                'findings', 'evidence', 'study', 'report', 'hypothesis',
                'investigation', 'conclusion', 'method', 'process', 'evaluation',
                'assessment', 'review', 'examination', 'observation', 'theory'
            ]
            technical_term_count = sum(1 for word in meaningful_words if word.lower() in technical_terms)
            technical_score = min(technical_term_count / (len(meaningful_words) * 0.05), 1.0)
            
            # Reference and citation check
            citation_patterns = [
                r'\(\d{4}\)',  # (2024)
                r'\[[\d,\s]+\]',  # [1] or [1,2]
                r'et al\.',
                r'see\.',
                r'cf\.'
            ]
            citation_count = sum(len(re.findall(pattern, text)) for pattern in citation_patterns)
            citation_score = min(citation_count / 5, 1.0)
            
            # Calculate overall quality score
            quality_factors = [
                (word_diversity, 0.3),
                (sentence_complexity, 0.2),
                (technical_score, 0.3),
                (citation_score, 0.2)
            ]
            
            return sum(score * weight for score, weight in quality_factors)
            
        except Exception as e:
            print(f"Content quality analysis error: {e}")
            return 0.5
    
    async def _analyze_reliability(self, text: str, stats: Dict) -> float:
        try:
            reliability_factors = []
            
            # Word count factor (minimum 100 words)
            word_count_score = min(stats['word_count'] / 100, 1.0) * 100
            reliability_factors.append(word_count_score)
            
            # Vocabulary diversity factor
            vocabulary_score = stats['vocabulary_richness'] * 100
            reliability_factors.append(vocabulary_score)
            
            # Sentence length factor (ideal: 15-25 words)
            sentence_length_score = 100 - abs(stats['avg_sentence_length'] - 20) * 2
            sentence_length_score = max(0, min(100, sentence_length_score))
            reliability_factors.append(sentence_length_score)
            
            # Paragraph organization factor
            if stats['paragraph_count'] > 1:
                para_org_score = min(stats['paragraph_count'] / 5, 1.0) * 100
            else:
                para_org_score = 50.0
            reliability_factors.append(para_org_score)
            
            return sum(reliability_factors) / len(reliability_factors)
            
        except Exception as e:
            print(f"Reliability analysis error: {e}")
            return 50.0
    
    def _calculate_overall_score(self, stats: Dict, content: Dict, reliability: float) -> float:
        try:
            weights = {
                'content': 0.4,
                'reliability': 0.3,
                'stats': 0.3
            }
            
            # Content score
            content_score = (content['professionalism'] + 
                           content['credibility'] + 
                           content['sentiment']) / 3
            
            # Statistics score
            stats_score = (
                min(stats['word_count'] / 500, 1.0) * 100 * 0.4 +
                stats['vocabulary_richness'] * 100 * 0.3 +
                min(stats['paragraph_count'] / 10, 1.0) * 100 * 0.3
            )
            
            # Calculate overall score
            overall_score = (
                content_score * weights['content'] +
                reliability * weights['reliability'] +
                stats_score * weights['stats']
            )
            
            return max(0, min(100, overall_score))
            
        except Exception as e:
            print(f"Overall score calculation error: {e}")
            return 50.0
    
    def _generate_error_response(self, error_message: str) -> Dict:
        return {
            'overall_score': 0,
            'details': {
                'error': error_message
            }
        }