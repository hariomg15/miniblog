from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import auth
import models
import schemas
from config import get_env
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

allowed_origins = [
    origin.strip()
    for origin in get_env("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Signup ────────────────────────────────────────
@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    exists = db.query(models.User).filter(
        models.User.email == user.email).first()
    if exists:
        raise HTTPException(400, "Email already registered hai")
    new_user = models.User(
        email=user.email,
        hashed_password=auth.hash_password(user.password))
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

# ── Login ─────────────────────────────────────────
@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == user.email).first()
    if not db_user or not auth.verify_password(
            user.password, db_user.hashed_password):
        raise HTTPException(401, "Email ya password galat hai")
    token = auth.create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

# ── Posts ─────────────────────────────────────────
@app.get("/posts", response_model=List[schemas.PostOut])
def get_posts(db: Session = Depends(get_db)):
    return db.query(models.Post).all()

@app.post("/posts", response_model=schemas.PostOut)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    new_post = models.Post(**post.dict(), user_id=current_user.id)
    db.add(new_post); db.commit(); db.refresh(new_post)
    return new_post

@app.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post nahi mili")
    if post.user_id != current_user.id:
        raise HTTPException(403, "Teri post nahi hai")
    db.delete(post); db.commit()
    return {"message": "Deleted"}

@app.get("/me", response_model=schemas.UserOut)
def get_me(current_user = Depends(auth.get_current_user)):
    return current_user
