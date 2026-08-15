import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CreateQuiz from './pages/CreateQuiz';
import ManageQuestions from './pages/ManageQuestions';
import StudentDashboard from './pages/StudentDashboard';
import QuizTaking from './pages/QuizTaking';
import QuizResult from './pages/QuizResult';
import Leaderboard from './pages/Leaderboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600 font-bold">Unauthorized Access</div>;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/quiz/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <QuizTaking />
            </ProtectedRoute>
          } />

          <Route path="/result/:id" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <QuizResult />
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard/:id" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Leaderboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-quiz" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateQuiz />
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-questions/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageQuestions />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
