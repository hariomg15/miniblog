# Mini Blog API

Full-stack blog application with JWT authentication.

## Tech Stack
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, JWT Auth
- **Frontend**: React (Vite), Fetch API

## Features
- User signup & login with JWT authentication
- Create, read, delete blog posts
- Protected routes — only logged-in users can post
- PostgreSQL database with relationships

## Setup

### Backend
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```
cd blog-frontend
npm install
npm run dev
```

## API Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /signup | No | Register user |
| POST | /login | No | Get JWT token |
| GET | /posts | No | Get all posts |
| POST | /posts | Yes | Create post |
| DELETE | /posts/{id} | Yes | Delete post |
| GET | /me | Yes | Current user |
