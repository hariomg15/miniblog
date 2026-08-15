from typing import List
import re

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, text

import auth
import models
import schemas
from config import get_env
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI()
EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
ALLOWED_CATEGORIES = {
    "General",
    "Technology",
    "Education",
    "Lifestyle",
    "Announcements",
}


def ensure_role_column() -> None:
    with engine.begin() as connection:
        columns = []
        try:
            columns = [row[1] for row in connection.execute(text("PRAGMA table_info(users)"))]
        except Exception:
            return

        if "role" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'user'")
            )


ensure_role_column()


def ensure_post_category_column() -> None:
    with engine.begin() as connection:
        columns = []
        try:
            columns = [row[1] for row in connection.execute(text("PRAGMA table_info(posts)"))]
        except Exception:
            return

        if "category" not in columns:
            connection.execute(
                text("ALTER TABLE posts ADD COLUMN category VARCHAR NOT NULL DEFAULT 'General'")
            )


ensure_post_category_column()


def validate_auth_input(email: str, password: str) -> None:
    normalized_email = email.strip()
    if not EMAIL_PATTERN.fullmatch(normalized_email):
        raise HTTPException(400, "Enter a valid email address")
    if len(password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters long")
    if len(password.encode("utf-8")) > 72:
        raise HTTPException(400, "Password must not exceed 72 bytes")


def normalize_category(category: str | None) -> str:
    cleaned = (category or "General").strip()
    if not cleaned:
        cleaned = "General"
    normalized = cleaned.title()
    if normalized not in ALLOWED_CATEGORIES:
        allowed = ", ".join(sorted(ALLOWED_CATEGORIES))
        raise HTTPException(400, f"Category must be one of: {allowed}")
    return normalized

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


@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    validate_auth_input(user.email, user.password)
    email = user.email.strip().lower()
    exists = db.query(models.User).filter(
        models.User.email == email).first()
    if exists:
        raise HTTPException(400, "Email is already registered")
    user_count = db.query(models.User).count()
    new_user = models.User(
        email=email,
        hashed_password=auth.hash_password(user.password),
        role="admin" if user_count == 0 else "user")
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user


@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    validate_auth_input(user.email, user.password)
    email = user.email.strip().lower()
    db_user = db.query(models.User).filter(
        models.User.email == email).first()
    if not db_user or not auth.verify_password(
            user.password, db_user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    token = auth.create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/posts", response_model=schemas.PostListResponse)
def get_posts(
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    query = db.query(models.Post)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Post.title.ilike(term),
                models.Post.content.ilike(term),
                models.Post.category.ilike(term),
            )
        )

    if category and category.strip() and category.strip().lower() != "all":
        query = query.filter(models.Post.category == normalize_category(category))

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    items = (
        query.order_by(models.Post.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

@app.post("/posts", response_model=schemas.PostOut)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    new_post = models.Post(
        title=post.title,
        content=post.content,
        category=normalize_category(post.category),
        published=post.published,
        user_id=current_user.id,
    )
    db.add(new_post); db.commit(); db.refresh(new_post)
    return new_post

@app.put("/posts/{post_id}", response_model=schemas.PostOut)
def update_post(
    post_id: int,
    post_data: schemas.PostUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "You are not allowed to edit this post")

    post.title = post_data.title
    post.content = post_data.content
    post.category = normalize_category(post_data.category)
    post.published = post_data.published if post_data.published is not None else post.published
    db.commit()
    db.refresh(post)
    return post

@app.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post: raise HTTPException(404, "Post not found")
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "You are not allowed to delete this post")
    db.delete(post); db.commit()
    return {"message": "Post deleted successfully"}

@app.get("/me", response_model=schemas.UserOut)
def get_me(current_user = Depends(auth.get_current_user)):
    return current_user


@app.get("/categories", response_model=List[str])
def get_categories():
    return sorted(ALLOWED_CATEGORIES)

