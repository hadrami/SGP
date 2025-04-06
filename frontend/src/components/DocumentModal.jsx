// src/components/DocumentModal.jsx
import React from 'react';

const DocumentModal = ({ 
  showModal, 
  onClose, 
  documentForm, 
  handleDocumentChange,
  handleAddDocument
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Ajouter un document</h2>
        
        <form onSubmit={handleAddDocument}>
          <div className="mb-4">
            <label htmlFor="file" className="block text-gray-700 mb-1">
              Fichier <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleDocumentChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="nomFichier" className="block text-gray-700 mb-1">
              Nom du fichier <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nomFichier"
              name="nomFichier"
              value={documentForm.nomFichier}
              onChange={handleDocumentChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="typeDocument" className="block text-gray-700 mb-1">
              Type de document
            </label>
            <select
              id="typeDocument"
              name="typeDocument"
              value={documentForm.typeDocument}
              onChange={handleDocumentChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
            >
              <option value="IDENTITE">Document d'identité</option>
              <option value="DIPLOME">Diplôme</option>
              <option value="CERTIFICAT">Certificat</option>
              <option value="EVALUATION">Évaluation</option>
              <option value="RAPPORT">Rapport</option>
              <option value="DEMANDE">Demande</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#40916c] text-white rounded-md hover:bg-[#2d6a4f]"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;