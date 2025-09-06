import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout/Layout';
import { LoginForm } from './components/Auth/LoginForm';
import { LoadingSpinner } from './components/Common/LoadingSpinner';

// Student Pages
import { StudentDashboard } from './pages/Student/StudentDashboard';
import { TestPage } from './pages/Student/TestPage';

// Teacher Pages
import { QuestionBank } from './pages/Teacher/QuestionBank';
import { TestManagement } from './pages/Teacher/TestManagement';
import { LiveMonitoring } from './pages/Teacher/LiveMonitoring';

// Admin Pages
import { UserManagement } from './pages/Admin/UserManagement';

// Shared Pages
function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }
  
  // For teachers and admins, show basic dashboard
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-blue-100">Role: {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}</p>
        <p className="text-blue-100">School: {user?.school_name}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <p className="text-gray-600">Use the navigation menu to access different features based on your role.</p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Student Routes */}
        <Route 
          path="/student-tests" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/test/:testId" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/results" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <div className="text-center py-8">
                <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
                <p className="text-gray-600">Your test results will appear here.</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher Routes */}
        <Route 
          path="/questions" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <QuestionBank />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tests" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TestManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/monitoring" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <LiveMonitoring />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <div className="text-center py-8">
                <h2 className="text-lg font-semibold text-gray-900">Analytics & Results</h2>
                <p className="text-gray-600">Test analytics and student performance data will appear here.</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;