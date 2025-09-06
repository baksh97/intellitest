from sqlalchemy.orm import Session
from datetime import datetime
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.question import Question
from app.models.test import Test, TestQuestion

def create_demo_users(db: Session):
    """Create demo users for testing"""
    
    # Demo Admin
    try:
        admin = User(
            username="admin",
            email="admin@demo.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Demo Admin",
            role=UserRole.ADMIN,
            school_name="Demo School",
            created_at=datetime.utcnow()
        )
        db.add(admin)
        db.commit()
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    
    # Demo Teacher
    try:
        teacher = User(
            username="teacher",
            email="teacher@demo.com",
            hashed_password=get_password_hash("teacher123"),
            full_name="Demo Teacher",
            role=UserRole.TEACHER,
            school_name="Demo School",
            created_at=datetime.utcnow()
        )
        db.add(teacher)
        db.commit()
    except Exception as e:
        print(f"Error creating teacher: {e}")
        db.rollback()
    
    # Demo Students
    students = [
        ("student1", "student1@demo.com", "John Doe", "Class A"),
        ("student2", "student2@demo.com", "Jane Smith", "Class A"),
        ("student3", "student3@demo.com", "Bob Johnson", "Class B"),
        ("student4", "student4@demo.com", "Alice Brown", "Class B"),
    ]
    
    for username, email, full_name, class_name in students:
        try:
            student = User(
                username=username,
                email=email,
                hashed_password=get_password_hash("student123"),
                full_name=full_name,
                role=UserRole.STUDENT,
                class_name=class_name,
                school_name="Demo School",
                created_at=datetime.utcnow()
            )
            db.add(student)
            db.commit()
        except Exception as e:
            print(f"Error creating student {username}: {e}")
            db.rollback()
    
    return admin, teacher

def create_demo_questions(db: Session, teacher_id: int):
    """Create demo questions"""
    
    questions_data = [
        {
            "question_text": "What is the capital of France?",
            "option_a": "London",
            "option_b": "Berlin",
            "option_c": "Paris",
            "option_d": "Madrid",
            "correct_answer": "C",
            "topic": "Geography",
            "difficulty_level": "easy"
        },
        {
            "question_text": "Which programming language is known for its use in web development?",
            "option_a": "Python",
            "option_b": "JavaScript",
            "option_c": "C++",
            "option_d": "Java",
            "correct_answer": "B",
            "topic": "Programming",
            "difficulty_level": "medium"
        },
        {
            "question_text": "What is 2 + 2?",
            "option_a": "3",
            "option_b": "4",
            "option_c": "5",
            "option_d": "6",
            "correct_answer": "B",
            "topic": "Mathematics",
            "difficulty_level": "easy"
        },
        {
            "question_text": "Which planet is known as the Red Planet?",
            "option_a": "Venus",
            "option_b": "Mars",
            "option_c": "Jupiter",
            "option_d": "Saturn",
            "correct_answer": "B",
            "topic": "Science",
            "difficulty_level": "easy"
        },
        {
            "question_text": "What is the largest mammal in the world?",
            "option_a": "African Elephant",
            "option_b": "Blue Whale",
            "option_c": "Giraffe",
            "option_d": "Hippopotamus",
            "correct_answer": "B",
            "topic": "Biology",
            "difficulty_level": "medium"
        },
        {
            "question_text": "Who wrote 'Romeo and Juliet'?",
            "option_a": "Charles Dickens",
            "option_b": "William Shakespeare",
            "option_c": "Mark Twain",
            "option_d": "Jane Austen",
            "correct_answer": "B",
            "topic": "Literature",
            "difficulty_level": "medium"
        },
        {
            "question_text": "What is the chemical symbol for gold?",
            "option_a": "Go",
            "option_b": "Gd",
            "option_c": "Au",
            "option_d": "Ag",
            "correct_answer": "C",
            "topic": "Chemistry",
            "difficulty_level": "medium"
        },
        {
            "question_text": "Which year did World War II end?",
            "option_a": "1944",
            "option_b": "1945",
            "option_c": "1946",
            "option_d": "1947",
            "correct_answer": "B",
            "topic": "History",
            "difficulty_level": "medium"
        },
        {
            "question_text": "What is the speed of light in vacuum?",
            "option_a": "300,000 km/s",
            "option_b": "299,792,458 m/s",
            "option_c": "186,000 miles/s",
            "option_d": "All of the above",
            "correct_answer": "D",
            "topic": "Physics",
            "difficulty_level": "hard"
        },
        {
            "question_text": "Which data structure follows LIFO principle?",
            "option_a": "Queue",
            "option_b": "Stack",
            "option_c": "Array",
            "option_d": "Linked List",
            "correct_answer": "B",
            "topic": "Computer Science",
            "difficulty_level": "medium"
        }
    ]
    
    questions = []
    for q_data in questions_data:
        question = Question(
            question_text=q_data["question_text"],
            option_a=q_data["option_a"],
            option_b=q_data["option_b"],
            option_c=q_data["option_c"],
            option_d=q_data["option_d"],
            correct_answer=q_data["correct_answer"],
            topic=q_data["topic"],
            difficulty_level=q_data["difficulty_level"],
            created_by=teacher_id,
            created_at=datetime.utcnow()
        )
        db.add(question)
        questions.append(question)
    
    db.commit()
    return questions

def create_demo_tests(db: Session, teacher_id: int, questions):
    """Create demo tests"""
    
    # Test 1: General Knowledge (Live)
    test1 = Test(
        name="General Knowledge Quiz",
        description="A quick quiz covering various topics",
        duration_minutes=15,
        is_live=True,
        assigned_classes="Class A,Class B",
        created_by=teacher_id,
        created_at=datetime.utcnow()
    )
    db.add(test1)
    db.commit()
    db.refresh(test1)
    
    # Add questions to test1 (first 5 questions)
    for i, question in enumerate(questions[:5]):
        test_question = TestQuestion(
            test_id=test1.id,
            question_id=question.id,
            order=i + 1
        )
        db.add(test_question)
    
    # Test 2: Science Test (Not Live)
    test2 = Test(
        name="Science Assessment",
        description="Comprehensive science test",
        duration_minutes=30,
        is_live=False,
        assigned_classes="Class A",
        created_by=teacher_id,
        created_at=datetime.utcnow()
    )
    db.add(test2)
    db.commit()
    db.refresh(test2)
    
    # Add questions to test2 (science-related questions)
    science_questions = [q for q in questions if q.topic in ["Science", "Biology", "Chemistry", "Physics"]]
    for i, question in enumerate(science_questions):
        test_question = TestQuestion(
            test_id=test2.id,
            question_id=question.id,
            order=i + 1
        )
        db.add(test_question)
    
    db.commit()
    return [test1, test2]

def init_demo_data(db: Session):
    """Initialize all demo data"""
    print("Creating demo users...")
    admin, teacher = create_demo_users(db)
    
    print("Creating demo questions...")
    questions = create_demo_questions(db, teacher.id)
    
    print("Creating demo tests...")
    tests = create_demo_tests(db, teacher.id, questions)
    
    print("Demo data created successfully!")
    print(f"Admin: username=admin, password=admin123")
    print(f"Teacher: username=teacher, password=teacher123")
    print(f"Students: username=student1-4, password=student123")
    
    return admin, teacher, questions, tests
