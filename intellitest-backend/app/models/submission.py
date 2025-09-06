from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)
    total_questions = Column(Integer, nullable=True)
    attempted_questions = Column(Integer, nullable=True)
    is_auto_submitted = Column(String, default="false")  # 'true' or 'false'
    
    # Relationships
    test = relationship("Test", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    answers = relationship("SubmissionAnswer", back_populates="submission")

class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_answer = Column(String, nullable=True)  # 'A', 'B', 'C', 'D', or None
    is_correct = Column(String, nullable=True)  # 'true', 'false', or None
    answered_at = Column(DateTime, nullable=True)
    
    # Relationships
    submission = relationship("Submission", back_populates="answers")
    question = relationship("Question", back_populates="submission_answers")
