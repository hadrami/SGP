// src/components/DecorationModal.jsx
import React from 'react';

const DecorationModal = ({ 
  showModal, 
  onClose, 
  decorationForm, 
  handleDecorationChange,
  handleAddDecoration
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Ajouter une décoration</h2>
        
        <form onSubmit={handleAddDecoration}>
          <div className="mb-4">
            <label htmlFor="titre" className="block text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={decorationForm.titre}
              onChange={handleDecorationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={decorationForm.description}
              onChange={handleDecorationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="dateObtention" className="block text-gray-700 mb-1">
              Date d'obtention <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateObtention"
              name="dateObtention"
              value={decorationForm.dateObtention}
              onChange={handleDecorationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
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

export default DecorationModal;