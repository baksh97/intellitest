from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.question import QuestionResponse

class TestBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    assigned_classes: Optional[str] = None

class TestCreate(TestBase):
    question_ids: List[int]

class TestUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_live: Optional[bool] = None
    assigned_classes: Optional[str] = None
    question_ids: Optional[List[int]] = None

class TestResponse(TestBase):
    id: int
    is_live: bool
    created_by: int
    created_at: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class TestWithQuestions(TestResponse):
    questions: List[QuestionResponse] = []
