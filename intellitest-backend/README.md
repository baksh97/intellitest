# IntelliTest Backend

A FastAPI-based backend for the IntelliTest online test management system.

## Features

- JWT-based authentication with role-based access control
- User management (Students, Teachers, Admins)
- Question bank management
- Test creation and management
- Live test monitoring
- Submission handling and scoring
- Analytics and reporting

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database with demo data:
```bash
python init_db.py
```

3. Run the development server:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

## Demo Accounts

- **Admin**: username=`admin`, password=`admin123`
- **Teacher**: username=`teacher`, password=`teacher123`
- **Students**: username=`student1`, `student2`, `student3`, `student4`, password=`student123`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database

The application uses SQLite by default for easy setup. For production, configure PostgreSQL by setting the `DATABASE_URL` environment variable.
