from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from app.api.dependencies import require_admin_or_teacher

router = APIRouter()

@router.get("/", response_model=List[QuestionResponse])
async def read_questions(
    skip: int = 0,
    limit: int = 100,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    
    if topic:
        query = query.filter(Question.topic.ilike(f"%{topic}%"))
    
    if search:
        query = query.filter(Question.question_text.ilike(f"%{search}%"))
    
    questions = query.offset(skip).limit(limit).all()
    return questions

@router.post("/", response_model=QuestionResponse)
async def create_question(
    question: QuestionCreate,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    db_question = Question(
        question_text=question.question_text,
        option_a=question.option_a,
        option_b=question.option_b,
        option_c=question.option_c,
        option_d=question.option_d,
        correct_answer=question.correct_answer,
        topic=question.topic,
        difficulty_level=question.difficulty_level,
        image_url=question.image_url,
        created_by=current_user.id
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/{question_id}", response_model=QuestionResponse)
async def read_question(
    question_id: int,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_update: QuestionUpdate,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    update_data = question_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_question, field, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

@router.delete("/{question_id}")
async def delete_question(
    question_id: int,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(db_question)
    db.commit()
    return {"message": "Question deleted successfully"}
