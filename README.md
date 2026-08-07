# Mini Blog API

Full-stack blog application with JWT authentication.

## Tech Stack
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, JWT Auth
- **Frontend**: React (Vite), Fetch API

## Features
- User signup & login with JWT authentication
- Create, read, delete blog posts
- Protected routes - only logged-in users can post
- PostgreSQL database with relationships

## Environment Setup

### Backend
```bash
cd backend
copy .env.example .env
```

Update `backend/.env` with your own values:

```env
DATABASE_URL=sqlite:///./blog.db
SECRET_KEY=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
```

For PostgreSQL, replace it with your own connection string, for example:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5433/blogdb
```

Then run:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd blog-frontend
copy .env.example .env
npm install
npm run dev
```

Frontend env:

```env
VITE_API_BASE_URL=http://localhost:8000
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
