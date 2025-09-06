export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  class_name?: string;
  school_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  topic: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  image_url?: string;
  created_by: number;
  school_name: string;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  assigned_classes: string;
  is_live: boolean;
  created_by: number;
  school_name: string;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface TestAnswer {
  question_id: number;
  selected_answer: 'a' | 'b' | 'c' | 'd' | null;
}

export interface Submission {
  id: number;
  test_id: number;
  user_id: number;
  score: number;
  total_questions: number;
  attempted_questions: number;
  submitted_at: string;
  answers: TestAnswer[];
  test?: Test;
  user?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface TestProgress {
  user_id: number;
  user_name: string;
  class_name: string;
  attempted_questions: number;
  total_questions: number;
  status: 'not_started' | 'in_progress' | 'submitted';
  current_answers: Record<number, string>;
}

export interface TestAnalytics {
  total_submissions: number;
  average_score: number;
  pass_rate: number;
  score_distribution: Array<{ range: string; count: number }>;
  question_analytics: Array<{
    question_id: number;
    question_text: string;
    correct_rate: number;
    difficulty_perception: string;
  }>;
}