from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.test import Test, TestQuestion
from app.models.question import Question
from app.schemas.test import TestCreate, TestUpdate, TestResponse, TestWithQuestions
from app.api.dependencies import get_current_active_user, require_admin_or_teacher

router = APIRouter()

@router.get("/", response_model=List[TestResponse])
async def read_tests(
    skip: int = 0,
    limit: int = 100,
    is_live: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Test)
    
    # Students can only see tests assigned to their class
    if current_user.role == UserRole.STUDENT:
        if current_user.class_name:
            query = query.filter(Test.assigned_classes.contains(current_user.class_name))
        else:
            query = query.filter(Test.assigned_classes.is_(None))
    
    # Teachers and admins can see all tests
    if is_live is not None:
        query = query.filter(Test.is_live == is_live)
    
    tests = query.offset(skip).limit(limit).all()
    return tests

@router.post("/", response_model=TestResponse)
async def create_test(
    test: TestCreate,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    # Verify all questions exist
    questions = db.query(Question).filter(Question.id.in_(test.question_ids)).all()
    if len(questions) != len(test.question_ids):
        raise HTTPException(
            status_code=400,
            detail="Some questions not found"
        )
    
    db_test = Test(
        name=test.name,
        description=test.description,
        duration_minutes=test.duration_minutes,
        assigned_classes=test.assigned_classes,
        created_by=current_user.id
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    
    # Add questions to test
    for i, question_id in enumerate(test.question_ids):
        test_question = TestQuestion(
            test_id=db_test.id,
            question_id=question_id,
            order=i + 1
        )
        db.add(test_question)
    
    db.commit()
    return db_test

@router.get("/{test_id}", response_model=TestWithQuestions)
async def read_test(
    test_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Check if student has access to this test
    if current_user.role == UserRole.STUDENT:
        if current_user.class_name and test.assigned_classes:
            if current_user.class_name not in test.assigned_classes.split(','):
                raise HTTPException(status_code=403, detail="Not authorized to access this test")
    
    # Get questions for this test
    test_questions = db.query(TestQuestion).filter(TestQuestion.test_id == test_id).order_by(TestQuestion.order).all()
    question_ids = [tq.question_id for tq in test_questions]
    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
    
    # Sort questions by order
    question_dict = {q.id: q for q in questions}
    ordered_questions = [question_dict[qid] for qid in question_ids]
    
    return TestWithQuestions(
        **test.__dict__,
        questions=ordered_questions
    )

@router.put("/{test_id}", response_model=TestResponse)
async def update_test(
    test_id: int,
    test_update: TestUpdate,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    db_test = db.query(Test).filter(Test.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    update_data = test_update.dict(exclude_unset=True)
    
    # Handle question updates
    if "question_ids" in update_data:
        # Remove existing test questions
        db.query(TestQuestion).filter(TestQuestion.test_id == test_id).delete()
        
        # Add new questions
        for i, question_id in enumerate(update_data["question_ids"]):
            test_question = TestQuestion(
                test_id=test_id,
                question_id=question_id,
                order=i + 1
            )
            db.add(test_question)
        
        del update_data["question_ids"]
    
    for field, value in update_data.items():
        setattr(db_test, field, value)
    
    db.commit()
    db.refresh(db_test)
    return db_test

@router.delete("/{test_id}")
async def delete_test(
    test_id: int,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    db_test = db.query(Test).filter(Test.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    db.delete(db_test)
    db.commit()
    return {"message": "Test deleted successfully"}
