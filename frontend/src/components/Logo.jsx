// src/components/Logo.jsx
import React from 'react';

const Logo = ({ size = 'md', className = '', withFallback = true }) => {
  // Size variants
  const sizeClasses = {
    xs: 'w-16 h-16',    // Extra small (24px)
    sm: 'w-18 h-18',    // Small (32px)
    md: 'w-20 h-20',  // Medium (40px)
    lg: 'w-26 h-26',  // Large (64px)
    xl: 'w-30 h-30',  // Extra large (80px)
    custom: '',       // For custom sizing via className
  };

  // Fallback SVG as base64 data URI
  const fallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%2340916c' /%3E%3Ctext x='50' y='65' font-family='Arial' font-size='30' text-anchor='middle' fill='white'%3EGP%3C/text%3E%3C/svg%3E";

  // Add console log for debugging
  console.log('Attempting to load logo from: /assets/gp-logo.png');
  
  return (
    <img
      src="/assets/gp-logo.png" // Make sure this matches your file name exactly
      alt="GP Logo"
      className={`object-contain ${size === 'custom' ? '' : sizeClasses[size]} ${className}`}
      onError={(e) => {
        console.log('Logo image failed to load, using fallback');
        if (withFallback) {
          e.target.onerror = null;
          e.target.src = fallbackSvg;
        } else {
          e.target.onerror = null;
          e.target.style.display = 'none';
        }
      }}
    />
  );
};

export default Logo;