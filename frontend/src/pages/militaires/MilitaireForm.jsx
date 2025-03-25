// src/pages/militaires/MilitaireForm.jsx - Complete fixed version
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createMilitaire, fetchMilitaireByMatricule, updateMilitaire } from '../../redux/slices/militaireSlice';
import { fetchInstituts } from '../../redux/slices/institutSlice';
import positionApi from '../../api/positionApi'; // Import position API

const MilitaireForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  // Get the currentMilitaire from Redux state for edit mode
  const { currentMilitaire, isLoading, error } = useSelector(state => state.militaires);
  // Get instituts from Redux state with safe fallback
  const institutsState = useSelector(state => state.instituts);
  const instituts = institutsState?.instituts || [];
  
  // State for positions fetched directly from API
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    telephone: '',
    email: '',
    nni: '',
    institutId: '',
    matricule: '',
    grade: '',
    categorie: '',
    groupeSanguin: '',
    dateRecrutement: '',
    telephoneService: '',
    dateDernierePromotion: '',
    division: '',
    positionId: ''
  });
  
  // Fetch instituts and positions when component mounts
  useEffect(() => {
    // Fetch list of instituts for the dropdown (from Redux)
    dispatch(fetchInstituts());
    
    // Fetch list of positions for the dropdown (directly from API)
    const fetchPositions = async () => {
      setLoadingPositions(true);
      try {
        const response = await positionApi.getAllPositions();
        // Make sure we're setting an array (handle different response structures)
        if (response && response.data) {
          setPositions(response.data);
        } else if (Array.isArray(response)) {
          setPositions(response);
        } else {
          console.error('Unexpected positions response format:', response);
          setPositions([]);
        }
        setLoadingPositions(false);
      } catch (error) {
        console.error('Error fetching positions:', error);
        setPositions([]);
        setLoadingPositions(false);
      }
    };
    
    fetchPositions();
    
    // If in edit mode, fetch the militaire data
    if (isEditMode && id) {
      dispatch(fetchMilitaireByMatricule(id));
    }
  }, [dispatch, id, isEditMode]);
  
  // Populate form with militaire data when editing
  useEffect(() => {
    if (isEditMode && currentMilitaire) {
      const militaireData = {
        nom: currentMilitaire.personnel?.nom || '',
        prenom: currentMilitaire.personnel?.prenom || '',
        dateNaissance: currentMilitaire.personnel?.dateNaissance ? 
          new Date(currentMilitaire.personnel.dateNaissance).toISOString().split('T')[0] : '',
        lieuNaissance: currentMilitaire.personnel?.lieuNaissance || '',
        telephone: currentMilitaire.personnel?.telephone || '',
        email: currentMilitaire.personnel?.email || '',
        nni: currentMilitaire.personnel?.nni || '',
        institutId: currentMilitaire.personnel?.institutId || '',
        matricule: currentMilitaire.matricule || '',
        grade: currentMilitaire.grade || '',
        categorie: currentMilitaire.categorie || '',
        groupeSanguin: currentMilitaire.groupeSanguin || '',
        dateRecrutement: currentMilitaire.dateRecrutement ? 
          new Date(currentMilitaire.dateRecrutement).toISOString().split('T')[0] : '',
        telephoneService: currentMilitaire.telephoneService || '',
        dateDernierePromotion: currentMilitaire.dateDernierePromotion ? 
          new Date(currentMilitaire.dateDernierePromotion).toISOString().split('T')[0] : '',
        division: currentMilitaire.division || '',
        positionId: currentMilitaire.positionId || ''
      };
      
      setFormData(militaireData);
    }
  }, [currentMilitaire, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nni') {
      const digitsOnly = value.replace(/\D/g, '').substring(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
// In your MilitaireForm.jsx, replace the handleSubmit method with this:
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Submitting form data:', formData);
  
  try {
    if (isEditMode) {
      // Make a copy of the data without headers or non-serializable values
      const submitData = { ...formData };
      
      // Make sure to pass the ID correctly - it's coming from the URL params
      await dispatch(updateMilitaire({ 
        matricule: id, // Use matricule instead of id
        militaireData: submitData 
      })).unwrap();
      
      alert('Militaire mis à jour avec succès');
      navigate('/militaires');
    } else {
      // Make a copy of the data without headers or non-serializable values
      const submitData = { ...formData };
      
      await dispatch(createMilitaire(submitData)).unwrap();
      alert('Militaire créé avec succès');
      navigate('/militaires');
    }
  } catch (error) {
    console.error('Error saving militaire:', error);
    alert(`Erreur: ${error.error || 'Une erreur est survenue lors de l\'enregistrement'}`);
  }
};
  if (isEditMode && isLoading && !currentMilitaire) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#40916c]"></div>
          <p className="mt-2 text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Modifier un militaire' : 'Ajouter un nouveau militaire'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Erreur: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Personal Information Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
            Informations personnelles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="nom" className="block text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="prenom" className="block text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="nni" className="block text-gray-700 mb-1">
                NNI <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(10 chiffres)</span>
              </label>
              <input
                type="text"
                id="nni"
                name="nni"
                value={formData.nni}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                maxLength="10"
                pattern="\d{10}"
                title="Le NNI doit contenir exactement 10 chiffres"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dateNaissance" className="block text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                id="dateNaissance"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lieuNaissance" className="block text-gray-700 mb-1">Lieu de naissance</label>
              <input
                type="text"
                id="lieuNaissance"
                name="lieuNaissance"
                value={formData.lieuNaissance}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telephone" className="block text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="institutId" className="block text-gray-700 mb-1">
                Institut <span className="text-red-500">*</span>
              </label>
              <select
                id="institutId"
                name="institutId"
                value={formData.institutId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                required
              >
                <option value="">Sélectionner un institut</option>
                {instituts && instituts.length > 0 && instituts.map(institut => (
                  <option key={institut.id} value={institut.id}>
                    {institut.nom} ({institut.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Military Information Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
            Informations militaires
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="matricule" className="block text-gray-700 mb-1">
                Matricule <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                required
                disabled={isEditMode}
              />
              {isEditMode && (
                <p className="text-xs text-gray-500 mt-1">
                  Le matricule ne peut pas être modifié.
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="grade" className="block text-gray-700 mb-1">
                Grade <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                required
              >
                <option value="">Sélectionner un grade</option>
                <option value="SOUS_LIEUTENANT">Sous-Lieutenant</option>
                <option value="LIEUTENANT">Lieutenant</option>
                <option value="CAPITAINE">Capitaine</option>
                <option value="COMMANDANT">Commandant</option>
                <option value="LIEUTENANT_COLONEL">Lieutenant-Colonel</option>
                <option value="COLONEL">Colonel</option>
                <option value="GENERAL">Général</option>
                <option value="SERGENT">Sergent</option>
                <option value="SERGENT_CHEF">Sergent-Chef</option>
                <option value="ADJUDANT">Adjudant</option>
                <option value="ADJUDANT_CHEF">Adjudant-Chef</option>
                <option value="SOLDAT_DEUXIEME_CLASSE">Soldat 2ème Classe</option>
                <option value="SOLDAT_PREMIERE_CLASSE">Soldat 1ère Classe</option>
                <option value="CAPORAL">Caporal</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="categorie" className="block text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="OFFICIER">Officier</option>
                <option value="SOUS_OFFICIER">Sous-Officier</option>
                <option value="SOLDAT">Soldat</option>
              </select>
            </div>
            
            {/* BLOOD TYPE */}
            <div className="form-group">
              <label htmlFor="groupeSanguin" className="block text-gray-700 mb-1">
                Groupe sanguin
              </label>
              <select
                id="groupeSanguin"
                name="groupeSanguin"
                value={formData.groupeSanguin}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              >
                <option value="">Sélectionner un groupe sanguin</option>
                <option value="A_POSITIF">A+</option>
                <option value="A_NEGATIF">A-</option>
                <option value="B_POSITIF">B+</option>
                <option value="B_NEGATIF">B-</option>
                <option value="AB_POSITIF">AB+</option>
                <option value="AB_NEGATIF">AB-</option>
                <option value="O_POSITIF">O+</option>
                <option value="O_NEGATIF">O-</option>
              </select>
            </div>
            
            {/* RECRUITMENT DATE */}
            <div className="form-group">
              <label htmlFor="dateRecrutement" className="block text-gray-700 mb-1">
                Date de recrutement
              </label>
              <input
                type="date"
                id="dateRecrutement"
                name="dateRecrutement"
                value={formData.dateRecrutement}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            {/* LAST PROMOTION DATE */}
            <div className="form-group">
              <label htmlFor="dateDernierePromotion" className="block text-gray-700 mb-1">
                Date de dernière promotion
              </label>
              <input
                type="date"
                id="dateDernierePromotion"
                name="dateDernierePromotion"
                value={formData.dateDernierePromotion}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            {/* SERVICE PHONE */}
            <div className="form-group">
              <label htmlFor="telephoneService" className="block text-gray-700 mb-1">
                Téléphone de service
              </label>
              <input
                type="tel"
                id="telephoneService"
                name="telephoneService"
                value={formData.telephoneService}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            {/* DIVISION */}
            <div className="form-group">
              <label htmlFor="division" className="block text-gray-700 mb-1">
                Division
              </label>
              <input
                type="text"
                id="division"
                name="division"
                value={formData.division}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              />
            </div>
            
            {/* POSITION - Now as a dropdown from database */}
            <div className="form-group">
              <label htmlFor="positionId" className="block text-gray-700 mb-1">
                Position
              </label>
              <select
                id="positionId"
                name="positionId"
                value={formData.positionId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                disabled={loadingPositions}
              >
                <option value="">
                  {loadingPositions ? "Chargement des positions..." : "Sélectionner une position"}
                </option>
                {Array.isArray(positions) && positions.length > 0 && positions.map(position => (
                  <option key={position.id} value={position.id}>
                    {position.nom || position.titre || position.name || `Position ${position.id}`}
                  </option>
                ))}
              </select>
              {/* Fallback when positions can't be loaded */}
              {(!Array.isArray(positions) || positions.length === 0) && !loadingPositions && (
                <p className="text-xs text-red-500 mt-1">
                  Impossible de charger les positions. Vous pouvez sauvegarder quand même.
                </p>
              )}
            </div>
          </div>
          
          {/* Submit buttons */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/militaires')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors mr-2"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              className="bg-[#40916c] text-white px-4 py-2 rounded-lg hover:bg-[#2d6a49] transition-colors"
            >
              {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MilitaireForm;