// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError, logout } from '../../redux/slices/authSlice';
import Footer from '../../components/Footer';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isAuthenticated, token } = useSelector(state => state.auth);

// Add this delayed redirect effect
  useEffect(() => {
    let redirectTimer;
    
    if (isAuthenticated && token) {
      // Important: Delay the redirect to ensure token is saved to localStorage
      redirectTimer = setTimeout(() => {
        // Verify token exists in localStorage before redirecting
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          console.log('Token verified, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.error('Token missing from localStorage even after login');
          // Save again from Redux state if needed
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(
            useSelector(state => state.auth.user)
          ));
          // Try redirecting again after a moment
          setTimeout(() => navigate('/dashboard'), 300);
        }
      }, 300); // 300ms delay to ensure token is saved
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isAuthenticated, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear any existing errors before attempting login
    dispatch(clearError());
    // Attempt login
    await dispatch(login({ identifier, password }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-yellow-50 p-8 rounded-lg shadow-lg border border-[#90e0ef] border-opacity-50">
          <div>
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <img 
                src="/assets/gp-logo.png" 
                alt="GP Logo" 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#40916c]">
              Connexion
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Entrez vos identifiants pour accéder au système
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Identifiant
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-[#90e0ef] rounded-md shadow-sm focus:outline-none focus:ring-[#40916c] focus:border-[#40916c]"
                placeholder="Votre identifiant"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-[#90e0ef] rounded-md shadow-sm focus:outline-none focus:ring-[#40916c] focus:border-[#40916c]"
                placeholder="Votre mot de passe"
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-12 flex justify-center py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#40916c] hover:bg-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#40916c] disabled:opacity-50"
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;