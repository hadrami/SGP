// src/pages/common/Unauthorized.js
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Unauthorized() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500 mr-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-red-700">Accès refusé</h2>
        </div>
        <p className="text-red-700 mb-4">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <p className="text-gray-600">
          Veuillez contacter votre administrateur si vous pensez qu'il s'agit
          d'une erreur.
        </p>
      </div>

      <Link to="/dashboard" className="btn-primary">
        Retour au tableau de bord
      </Link>
    </div>
  );
}

export default Unauthorized;
