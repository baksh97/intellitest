from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, questions, tests, submissions, monitoring
from app.core.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IntelliTest API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://localhost:8080",  # Vue dev server
        "http://localhost:4200",  # Angular dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(tests.router, prefix="/api/tests", tags=["tests"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])

@app.get("/")
async def root():
    return {"message": "IntelliTest API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
