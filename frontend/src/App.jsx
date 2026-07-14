import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPortfolio from './components/MainPortfolio';

// Lazy load admin routes to optimize bundle size and page load speed
const Login = React.lazy(() => import('./admin/Login'));
const Register = React.lazy(() => import('./admin/Register'));
const Dashboard = React.lazy(() => import('./admin/Dashboard'));

// Loading fallback spinner for lazy-loaded route chunks
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-[#02050E] flex items-center justify-center text-orange-500 transition-colors duration-300">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);

// Client-side authentication guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<MainPortfolio />} />
          
          {/* Admin Authentication routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect admin root to dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
