from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.test import Test
from app.models.submission import Submission, SubmissionAnswer
from app.models.question import Question
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.api.dependencies import get_current_active_user, require_admin_or_teacher

router = APIRouter()

@router.post("/", response_model=SubmissionResponse)
async def create_submission(
    submission: SubmissionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify test exists and is live
    test = db.query(Test).filter(Test.id == submission.test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    if not test.is_live:
        raise HTTPException(status_code=400, detail="Test is not live")
    
    # Check if student already has a submission for this test
    existing_submission = db.query(Submission).filter(
        Submission.test_id == submission.test_id,
        Submission.student_id == current_user.id
    ).first()
    
    if existing_submission:
        raise HTTPException(status_code=400, detail="Already submitted this test")
    
    # Create submission
    db_submission = Submission(
        test_id=submission.test_id,
        student_id=current_user.id,
        started_at=datetime.utcnow(),
        submitted_at=datetime.utcnow(),
        total_questions=len(submission.answers)
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Calculate score and create answers
    correct_count = 0
    attempted_count = 0
    
    for answer_data in submission.answers:
        question = db.query(Question).filter(Question.id == answer_data.question_id).first()
        if not question:
            continue
        
        is_correct = None
        if answer_data.selected_answer:
            attempted_count += 1
            is_correct = "true" if answer_data.selected_answer == question.correct_answer else "false"
            if is_correct == "true":
                correct_count += 1
        
        db_answer = SubmissionAnswer(
            submission_id=db_submission.id,
            question_id=answer_data.question_id,
            selected_answer=answer_data.selected_answer,
            is_correct=is_correct,
            answered_at=datetime.utcnow()
        )
        db.add(db_answer)
    
    # Update submission with score
    db_submission.score = (correct_count / len(submission.answers)) * 100 if submission.answers else 0
    db_submission.attempted_questions = attempted_count
    
    db.commit()
    db.refresh(db_submission)
    
    return db_submission

@router.get("/my-submissions", response_model=List[SubmissionResponse])
async def read_my_submissions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    submissions = db.query(Submission).filter(Submission.student_id == current_user.id).all()
    return submissions

@router.get("/test/{test_id}", response_model=List[SubmissionResponse])
async def read_test_submissions(
    test_id: int,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    # Verify test exists and user has access
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    submissions = db.query(Submission).filter(Submission.test_id == test_id).all()
    return submissions

@router.get("/{submission_id}", response_model=SubmissionResponse)
async def read_submission(
    submission_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check if user has access to this submission
    if current_user.role == UserRole.STUDENT and submission.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")
    
    return submission
