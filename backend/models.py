from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active       = Column(Boolean, default=True)
    role            = Column(String, default="user", nullable=False)
    posts           = relationship("Post", back_populates="owner")

class Post(Base):
    __tablename__ = "posts"
    id        = Column(Integer, primary_key=True, index=True)
    title     = Column(String, nullable=False)
    content   = Column(String)
    category  = Column(String, default="General", nullable=False)
    published = Column(Boolean, default=True)
    user_id   = Column(Integer, ForeignKey("users.id"))
    owner     = relationship("User", back_populates="posts")
