// src/pages/common/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page non trouvée</h2>
      <p className="text-gray-600 mt-2">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/dashboard" className="mt-6 btn-primary px-4 py-2">
        Retour au tableau de bord
      </Link>
    </div>
  );
}

export default NotFound;
