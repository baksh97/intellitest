export const API_BASE_URL = 'https://d5f4f6894432.ngrok-free.app';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login-json',
  
  // Users
  USERS_ME: '/api/users/me',
  USERS: '/api/users',
  
  // Questions
  QUESTIONS: '/api/questions',
  
  // Tests
  TESTS: '/api/tests',
  
  // Submissions
  SUBMISSIONS: '/api/submissions',
  MY_SUBMISSIONS: '/api/submissions/my-submissions',
  TEST_SUBMISSIONS: (testId: number) => `/api/submissions/test/${testId}`,
  
  // Monitoring
  LIVE_TESTS: '/api/monitoring/live-tests',
  TEST_PROGRESS: (testId: number) => `/api/monitoring/test/${testId}/progress`,
  TEST_ANALYTICS: (testId: number) => `/api/monitoring/test/${testId}/analytics`,
} as const;