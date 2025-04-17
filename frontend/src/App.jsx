// Updated App.jsx with simpler, more reliable authentication flow

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyAuth } from './redux/slices/authSlice';

// Import components
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import MilitairesList from './pages/militaires/MilitairesList';
import MilitaireDetail from './pages/militaires/MilitaireDetail';
import MilitaireForm from './pages/militaires/MilitaireForm';
import MilitairesByCategory from './pages/militaires/MilitairesByCategory';
import MilitairesPrintPage from './pages/militaires/MilitairesPrintPage';
import UniteDetail from './pages/unites/UniteDetail';
import './App.css';

// Loading component for cleaner code
const LoadingSpinner = ({ message = "Chargement..." }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#40916c]"></div>
      <p className="mt-2 text-gray-500">{message}</p>
    </div>
  </div>
);

// Simplified ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  
  if (isLoading) {
    return <LoadingSpinner message="Vérification de l'authentification..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  // Single authentication check on app load
  useEffect(() => {
    const checkAuth = async () => {
      // Only check if auth status is unknown
      if (!authCheckComplete && !isLoading) {
        try {
          // Check for token before dispatching to prevent unnecessary API calls
          const hasToken = !!localStorage.getItem('token');
          
          if (hasToken) {
            await dispatch(verifyAuth()).unwrap();
          }
        } catch (error) {
          console.log('Auth verification complete - no valid session');
        } finally {
          setAuthCheckComplete(true);
        }
      }
    };
    
    checkAuth();
  }, [dispatch, authCheckComplete, isLoading]);
  
  // Show loading spinner while doing initial auth check
  if (!authCheckComplete) {
    return <LoadingSpinner message="Initialisation de l'application..." />;
  }
  
  return (
    <Router>
      <Routes>
        {/* Public route with auth redirection */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        {/* Protected routes inside DashboardLayout */}
        <Route 
          path="/" 
          element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Militaires routes */}
          <Route path="militaires" element={<MilitairesList />} />
          <Route path="militaires/new" element={<MilitaireForm />} />
          <Route path="militaires/:id" element={<MilitaireDetail />} />
          <Route path="militaires/edit/:id" element={<MilitaireForm />} />
          <Route path="militaires/categorie/:category" element={<MilitairesByCategory />} />
          <Route path="/militaires/print" element={<MilitairesPrintPage />} />
          {/* Generic route that will handle all institutes, directions, and PC */}
          <Route path="/:type/:code" element={<UniteDetail />} />
          {/* You could also have specific routes if needed */}
          <Route path="/instituts/:code" element={<UniteDetail />} />
          <Route path="/directions/:code" element={<UniteDetail />} />
          <Route path="/pc/:code" element={<UniteDetail />} />
  
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;