from transformers import pipeline
import numpy as np
from typing import Dict, List, Optional
import aiohttp
import asyncio
from bs4 import BeautifulSoup
import re
import tensorflow as tf
import json
import tweepy
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from linkedin_api import Linkedin
import time

load_dotenv()

class TwitterAPI:
    def __init__(self):
        self._cache = {}
        self._cache_timeout = 300  # 5 minutes
        
        # Load Twitter API credentials
        self.client_id = os.getenv('TWITTER_CLIENT_ID')
        self.client_secret = os.getenv('TWITTER_CLIENT_SECRET')
        self.bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        if not all([self.client_id, self.client_secret, self.bearer_token, 
                   self.access_token, self.access_token_secret]):
            raise ValueError("Missing Twitter API credentials")
            
        # Create Twitter API client
        self.client = tweepy.Client(
            bearer_token=self.bearer_token,
            consumer_key=self.client_id,
            consumer_secret=self.client_secret,
            access_token=self.access_token,
            access_token_secret=self.access_token_secret,
            wait_on_rate_limit=True
        )
        
    async def get_user_data(self, username: str) -> Dict:
        try:
            if not username:
                print("Twitter username is empty")
                return None
                
            # Extract username from URL
            if 'twitter.com/' in username or 'x.com/' in username:
                username = username.split('/')[-1]
            
            # Remove @ symbol
            username = username.replace('@', '')
                
            # Check cache
            cache_key = f"twitter_user_{username}"
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                print(f"Data retrieved from cache: {username}")
                return cached_data
                
            print(f"Fetching Twitter data: {username}")
            
            # Get user info
            user = self.client.get_user(
                username=username,
                user_fields=['created_at', 'description', 'location', 
                            'public_metrics', 'verified', 'profile_image_url']
            )
            
            if not user.data:
                print(f"User not found: {username}")
                return None
                
            # Get tweets
            tweets = self.client.get_users_tweets(
                user.data.id,
                max_results=10,
                tweet_fields=['created_at', 'public_metrics']
            )
            
            # Calculate account age
            account_age = (datetime.now(timezone.utc) - user.data.created_at).days / 365
            
            # Create tweet list
            tweet_list = []
            if tweets.data:
                for tweet in tweets.data:
                    tweet_list.append({
                        'text': tweet.text,
                        'likes': tweet.public_metrics['like_count'],
                        'retweets': tweet.public_metrics['retweet_count']
                    })
            
            # Calculate engagement rate
            engagement_rate = self._calculate_engagement_rate(
                user.data.public_metrics['followers_count'],
                tweet_list
            )
            
            # Calculate influence score
            influence_score = self._calculate_influence_score(
                user.data.public_metrics['followers_count'],
                user.data.public_metrics['following_count'],
                engagement_rate,
                account_age
            )
            
            result = {
                'followers': user.data.public_metrics['followers_count'],
                'following': user.data.public_metrics['following_count'],
                'tweet_count': user.data.public_metrics['tweet_count'],
                'account_age_years': account_age,
                'engagement_rate': engagement_rate,
                'influence_score': influence_score,
                'recent_tweets': [tweet['text'] for tweet in tweet_list],
                'description': user.data.description or '',
                'verified': user.data.verified,
                'location': user.data.location or '',
                'profile_image_url': user.data.profile_image_url or ''
            }
            
            # Save to cache
            self._set_cache(cache_key, result)
            
            return result
            
        except Exception as e:
            print(f"Twitter data retrieval error ({username}): {str(e)}")
            return None
            
    def _calculate_engagement_rate(self, followers: int, tweets: List[Dict]) -> float:
        if not tweets or followers == 0:
            return 0.0
            
        total_engagement = sum(
            tweet['likes'] + tweet['retweets']
            for tweet in tweets
        )
        
        return total_engagement / (len(tweets) * followers)
        
    def _calculate_influence_score(self, followers: int, following: int, engagement_rate: float, account_age: float) -> float:
        # Normalize metrics
        followers_score = min(followers / 10000, 1.0)
        following_ratio = followers / (following + 1)
        following_score = min(following_ratio / 2, 1.0)
        engagement_score = min(engagement_rate * 100, 1.0)
        age_score = min(account_age / 5, 1.0)
        
        # Weight the scores
        weights = {
            'followers': 0.4,
            'following': 0.1,
            'engagement': 0.4,
            'age': 0.1
        }
        
        influence_score = (
            followers_score * weights['followers'] +
            following_score * weights['following'] +
            engagement_score * weights['engagement'] +
            age_score * weights['age']
        ) * 100
        
        return influence_score
        
    def _get_from_cache(self, key: str) -> Optional[Dict]:
        cached_data = self._cache.get(key)
        if cached_data:
            timestamp, data = cached_data
            if time.time() - timestamp < self._cache_timeout:
                return data
        return None
        
    def _set_cache(self, key: str, data: Dict):
        self._cache[key] = (time.time(), data)

class LinkedInAPI:
    def __init__(self):
        self.api = None
        
    async def authenticate(self, access_token: str):
        self.api = Linkedin(access_token=access_token)
        
    async def get_profile_data(self, access_token: str, profile_id: str) -> Dict:
        try:
            # Connect to LinkedIn API
            await self.authenticate(access_token)
            
            # Get profile info
            profile = self.api.get_profile(profile_id)
            
            # Calculate experience years
            experience_years = self._calculate_experience_years(profile.get('experience', []))
            
            # Determine education level
            education_level = self._determine_education_level(profile.get('education', []))
            
            # Calculate activity score
            activity_score = self._calculate_activity_score(
                profile.get('posts', []),
                profile.get('articles', []),
                profile.get('activity', [])
            )
            
            # Calculate profile completion rate
            profile_completion = self._calculate_profile_completion(profile)
            
            return {
                'connections': profile.get('connections', 0),
                'experience_years': experience_years,
                'education_level': education_level,
                'skills': profile.get('skills', [])[:10],
                'endorsements': profile.get('endorsements_count', 0),
                'recommendations': len(profile.get('recommendations', [])),
                'activity_score': activity_score,
                'profile_completion': profile_completion
            }
            
        except Exception as e:
            print(f"LinkedIn data retrieval error: {e}")
            return None
            
    def _calculate_experience_years(self, experiences: List[Dict]) -> float:
        total_years = 0
        current_year = datetime.now(timezone.utc).year
        
        for exp in experiences:
            start_year = exp.get('start_year', current_year)
            end_year = exp.get('end_year', current_year)
            total_years += end_year - start_year
            
        return round(total_years, 1)
        
    def _determine_education_level(self, education: List[Dict]) -> str:
        education_levels = {
            'phd': ['phd', 'doctorate'],
            'master': ['master', 'mba'],
            'bachelor': ['bachelor'],
            'high_school': ['high school']
        }
        
        highest_level = 'high_school'
        for edu in education:
            degree = edu.get('degree', '').lower()
            for level, keywords in education_levels.items():
                if any(keyword in degree for keyword in keywords):
                    if level == 'phd':
                        return 'PhD'
                    elif level == 'master':
                        highest_level = "Master's"
                    elif level == 'bachelor' and highest_level == 'high_school':
                        highest_level = "Bachelor's"
                        
        return 'High School' if highest_level == 'high_school' else highest_level
        
    def _calculate_activity_score(self, posts: List, articles: List, activities: List) -> float:
        # Count activities from last 3 months
        recent_date = datetime.now(timezone.utc) - timedelta(days=90)
        
        recent_posts = sum(1 for post in posts if post.get('date', datetime.now(timezone.utc)) >= recent_date)
        recent_articles = sum(1 for article in articles if article.get('date', datetime.now(timezone.utc)) >= recent_date)
        recent_activities = sum(1 for activity in activities if activity.get('date', datetime.now(timezone.utc)) >= recent_date)
        
        # Calculate activity score (max 100)
        post_score = min(recent_posts / 12, 1.0) * 40
        article_score = min(recent_articles / 3, 1.0) * 40
        activity_score = min(recent_activities / 10, 1.0) * 20
        
        return post_score + article_score + activity_score
        
    def _calculate_profile_completion(self, profile: Dict) -> int:
        required_fields = [
            'summary',
            'experience',
            'education',
            'skills',
            'profile_picture',
            'industry',
            'location',
            'headline'
        ]
        
        optional_fields = [
            'certifications',
            'languages',
            'volunteer_experience',
            'publications',
            'honors_awards'
        ]
        
        # Required fields: 70%, Optional fields: 30%
        required_score = sum(1 for field in required_fields if profile.get(field)) * (70 / len(required_fields))
        optional_score = sum(1 for field in optional_fields if profile.get(field)) * (30 / len(optional_fields))
        
        return round(required_score + optional_score)

class SocialMediaAnalyzer:
    def __init__(self):
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.text_classifier = pipeline("zero-shot-classification")
        self.twitter_api = TwitterAPI()
        self.linkedin_api = LinkedInAPI()
        
    async def analyze_profiles(self, social_data: Dict) -> Dict:
        try:
            scores = {}
            details = {}
            errors = []
            
            # Twitter analysis
            if twitter_username := social_data.get('twitter', {}).get('username'):
                try:
                    twitter_data = await self.twitter_api.get_user_data(twitter_username)
                    if twitter_data:
                        twitter_score = await self._analyze_twitter(twitter_data)
                        scores['twitter'] = twitter_score
                        details['twitter_data'] = twitter_data
                except Exception as e:
                    errors.append(str(e))
            
            # LinkedIn analysis
            if linkedin_data := social_data.get('linkedin'):
                try:
                    profile_data = await self.linkedin_api.get_profile_data(
                        linkedin_data.get('accessToken'),
                        linkedin_data.get('profileId')
                    )
                    if profile_data:
                        linkedin_score = await self._analyze_linkedin(profile_data)
                        scores['linkedin'] = linkedin_score
                        details['linkedin_data'] = profile_data
                except Exception as e:
                    errors.append(f"LinkedIn analysis error: {str(e)}")
            
            # Calculate overall score
            if scores:
                weights = {
                    'twitter': 0.4,
                    'linkedin': 0.6
                }
                
                total_weight = sum(weights[platform] for platform in scores.keys())
                if total_weight > 0:
                    weights = {k: v/total_weight for k, v in weights.items()}
                    overall_score = sum(scores[platform] * weights[platform] for platform in scores.keys())
                else:
                    overall_score = 50.0
            else:
                overall_score = 50.0
            
            result = {
                'overall': overall_score,
                'details': details
            }
            
            if errors:
                result['errors'] = errors
            
            return result
            
        except Exception as e:
            print(f"Social profile analysis error: {e}")
            return {
                'overall': 50.0,
                'details': {},
                'errors': [str(e)]
            }

    async def _analyze_twitter(self, data: Dict) -> float:
        if not data:
            return 50.0

        try:
            features = []
            
            # Follower analysis
            followers = data.get('followers', 0)
            follower_score = min(followers / 1000, 1.0) * 100
            features.append(follower_score)
            
            # Tweet analysis
            tweets = data.get('recent_tweets', [])
            if tweets:
                # Sentiment analysis
                sentiments = self.sentiment_analyzer(tweets[:10])
                sentiment_scores = [100 if s['label'] == 'POSITIVE' else 0 for s in sentiments]
                sentiment_score = sum(sentiment_scores) / len(sentiment_scores)
                features.append(sentiment_score)
                
                # Content quality analysis
                content_score = await self._analyze_tweet_content(tweets)
                features.append(content_score)
            
            # Account age analysis
            account_age = data.get('account_age_years', 0)
            age_score = min(account_age / 5, 1.0) * 100
            features.append(age_score)
            
            # Engagement rate
            engagement = data.get('engagement_rate', 0)
            engagement_score = min(engagement / 0.001, 1.0) * 100
            features.append(engagement_score)
            
            # Influence score
            influence_score = data.get('influence_score', 0)
            features.append(influence_score)
            
            return sum(features) / len(features)
        except Exception as e:
            print(f"Twitter analysis error: {e}")
            return 50.0

    async def _analyze_linkedin(self, data: Dict) -> float:
        if not data:
            return 50.0

        try:
            features = []
            
            # Connection analysis
            connections = data.get('connections', 0)
            connection_score = min(connections / 500, 1.0) * 100
            features.append(connection_score)
            
            # Experience analysis
            experience_years = data.get('experience_years', 0)
            experience_score = min(experience_years / 10, 1.0) * 100
            features.append(experience_score)
            
            # Education level analysis
            education_scores = {
                'PhD': 100,
                "Master's": 90,
                "Bachelor's": 80,
                'High School': 60
            }
            education_score = education_scores.get(data.get('education_level', 'High School'), 50)
            features.append(education_score)
            
            # Skills analysis
            skills_count = len(data.get('skills', []))
            skills_score = min(skills_count / 10, 1.0) * 100
            features.append(skills_score)
            
            # Endorsements analysis
            endorsements = data.get('endorsements', 0)
            endorsement_score = min(endorsements / 50, 1.0) * 100
            features.append(endorsement_score)
            
            # Recommendations analysis
            recommendations = data.get('recommendations', 0)
            recommendation_score = min(recommendations / 5, 1.0) * 100
            features.append(recommendation_score)
            
            # Activity score
            activity_score = data.get('activity_score', 0)
            features.append(activity_score)
            
            # Profile completion
            completion_score = data.get('profile_completion', 0)
            features.append(completion_score)
            
            return sum(features) / len(features)
        except Exception as e:
            print(f"LinkedIn analysis error: {e}")
            return 50.0

    async def _analyze_tweet_content(self, tweets: List[str]) -> float:
        try:
            # Classify tweets
            results = self.text_classifier(
                tweets,
                candidate_labels=["informative", "professional", "spam", "offensive"]
            )
            
            # Calculate quality score
            scores = []
            for result in results:
                if result['labels'][0] in ["informative", "professional"]:
                    scores.append(result['scores'][0] * 100)
                else:
                    scores.append((1 - result['scores'][0]) * 100)
            
            return sum(scores) / len(scores)
        except Exception as e:
            print(f"Tweet content analysis error: {e}")
            return 50.0