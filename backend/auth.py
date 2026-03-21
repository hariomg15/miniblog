from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models

SECRET_KEY = "hariom-blog-2025-xK9mP3qR7wL2nJ8v"
ALGORITHM   = "HS256"
EXPIRE_MIN  = 30

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire    = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str     = Depends(oauth2_scheme),
    db: Session    = Depends(get_db)
):
    err = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail      = "Token invalid ya expire ho gaya",
        headers     = {"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise err
    except JWTError:
        raise err
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None: raise err
    return user