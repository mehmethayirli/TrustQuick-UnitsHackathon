from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv
from eth_account.messages import encode_defunct
from web3 import Web3

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username

def verify_signature(message: str, signature: str, address: str) -> bool:
    """
    Units Network imzasını doğrular.
    
    Args:
        message: İmzalanan mesaj
        signature: İmza
        address: İmzalayan adres
        
    Returns:
        bool: İmza geçerli ise True, değilse False
    """
    try:
        w3 = Web3()
        
        # Mesajı encode et
        message_hash = encode_defunct(text=message)
        
        # İmzadan adresi çıkar
        recovered_address = w3.eth.account.recover_message(
            message_hash,
            signature=signature
        )
        
        # Adresleri karşılaştır
        return recovered_address.lower() == address.lower()
        
    except Exception as e:
        print(f"İmza doğrulama hatası: {e}")
        return False