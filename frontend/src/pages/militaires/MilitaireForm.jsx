// src/pages/militaires/MilitaireForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  createMilitaire, 
  fetchMilitaireById, 
  fetchMilitaireByMatricule, 
  updateMilitaire
} from '../../redux/slices/militaireSlice';
import { fetchInstituts } from '../../redux/slices/institutSlice';

// Import API modules directly
import api from '../../api/axios';

const MilitaireForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  // Get militaire data from Redux state
  const { currentMilitaire, isLoading, error } = useSelector(state => state.militaires);
  
  // Get instituts from Redux state with safe fallback
  const institutsState = useSelector(state => state.instituts);
  const instituts = institutsState?.instituts || [];
  
  // Local state for dropdown options
  const [armes, setArmes] = useState([]);
  const [specialites, setSpecialites] = useState({});
  const [armeSpecialites, setArmeSpecialites] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [sousUnites, setSousUnites] = useState([]);
  
  // Loading states
  const [loadingArmes, setLoadingArmes] = useState(false);
  const [loadingSpecialites, setLoadingSpecialites] = useState(false);
  const [loadingFonctions, setLoadingFonctions] = useState(false);
  const [loadingSousUnites, setLoadingSousUnites] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Personnel data
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    telephone: '',
    email: '',
    nni: '',
    institutId: '',
    
    // Militaire data
    matricule: '',
    grade: '',
    categorie: '',
    categorieOfficier: '',
    categorieSousOfficier: '',
    groupeSanguin: '',
    dateRecrutement: '',
    telephoneService: '',
    dateDernierePromotion: '',
    division: '',
    situation: 'PRESENT',
    situationDetail: '',
    situationDepuis: new Date().toISOString().split('T')[0],
    situationJusqua: '',
    
    // Relations
    fonctionId: '',
    sousUniteId: '',
    armeId: '',
    specialiteId: ''
  });
  
  // Fetch dropdown data when component mounts
  useEffect(() => {
    // Fetch instituts via Redux (assuming you need it elsewhere too)
    dispatch(fetchInstituts());
    
    // Fetch armes directly from API
    const fetchArmes = async () => {
      setLoadingArmes(true);
      try {
        const response = await api.get('/api/armes');
        setArmes(response.data);
      } catch (error) {
        console.error('Error fetching armes:', error);
      } finally {
        setLoadingArmes(false);
      }
    };
    
    // Fetch fonctions directly from API
    const fetchFonctions = async () => {
      setLoadingFonctions(true);
      try {
        const response = await api.get('/api/fonctions');
        setFonctions(response.data);
      } catch (error) {
        console.error('Error fetching fonctions:', error);
      } finally {
        setLoadingFonctions(false);
      }
    };
    
    // Fetch sous-unites directly from API
    const fetchSousUnites = async () => {
      setLoadingSousUnites(true);
      try {
        const response = await api.get('/api/sous-unites');
        setSousUnites(response.data);
      } catch (error) {
        console.error('Error fetching sous-unites:', error);
      } finally {
        setLoadingSousUnites(false);
      }
    };
    
    // Execute all fetches
    fetchArmes();
    fetchFonctions();
    fetchSousUnites();
    
    // If in edit mode, fetch the militaire data
    if (isEditMode && id) {
      if (id.includes('-')) {
        dispatch(fetchMilitaireById(id));
      } else {
        dispatch(fetchMilitaireByMatricule(id));
      }
    }
  }, [dispatch, id, isEditMode]);
  
  // Fetch specialites when arme changes
  useEffect(() => {
    if (formData.armeId) {
      // Check if we already have specialites for this arme
      if (specialites[formData.armeId]) {
        setArmeSpecialites(specialites[formData.armeId]);
      } else {
        // Fetch specialites for the selected arme
        const fetchSpecialites = async () => {
          setLoadingSpecialites(true);
          try {
            const response = await api.get(`/api/armes/${formData.armeId}/specialites`);
            // Update the specialites cache
            setSpecialites(prev => ({
              ...prev,
              [formData.armeId]: response.data
            }));
            // Update current arme's specialites
            setArmeSpecialites(response.data);
          } catch (error) {
            console.error('Error fetching specialites:', error);
          } finally {
            setLoadingSpecialites(false);
          }
        };
        
        fetchSpecialites();
      }
    } else {
      setArmeSpecialites([]);
    }
  }, [formData.armeId, specialites]);
  
  // Populate form with militaire data when editing
  useEffect(() => {
    if (isEditMode && currentMilitaire) {
      const militaireData = {
        // Personnel data
        nom: currentMilitaire.personnel?.nom || '',
        prenom: currentMilitaire.personnel?.prenom || '',
        dateNaissance: currentMilitaire.personnel?.dateNaissance ? 
          new Date(currentMilitaire.personnel.dateNaissance).toISOString().split('T')[0] : '',
        lieuNaissance: currentMilitaire.personnel?.lieuNaissance || '',
        telephone: currentMilitaire.personnel?.telephone || '',
        email: currentMilitaire.personnel?.email || '',
        nni: currentMilitaire.personnel?.nni || '',
        institutId: currentMilitaire.personnel?.institutId || '',
        
        // Militaire data
        matricule: currentMilitaire.matricule || '',
        grade: currentMilitaire.grade || '',
        categorie: currentMilitaire.categorie || '',
        categorieOfficier: currentMilitaire.categorieOfficier || '',
        categorieSousOfficier: currentMilitaire.categorieSousOfficier || '',
        groupeSanguin: currentMilitaire.groupeSanguin || '',
        dateRecrutement: currentMilitaire.dateRecrutement ? 
          new Date(currentMilitaire.dateRecrutement).toISOString().split('T')[0] : '',
        telephoneService: currentMilitaire.telephoneService || '',
        dateDernierePromotion: currentMilitaire.dateDernierePromotion ? 
          new Date(currentMilitaire.dateDernierePromotion).toISOString().split('T')[0] : '',
        division: currentMilitaire.division || '',
        situation: currentMilitaire.situation || 'PRESENT',
        situationDetail: currentMilitaire.situationDetail || '',
        situationDepuis: currentMilitaire.situationDepuis ? 
          new Date(currentMilitaire.situationDepuis).toISOString().split('T')[0] : '',
        situationJusqua: currentMilitaire.situationJusqua ? 
          new Date(currentMilitaire.situationJusqua).toISOString().split('T')[0] : '',
        
        // Relations
        fonctionId: currentMilitaire.fonctionId || '',
        sousUniteId: currentMilitaire.sousUniteId || '',
        armeId: currentMilitaire.armeId || '',
        specialiteId: currentMilitaire.specialiteId || ''
      };
      
      setFormData(militaireData);
    }
  }, [currentMilitaire, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nni') {
      // Only allow digits for NNI and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').substring(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
    } else if (name === 'categorie') {
      // Reset sub-category fields when main category changes
      let updatedData = { 
        ...formData, 
        [name]: value,
        categorieOfficier: '',
        categorieSousOfficier: '' 
      };
      setFormData(updatedData);
    } else if (name === 'armeId') {
      // Reset specialiteId when arme changes
      setFormData({ ...formData, [name]: value, specialiteId: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    try {
      if (isEditMode) {
        // Create a copy of the data for submission
        const submitData = { ...formData };
        
        const result = await dispatch(updateMilitaire({ 
          id, 
          militaireData: submitData 
        })).unwrap();
        
        alert('Militaire mis à jour avec succès');
        navigate(`/militaires/${result.id}`);
      } else {
        // Create a copy of the data for submission
        const submitData = { ...formData };
        
        const result = await dispatch(createMilitaire(submitData)).unwrap();
        alert('Militaire créé avec succès');
        navigate(`/militaires/${result.id}`);
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#40916c] mb-4 md:mb-0">
          {isEditMode ? 'Modifier un militaire' : 'Ajouter un nouveau militaire'}
        </h1>
        
        <div>
          <Link
            to="/militaires"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Retour à la liste
          </Link>
        </div>
      </div>
      
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
              {instituts.map(institut => (
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
                      
                      {formData.categorie === 'OFFICIER' && (
                        <div className="form-group">
                          <label htmlFor="categorieOfficier" className="block text-gray-700 mb-1">
                            Catégorie d'officier
                          </label>
                          <select
                            id="categorieOfficier"
                            name="categorieOfficier"
                            value={formData.categorieOfficier}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                          >
                            <option value="">Sélectionner une catégorie</option>
                            <option value="OFFICIER_SUPERIEUR">Officier Supérieur</option>
                            <option value="OFFICIER_SUBALTERNE">Officier Subalterne</option>
                          </select>
                        </div>
                      )}
                      
                      {formData.categorie === 'SOUS_OFFICIER' && (
                        <div className="form-group">
                          <label htmlFor="categorieSousOfficier" className="block text-gray-700 mb-1">
                            Catégorie de sous-officier
                          </label>
                          <select
                            id="categorieSousOfficier"
                            name="categorieSousOfficier"
                            value={formData.categorieSousOfficier}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                          >
                            <option value="">Sélectionner une catégorie</option>
                            <option value="SOUS_OFFICIER_SUPERIEUR">Sous-Officier Supérieur</option>
                            <option value="SOUS_OFFICIER_SUBALTERNE">Sous-Officier Subalterne</option>
                          </select>
                        </div>
                      )}
                      
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
                    </div>
                  </div>
                  
                  {/* Situation Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
                      Situation actuelle
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="situation" className="block text-gray-700 mb-1">
                          Situation
                        </label>
                        <select
                          id="situation"
                          name="situation"
                          value={formData.situation}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        >
                          <option value="PRESENT">Présent</option>
                          <option value="MISSION">Mission</option>
                          <option value="CONGE">Congé</option>
                          <option value="HOSPITALISATION">Hospitalisation</option>
                          <option value="FORMATION">Formation</option>
                          <option value="DETACHEMENT">Détachement</option>
                          <option value="RETRAITE">Retraite</option>
                          <option value="DISPONIBILITE">Disponibilité</option>
                          <option value="DESERTEUR">Déserteur</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="situationDetail" className="block text-gray-700 mb-1">
                          Détails de la situation
                        </label>
                        <input
                          type="text"
                          id="situationDetail"
                          name="situationDetail"
                          value={formData.situationDetail}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="situationDepuis" className="block text-gray-700 mb-1">
                          Depuis le
                        </label>
                        <input
                          type="date"
                          id="situationDepuis"
                          name="situationDepuis"
                          value={formData.situationDepuis}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="situationJusqua" className="block text-gray-700 mb-1">
                          Jusqu'au
                        </label>
                        <input
                          type="date"
                          id="situationJusqua"
                          name="situationJusqua"
                          value={formData.situationJusqua}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional Information Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">
                      Informations professionnelles
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="armeId" className="block text-gray-700 mb-1">
                        Arme / Branche
                      </label>
                      <select
                        id="armeId"
                        name="armeId"
                        value={formData.armeId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        disabled={loadingArmes}
                      >
                        <option value="">
                          {loadingArmes ? "Chargement des armes..." : "Sélectionner une arme"}
                        </option>
                        {armes && armes.length > 0 ? (
                          armes.map(arme => (
                            <option key={arme.id} value={arme.id}>
                              {arme.nom}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Aucune arme disponible</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="specialiteId" className="block text-gray-700 mb-1">
                        Spécialité
                      </label>
                      <select
                        id="specialiteId"
                        name="specialiteId"
                        value={formData.specialiteId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        disabled={!formData.armeId || loadingSpecialites || armeSpecialites.length === 0}
                      >
                        <option value="">
                          {!formData.armeId
                            ? "Sélectionnez d'abord une arme"
                            : loadingSpecialites
                            ? "Chargement des spécialités..."
                            : armeSpecialites.length === 0
                            ? "Aucune spécialité disponible"
                            : "Sélectionner une spécialité"}
                        </option>
                        {armeSpecialites.map(specialite => (
                          <option key={specialite.id} value={specialite.id}>
                            {specialite.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="sousUniteId" className="block text-gray-700 mb-1">
                        Sous-unité
                      </label>
                      <select
                        id="sousUniteId"
                        name="sousUniteId"
                        value={formData.sousUniteId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        disabled={loadingSousUnites}
                      >
                        <option value="">
                          {loadingSousUnites ? "Chargement des sous-unités..." : "Sélectionner une sous-unité"}
                        </option>
                        {sousUnites && sousUnites.length > 0 ? (
                          sousUnites.map(sousUnite => (
                            <option key={sousUnite.id} value={sousUnite.id}>
                              {sousUnite.nom} {sousUnite.code && `(${sousUnite.code})`}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Aucune sous-unité disponible</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="fonctionId" className="block text-gray-700 mb-1">
                        Fonction
                      </label>
                      <select
                        id="fonctionId"
                        name="fonctionId"
                        value={formData.fonctionId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                        disabled={loadingFonctions}
                      >
                        <option value="">
                          {loadingFonctions ? "Chargement des fonctions..." : "Sélectionner une fonction"}
                        </option>
                        {fonctions && fonctions.length > 0 ? (
                          fonctions.map(fonction => (
                            <option key={fonction.id} value={fonction.id}>
                              {fonction.titre}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Aucune fonction disponible</option>
                        )}
                      </select>
                    </div>
                  </div>
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
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
          Traitement...
        </>
      ) : isEditMode ? 'Mettre à jour' : 'Enregistrer'}
    </button>
  </div>
</form>
</div>
);
};
export default MilitaireForm;