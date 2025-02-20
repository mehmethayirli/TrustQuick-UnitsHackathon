from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Optional
import json
import os
import tempfile
import aiohttp
from models.social_analyzer import SocialMediaAnalyzer
from models.document_analyzer import DocumentAnalyzer
from utils.auth import verify_signature
from utils.blockchain import update_blockchain_scores

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React application address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analyzer classes
social_analyzer = SocialMediaAnalyzer()
document_analyzer = DocumentAnalyzer()

@app.post("/api/linkedin/token")
async def get_linkedin_token(code: str) -> Dict:
    try:
        # Get LinkedIn token
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://www.linkedin.com/oauth/v2/accessToken',
                data={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'client_id': os.getenv('LINKEDIN_CLIENT_ID'),
                    'client_secret': os.getenv('LINKEDIN_CLIENT_SECRET'),
                    'redirect_uri': os.getenv('LINKEDIN_REDIRECT_URI')
                }
            ) as response:
                token_data = await response.json()
                
                if 'access_token' not in token_data:
                    raise HTTPException(status_code=400, detail="Could not get LinkedIn token")
                
                # Get profile information
                async with session.get(
                    'https://api.linkedin.com/v2/me',
                    headers={'Authorization': f"Bearer {token_data['access_token']}"}
                ) as profile_response:
                    profile_data = await profile_response.json()
                    
                    return {
                        'accessToken': token_data['access_token'],
                        'profileId': profile_data['id']
                    }
                    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/profile")
async def analyze_profile(
    linkedin_access_token: Optional[str] = Form(None),
    twitter_access_token: Optional[str] = Form(None),
    profile_data: UploadFile = Form(...)
):
    try:
        # Read profile data
        profile_content = await profile_data.read()
        profile_json = json.loads(profile_content)
        
        print("Incoming profile data:", profile_json)
        
        # Prepare social media data
        social_data = {}
        
        # Add LinkedIn data
        if linkedin_access_token:
            linkedin_profile = profile_json.get('linkedin', {})
            if linkedin_profile and linkedin_profile.get('profileId'):
                social_data['linkedin'] = {
                    'accessToken': linkedin_access_token,
                    'profileId': linkedin_profile['profileId']
                }
                print("LinkedIn data added")
            else:
                print("LinkedIn profile ID not found")
        
        # Add Twitter data
        twitter_profile = profile_json.get('twitter', {})
        if twitter_profile and twitter_profile.get('username'):
            social_data['twitter'] = {
                'username': twitter_profile['username']
            }
            print(f"Twitter data added: {twitter_profile['username']}")
        else:
            print("Twitter username not found")
        
        if not social_data:
            raise HTTPException(
                status_code=400,
                detail="At least one social media profile (LinkedIn or Twitter) required"
            )
        
        # Get analysis results
        print("Starting social media analysis...")
        results = await social_analyzer.analyze_profiles(social_data)
        print("Analysis results:", results)
        
        if not results or not results.get('overall'):
            raise HTTPException(
                status_code=400,
                detail="Profile analysis failed: Insufficient data"
            )
            
        return results
        
    except json.JSONDecodeError as e:
        print("JSON parsing error:", str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        print("General error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/document")
async def analyze_document(
    file: UploadFile,
    timestamp: str = Form(...),
    signature: str = Form(...),
    address: str = Form(...)
) -> Dict:
    try:
        # Verify signature
        message = f"Document Verification Request\nTimestamp: {timestamp}\nFile: {file.filename}"
        if not verify_signature(message, signature, address):
            raise HTTPException(status_code=401, detail="Invalid signature")
            
        # Determine file type
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in ['pdf', 'docx', 'txt']:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Analyze document
            analysis_result = await document_analyzer.analyze_document(
                temp_file.name,
                file_ext
            )
            
        # Delete temporary file
        os.unlink(temp_file.name)
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "AI service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)