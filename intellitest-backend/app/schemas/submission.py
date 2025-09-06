from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SubmissionAnswerCreate(BaseModel):
    question_id: int
    selected_answer: Optional[str] = None

class SubmissionCreate(BaseModel):
    test_id: int
    answers: List[SubmissionAnswerCreate]

class SubmissionAnswerResponse(BaseModel):
    id: int
    question_id: int
    selected_answer: Optional[str] = None
    is_correct: Optional[str] = None
    answered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: int
    test_id: int
    student_id: int
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    score: Optional[float] = None
    total_questions: Optional[int] = None
    attempted_questions: Optional[int] = None
    is_auto_submitted: str = "false"
    answers: List[SubmissionAnswerResponse] = []

    class Config:
        from_attributes = True
