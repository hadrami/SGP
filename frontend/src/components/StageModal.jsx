// src/components/StageModal.jsx
import React from 'react';

const StageModal = ({ 
  showModal, 
  onClose, 
  stageForm, 
  handleStageChange, 
  handleAddStage 
}) => {
  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        id="stage-form-container"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Ajouter un stage militaire
        </h3>
        
        <form onSubmit={handleAddStage}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="titre">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={stageForm.titre}
              onChange={handleStageChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={stageForm.description}
              onChange={handleStageChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="lieu">
              Lieu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lieu"
              name="lieu"
              value={stageForm.lieu}
              onChange={handleStageChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="dateDebut">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={stageForm.dateDebut}
                onChange={handleStageChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="dateFin">
                Date de fin
              </label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={stageForm.dateFin}
                onChange={handleStageChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="statut">
              Statut
            </label>
            <select
              id="statut"
              name="statut"
              value={stageForm.statut}
              onChange={handleStageChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
            >
              <option value="EN_COURS">En cours</option>
              <option value="EFFECTUE">Effectué</option>
              <option value="ANNULE">Annulé</option>
              <option value="PLANIFIE">Planifié</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="observations">
              Observations
            </label>
            <textarea
              id="observations"
              name="observations"
              value={stageForm.observations}
              onChange={handleStageChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="2"
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors mr-2"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              className="bg-[#40916c] text-white px-4 py-2 rounded-lg hover:bg-[#2d6a4f] transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StageModal;