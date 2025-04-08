// src/components/NotationModal.jsx
import React from 'react';

const NotationModal = ({ 
  showModal, 
  onClose, 
  notationForm, 
  handleNotationChange, 
  handleAddNotation 
}) => {
  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        id="notation-form-container"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Ajouter une notation
        </h3>
        
        <form onSubmit={handleAddNotation}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="typeNotation">
              Type de notation <span className="text-red-500">*</span>
            </label>
            <select
              id="typeNotation"
              name="typeNotation"
              value={notationForm.typeNotation}
              onChange={handleNotationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="ANNUELLE">Annuelle</option>
              <option value="EXCEPTIONNELLE">Exceptionnelle</option>
              <option value="STAGE">Stage</option>
              <option value="MISSION">Mission</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="date">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={notationForm.date}
              onChange={handleNotationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="note">
              Note (/20) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="note"
              name="note"
              value={notationForm.note}
              onChange={handleNotationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              min="0"
              max="20"
              step="0.25"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="notateur">
              Notateur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="notateur"
              name="notateur"
              value={notationForm.notateur}
              onChange={handleNotationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="observations">
              Observations
            </label>
            <textarea
              id="observations"
              name="observations"
              value={notationForm.observations}
              onChange={handleNotationChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="3"
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

export default NotationModal;