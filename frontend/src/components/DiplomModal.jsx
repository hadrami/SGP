import React, { useState } from 'react';

const DiplomModal = ({ showModal, onClose, militaireId, availableDiplomes, onDiplomeAdded }) => {
  const [form, setForm] = useState({
    diplomeId: '',
    description: '',
    dateObtention: new Date().toISOString().split('T')[0],
    observations: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!form.diplomeId || !form.dateObtention) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    const newDiplome = {
      ...form,
      id: `temp_${Date.now()}`,
      diplome: availableDiplomes.find(d => d.id === form.diplomeId) || null,
    };

    onDiplomeAdded(newDiplome);
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="modal">
      <div className="p-4">
        <select name="diplomeId" onChange={handleChange} value={form.diplomeId}>
          <option value="">Choisir un diplôme</option>
          {availableDiplomes.map(d => (
            <option key={d.id} value={d.id}>{d.titre}</option>
          ))}
        </select>

        <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input type="date" name="dateObtention" value={form.dateObtention} onChange={handleChange} />
        <textarea name="observations" value={form.observations} onChange={handleChange} />

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose}>Annuler</button>
          <button type="button" onClick={handleAdd}>Ajouter</button>
        </div>
      </div>
    </div>
  );
};

export default DiplomModal;
