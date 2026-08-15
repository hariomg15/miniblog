from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    # class Config: orm_mode = True
    class Config: from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PostCreate(BaseModel):
    title: str
    content: str
    category: str = "General"
    published: Optional[bool] = True

class PostUpdate(BaseModel):
    title: str
    content: str
    category: str = "General"
    published: Optional[bool] = True

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    published: bool
    user_id: int
    # class Config: orm_mode = True
    class Config: from_attributes = True


class PostListResponse(BaseModel):
    items: list[PostOut]
    total: int
    page: int
    page_size: int
    total_pages: int
