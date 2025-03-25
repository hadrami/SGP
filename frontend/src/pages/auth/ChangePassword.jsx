// src/pages/auth/ChangePassword.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePassword, clearError } from '../../redux/slices/authSlice';
import Footer from '../../components/Footer';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isLoading, error, requirePasswordChange } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Redirect if not on first login
    if (!requirePasswordChange) {
      navigate('/dashboard');
    }
  }, [navigate, requirePasswordChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationError('');
    dispatch(clearError());
    
    // Validate passwords
    if (newPassword.length < 6) {
      setValidationError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas');
      return;
    }
    
    // Submit password change
    dispatch(
      changePassword({
        identifier: user.identifier,
        currentPassword,
        newPassword
      })
    ).then((result) => {
      if (!result.error) {
        navigate('/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative z-10 flex-shrink-0 bg-[#ffff3f] shadow h-20">
        <div className="w-full h-full flex items-center justify-center px-4">
          {/* Logo and text centered with smaller logo */}
          <div className="flex items-center justify-center">
            <img 
              src="/assets/gp-logo.png" 
              alt="GP Logo" 
              className="w-6 h-6 object-contain mr-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-xl font-semibold text-[#40916c]">
              Gestion du Personnel
            </h1>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg border border-[#90e0ef] border-opacity-50">
          <div>
            <h2 className="text-center text-2xl font-extrabold text-[#40916c]">
              Changement de mot de passe
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Veuillez changer votre mot de passe temporaire
            </p>
          </div>
          
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || validationError}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-[#90e0ef] rounded-md shadow-sm focus:outline-none focus:ring-[#40916c] focus:border-[#40916c]"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-[#90e0ef] rounded-md shadow-sm focus:outline-none focus:ring-[#40916c] focus:border-[#40916c]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 6 caractères
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-[#90e0ef] rounded-md shadow-sm focus:outline-none focus:ring-[#40916c] focus:border-[#40916c]"
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-12 flex justify-center py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#40916c] hover:bg-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#40916c] disabled:opacity-50"
              >
                {isLoading ? 'Traitement en cours...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChangePassword;