from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    is_live = Column(Boolean, default=False)
    assigned_classes = Column(String, nullable=True)  # Comma-separated class names
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=None)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    
    # Relationships
    creator = relationship("User", back_populates="created_tests")
    test_questions = relationship("TestQuestion", back_populates="test")
    submissions = relationship("Submission", back_populates="test")

class TestQuestion(Base):
    __tablename__ = "test_questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    order = Column(Integer, nullable=False)
    
    # Relationships
    test = relationship("Test", back_populates="test_questions")
    question = relationship("Question", back_populates="test_questions")
