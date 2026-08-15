import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CreateQuiz from './pages/CreateQuiz';
import ManageQuestions from './pages/ManageQuestions';

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

// Temp dashboard for student
const TempStudentDashboard = () => {
  const { logout } = useContext(AuthContext);
  return <div className="p-8"><h1 className="text-2xl font-bold">Student View</h1><button onClick={logout} className="btn-primary mt-4 w-auto px-4">Logout</button></div>;
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
              <TempStudentDashboard />
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
