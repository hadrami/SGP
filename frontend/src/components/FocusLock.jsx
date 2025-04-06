// src/components/FocusLock.jsx
import React, { useState, useRef, useEffect } from 'react';

const FocusLock = ({ children }) => {
  const containerRef = useRef(null);
  const [activeElement, setActiveElement] = useState(null);

  useEffect(() => {
    const handleFocusIn = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) {
        setActiveElement(e.target);
      }
    };

    const handleFocusOut = () => {
      if (activeElement) {
        setTimeout(() => {
          activeElement.focus();
        }, 0);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [activeElement]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export default FocusLock;