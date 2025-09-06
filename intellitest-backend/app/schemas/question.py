from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestionBase(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    topic: Optional[str] = None
    difficulty_level: str = "medium"
    image_url: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answer: Optional[str] = None
    topic: Optional[str] = None
    difficulty_level: Optional[str] = None
    image_url: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    created_by: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
