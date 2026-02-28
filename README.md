# Team Task Manager

A full-stack web application for managing teams and tasks.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios  
**Backend:** Python, Django, Django REST Framework  
**Auth:** JWT (djangorestframework-simplejwt)  
**Database:** SQLite (dev)

## Features

- User registration and login with JWT authentication
- Create and manage teams
- Add members to teams
- Create, assign, update and delete tasks
- Filter tasks by status, assignee, or search by title
- Protected routes (login required)
- Clean responsive UI

## Setup Instructions

### Backend
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```
cd frontend
npm install
npm run dev
```

### Environment
- Backend runs on: http://localhost:8000
- Frontend runs on: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register/ | Register new user |
| POST | /auth/login/ | Login |
| GET | /auth/me/ | Get current user |
| GET/POST | /teams/ | List/Create teams |
| GET/PUT/DELETE | /teams/:id/ | Team detail |
| POST | /teams/:id/add-member/ | Add member to team |
| GET/POST | /tasks/ | List/Create tasks |
| GET/PUT/DELETE | /tasks/:id/ | Task detail |

## Git Branches
- `main` - production ready code
- `backend` - backend development
- `frontend` - frontend development
```

---

Also create a `requirements.txt` for the backend. Run:
```
cd D:\TaskInternship\backend
venv\Scripts\activate
pip freeze > requirements.txt
```

Then commit:
```
cd D:\TaskInternship
git add .
git commit -m "Add README and requirements.txt"
git push origin backend
git push origin backend:main --force