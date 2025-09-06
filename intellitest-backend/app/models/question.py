from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)  # 'A', 'B', 'C', or 'D'
    topic = Column(String, nullable=True)
    difficulty_level = Column(String, default="medium")  # easy, medium, hard
    image_url = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=None)
    
    # Relationships
    test_questions = relationship("TestQuestion", back_populates="question")
    submission_answers = relationship("SubmissionAnswer", back_populates="question")
