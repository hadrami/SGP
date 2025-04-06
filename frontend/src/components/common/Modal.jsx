// Create a reusable Modal component that handles focus better
// This should be a new file: src/components/common/Modal.jsx

import React, { useEffect, useCallback, useRef } from 'react';

/**
 * A reusable modal component that properly handles focus and events
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  
  // Handle ESC key to close modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  // Handle clicking outside to close
  const handleBackdropClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);
  
  // Setup event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleBackdropClick);
      
      // Prevent body from scrolling
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleBackdropClick);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown, handleBackdropClick]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default Modal;