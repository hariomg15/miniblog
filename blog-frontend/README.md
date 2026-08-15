# Blog Frontend

This frontend is built with React and Vite for the Blog Management System project.

## Features Supported
- User signup and login
- Role display for the current account
- Create, edit, and delete posts
- Category selection for posts
- Search and category filter
- Pagination for post listing

## Run the Frontend
```powershell
cd blog-frontend
copy .env.example .env
npm install
npm run dev
```

## Environment Variable
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Development URL
```text
http://localhost:5173
```

## Main Frontend Files
- `src/App.jsx` controls basic page switching
- `src/api.js` contains API request helpers
- `src/pages/Login.jsx` handles user login
- `src/pages/Signup.jsx` handles user registration
- `src/pages/Posts.jsx` handles post management, search, filters, and pagination
