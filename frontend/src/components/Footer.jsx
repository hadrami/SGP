// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#3D3D3D] text-white py-1 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <span>© {currentYear} Groupe Polytechnique - SGP</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;