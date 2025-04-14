// src/components/DiplomModal.jsx
import React from 'react';

const DiplomModal = ({ 
  showModal, 
  onClose, 
  diplomeForm, 
  handleDiplomeChange,
  handleAddDiplome,
  diplomes
}) => {
  // Generate stable keys for form elements
  const formKeys = {
    diplomeId: 'diplome-id-field',
    description: 'diplome-description-field',
    dateObtention: 'diplome-date-field',
    observations: 'diplome-observations-field'
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
        id="diplome-form-container"
      >
        <h2 className="text-xl font-bold mb-4">Ajouter un diplôme</h2>
        
        <form onSubmit={handleAddDiplome}>
          <div className="mb-4">
            <label htmlFor={formKeys.diplomeId} className="block text-gray-700 mb-1">
              Diplôme <span className="text-red-500">*</span>
            </label>
            <select
              id={formKeys.diplomeId}
              key={formKeys.diplomeId}
              name="diplomeId"
              value={diplomeForm.diplomeId}
              onChange={handleDiplomeChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            >
              <option value="">Sélectionner un diplôme</option>
              {diplomes && diplomes.length > 0 ? (
                diplomes.map(diplome => (
                  <option key={diplome.id} value={diplome.id}>
                    {diplome.titre} ({diplome.typeDiplome?.replace(/_/g, ' ') || 'Non spécifié'})
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucun diplôme disponible</option>
              )}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor={formKeys.description} className="block text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id={formKeys.description}
              key={formKeys.description}
              name="description"
              value={diplomeForm.description || ""}
              onChange={handleDiplomeChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="3"
              required
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
              value={diplomeForm.dateObtention || new Date().toISOString().split('T')[0]}
              onChange={handleDiplomeChange}
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
              value={diplomeForm.observations || ""}
              onChange={handleDiplomeChange}
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

export default DiplomModal;