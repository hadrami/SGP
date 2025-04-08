// src/components/DecorationModal.jsx
import React from 'react';

const DecorationModal = ({ 
  showModal, 
  onClose, 
  decorationForm, 
  handleDecorationChange,
  handleAddDecoration,
  decorations
}) => {
  // Generate stable keys for form elements
  const formKeys = {
    decorationId: 'decoration-id-field',
    description: 'decoration-description-field',
    dateObtention: 'decoration-date-field',
    observations: 'decoration-observations-field'
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
        id="decoration-form-container"
      >
        <h2 className="text-xl font-bold mb-4">Ajouter une décoration</h2>
        
        <form onSubmit={handleAddDecoration}>
          <div className="mb-4">
            <label htmlFor={formKeys.decorationId} className="block text-gray-700 mb-1">
              Décoration <span className="text-red-500">*</span>
            </label>
            <select
              id={formKeys.decorationId}
              key={formKeys.decorationId}
              name="decorationId"
              value={decorationForm.decorationId}
              onChange={handleDecorationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            >
              <option value="">Sélectionner une décoration</option>
              {decorations && decorations.length > 0 ? (
                decorations.map(decoration => (
                  <option key={decoration.id} value={decoration.id}>
                    {decoration.titre}
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucune décoration disponible</option>
              )}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor={formKeys.description} className="block text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id={formKeys.description}
              key={formKeys.description}
              name="description"
              value={decorationForm.description || ""}
              onChange={handleDecorationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor={formKeys.dateObtention} className="block text-gray-700 mb-1">
              Date d'obtention <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id={formKeys.dateObtention}
              key={formKeys.dateObtention}
              name="dateObtention"
              value={decorationForm.dateObtention}
              onChange={handleDecorationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor={formKeys.observations} className="block text-gray-700 mb-1">
              Observations
            </label>
            <textarea
              id={formKeys.observations}
              key={formKeys.observations}
              name="observations"
              value={decorationForm.observations || ""}
              onChange={handleDecorationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="3"
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