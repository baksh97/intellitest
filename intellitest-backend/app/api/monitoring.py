from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.user import User
from app.models.test import Test
from app.models.submission import Submission, SubmissionAnswer
from app.api.dependencies import require_admin_or_teacher

router = APIRouter()

@router.get("/live-tests")
async def get_live_tests(
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    live_tests = db.query(Test).filter(Test.is_live == True).all()
    return live_tests

@router.get("/test/{test_id}/progress")
async def get_test_progress(
    test_id: int,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    # Verify test exists
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get all submissions for this test
    submissions = db.query(Submission).filter(Submission.test_id == test_id).all()
    
    progress_data = []
    for submission in submissions:
        # Get student info
        student = db.query(User).filter(User.id == submission.student_id).first()
        
        # Get answers for this submission
        answers = db.query(SubmissionAnswer).filter(
            SubmissionAnswer.submission_id == submission.id
        ).all()
        
        # Count attempted questions
        attempted = len([a for a in answers if a.selected_answer is not None])
        
        progress_data.append({
            "student_id": submission.student_id,
            "student_name": student.full_name if student else "Unknown",
            "student_class": student.class_name if student else None,
            "attempted_questions": attempted,
            "total_questions": submission.total_questions,
            "status": "Submitted" if submission.submitted_at else "In Progress",
            "started_at": submission.started_at,
            "submitted_at": submission.submitted_at,
            "score": submission.score
        })
    
    return {
        "test_id": test_id,
        "test_name": test.name,
        "total_students": len(progress_data),
        "submitted_count": len([p for p in progress_data if p["status"] == "Submitted"]),
        "in_progress_count": len([p for p in progress_data if p["status"] == "In Progress"]),
        "students": progress_data
    }

@router.get("/test/{test_id}/analytics")
async def get_test_analytics(
    test_id: int,
    current_user: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db)
):
    # Verify test exists
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get all submissions for this test
    submissions = db.query(Submission).filter(Submission.test_id == test_id).all()
    
    if not submissions:
        return {
            "test_id": test_id,
            "test_name": test.name,
            "total_submissions": 0,
            "average_score": 0,
            "score_distribution": {},
            "question_analysis": []
        }
    
    # Calculate average score
    scores = [s.score for s in submissions if s.score is not None]
    average_score = sum(scores) / len(scores) if scores else 0
    
    # Score distribution
    score_ranges = {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-80": 0,
        "81-100": 0
    }
    
    for score in scores:
        if score <= 20:
            score_ranges["0-20"] += 1
        elif score <= 40:
            score_ranges["21-40"] += 1
        elif score <= 60:
            score_ranges["41-60"] += 1
        elif score <= 80:
            score_ranges["61-80"] += 1
        else:
            score_ranges["81-100"] += 1
    
    # Question-level analysis
    question_analysis = []
    # This would require more complex queries to analyze each question
    # For now, return basic structure
    
    return {
        "test_id": test_id,
        "test_name": test.name,
        "total_submissions": len(submissions),
        "average_score": round(average_score, 2),
        "score_distribution": score_ranges,
        "question_analysis": question_analysis
    }
