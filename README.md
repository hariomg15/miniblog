# Blog Management System

Full-stack blog management application built with FastAPI and React. The system supports user authentication, role-based access, category-based post organization, search, and pagination.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite/PostgreSQL, JWT authentication
- **Frontend**: React with Vite
- **Database**: SQLite by default, PostgreSQL supported through environment configuration

## Core Features
- User signup and login
- JWT-based authentication
- Role-based access with `admin` and `user`
- Create, edit, view, and delete blog posts
- Category-based post organization
- Search by title, content, or category
- Pagination for post listing
- Basic input validation for email and password

## Project Structure
```text
backend/
  auth.py
  config.py
  database.py
  main.py
  models.py
  requirements.txt
  schemas.py

blog-frontend/
  src/
    api.js
    App.jsx
    pages/
      Login.jsx
      Posts.jsx
      Signup.jsx
```

## Environment Setup

### Backend
```powershell
cd backend
copy .env.example .env
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Default backend environment:

```env
DATABASE_URL=sqlite:///./blog.db
SECRET_KEY=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
```

Optional PostgreSQL example:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5433/blogdb
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend
```powershell
cd blog-frontend
copy .env.example .env
npm install
npm run dev
```

Frontend environment:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Frontend URL:

```text
http://localhost:5173
```

## Main API Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Authenticate user and issue token |
| GET | `/me` | Yes | Get current logged-in user |
| GET | `/posts` | No | List posts with search and pagination |
| POST | `/posts` | Yes | Create a post |
| PUT | `/posts/{id}` | Yes | Edit a post |
| DELETE | `/posts/{id}` | Yes | Delete a post |
| GET | `/categories` | No | Fetch allowed categories |

## Default Role Logic
- The first registered account becomes `admin`
- All later accounts become `user`

## Testing Flow
1. Create the first account and log in as admin.
2. Create a second account and log in as a normal user.
3. Create posts in multiple categories.
4. Edit and delete posts.
5. Test search and category filter.
6. Create more than five posts to verify pagination.


