// src/pages/militaires/MilitaireForm.jsx
import React, { useState, useEffect, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  createMilitaire, 
  fetchMilitaireById, 
  fetchMilitaireByMatricule, 
  updateMilitaire,
  fetchDiplomes,
  addDiplome,
  deleteDiplome 
} from '../../redux/slices/militaireSlice';
import DiplomModal from '../../components/DiplomModal';
import DecorationModal from '../../components/DecorationModal'
import DocumentModal from '../../components/DocumentModal';
import { fetchUnites } from '../../redux/slices/uniteSlice';
import GradeSelect from '../militaires/GradeSelect';

// Import API modules directly
import api from '../../api/axios';

const MilitaireForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  // Get militaire data from Redux state
  const { currentMilitaire, isLoading, error, diplomes } = useSelector(state => state.militaires);
  
  // Get unites from Redux state with safe fallback
  const unitesState = useSelector(state => state.unites);
  const unites = unitesState?.unites || [];
  
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
  
  // Modal state for different sections
  const [showDiplomeModal, setShowDiplomeModal] = useState(false);
  const [showDecorationModal, setShowDecorationModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  // State for storing temporary items before saving
  const [tempDiplomes, setTempDiplomes] = useState([]);
  const [tempDecorations, setTempDecorations] = useState([]);
  const [tempDocuments, setTempDocuments] = useState([]);

  // Available grades by category
  const gradesByCategory = {
    OFFICIER: [
      { value: "SOUS_LIEUTENANT", label: "Sous-Lieutenant" },
      { value: "LIEUTENANT", label: "Lieutenant" },
      { value: "CAPITAINE", label: "Capitaine" },
      { value: "COMMANDANT", label: "Commandant" },
      { value: "LIEUTENANT_COLONEL", label: "Lieutenant-Colonel" },
      { value: "COLONEL", label: "Colonel" },
      { value: "GENERAL", label: "Général" }
    ],
    SOUS_OFFICIER: [
      { value: "SERGENT", label: "Sergent" },
      { value: "SERGENT_CHEF", label: "Sergent-Chef" },
      { value: "ADJUDANT", label: "Adjudant" },
      { value: "ADJUDANT_CHEF", label: "Adjudant-Chef" }
    ],
    SOLDAT: [
      { value: "SOLDAT_DEUXIEME_CLASSE", label: "Soldat 2ème Classe" },
      { value: "SOLDAT_PREMIERE_CLASSE", label: "Soldat 1ère Classe" },
      { value: "CAPORAL", label: "Caporal" }
    ]
  };

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
    uniteId: '',
    
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
    specialiteId: '',

    // Arrays for related data
    diplomes: [],
    decorations: [],
    documents: []
  });

  // Diplome form state
  const [diplomeForm, setDiplomeForm] = useState({
    diplomeId: '',
    description: '', // Changed from institution to description
    dateObtention: new Date().toISOString().split('T')[0],
    observations: ''
  });
  
  
  // Decoration form state
  const [decorationForm, setDecorationForm] = useState({
    titre: '',
    description: '',
    dateObtention: new Date().toISOString().split('T')[0]
  });
  
  // Document form state
  const [documentForm, setDocumentForm] = useState({
    nomFichier: '',
    typeDocument: 'IDENTITE',
    file: null
  });
  

  // Add this useEffect at the top of your MilitaireForm component to handle modals closing
useEffect(() => {
  const handleMouseDown = (e) => {
    // For each modal that's open, prevent it from closing if user clicks inside form
    if (showDiplomeModal) {
      const diplomeForm = document.getElementById('diplome-form-container');
      if (diplomeForm && diplomeForm.contains(e.target)) {
        e.stopPropagation();
      }
    }
    
    if (showDecorationModal) {
      const decorationForm = document.getElementById('decoration-form-container');
      if (decorationForm && decorationForm.contains(e.target)) {
        e.stopPropagation();
      }
    }
    
    if (showDocumentModal) {
      const documentForm = document.getElementById('document-form-container');
      if (documentForm && documentForm.contains(e.target)) {
        e.stopPropagation();
      }
    }
  };

  // Add the event listener
  document.addEventListener('mousedown', handleMouseDown, true);
  
  // Clean up
  return () => {
    document.removeEventListener('mousedown', handleMouseDown, true);
  };
}, [showDiplomeModal, showDecorationModal, showDocumentModal]);

  // Fetch dropdown data when component mounts
  useEffect(() => {
    // Fetch unites via Redux
    dispatch(fetchUnites());
    
    // Fetch diplomes for dropdown
    dispatch(fetchDiplomes());
    
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
        uniteId: currentMilitaire.personnel?.uniteId || '',
        
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
      
      // Load existing items in edit mode
      if (currentMilitaire.personnel?.diplomes) {
        setTempDiplomes(currentMilitaire.personnel.diplomes);
      }
      
      if (currentMilitaire.decorations) {
        setTempDecorations(currentMilitaire.decorations);
      }
      
      if (currentMilitaire.personnel?.documents) {
        setTempDocuments(currentMilitaire.personnel.documents);
      }
    }
  }, [currentMilitaire, isEditMode]);
  
  /// Handle changes for main form
const handleChange = useCallback((e) => {
  const { name, value } = e.target;
  
  if (name === 'nni') {
    // Only allow digits for NNI and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').substring(0, 10);
    setFormData(prev => ({ ...prev, [name]: digitsOnly }));
  } else if (name === 'categorie') {
    // Reset sub-category fields when main category changes
    let updatedData = { 
      ...formData, 
      [name]: value,
      categorieOfficier: '',
      categorieSousOfficier: '',
      grade: '' // Reset grade when category changes
    };

    // Auto-select the first grade for the selected category if available
    if (value && gradesByCategory[value] && gradesByCategory[value].length > 0) {
      updatedData.grade = gradesByCategory[value][0].value;
    }
    
    setFormData(updatedData);
  } else if (name === 'grade') {
    // Auto-detect category and subcategory based on grade
    const grade = value;
    let category = '';
    let categoryOfficier = '';
    let categorySousOfficier = '';
    
    // Define which grades belong to which categories
    const officierSuperieurGrades = [
      "COMMANDANT", "LIEUTENANT_COLONEL", "COLONEL", "GENERAL",
      "MEDECIN_COMMANDANT", "MEDECIN_LIEUTENANT_COLONEL", "MEDECIN_COLONEL", "MEDECIN_GENERAL",
      "INTENDANT_COMMANDANT", "INTENDANT_LIEUTENANT_COLONEL", "INTENDANT_COLONEL", "INTENDANT_GENERAL",
      "COMMANDANT_INGENIEUR", "LIEUTENANT_COLONEL_INGENIEUR", "COLONEL_INGENIEUR", "GENERAL_INGENIEUR"
    ];
    
    const officierSubalterneGrades = [
      "SOUS_LIEUTENANT", "LIEUTENANT", "CAPITAINE",
      "LIEUTENANT_INGENIEUR", "CAPITAINE_INGENIEUR",
      "INTENDANT_SOUS_LIEUTENANT", "INTENDANT_LIEUTENANT", "INTENDANT_CAPITAINE",
      "MEDECIN_LIEUTENANT", "MEDECIN_CAPITAINE"
    ];
    
    const sousOfficierSuperieurGrades = ["ADJUDANT", "ADJUDANT_CHEF"];
    const sousOfficierSubalterneGrades = ["SERGENT", "SERGENT_CHEF"];
    const soldatGrades = ["SOLDAT_DEUXIEME_CLASSE", "SOLDAT_PREMIERE_CLASSE", "CAPORAL"];
    
    // Determine category and subcategory
    if (officierSuperieurGrades.includes(grade)) {
      category = 'OFFICIER';
      categoryOfficier = 'OFFICIER_SUPERIEUR';
    } else if (officierSubalterneGrades.includes(grade)) {
      category = 'OFFICIER';
      categoryOfficier = 'OFFICIER_SUBALTERNE';
    } else if (sousOfficierSuperieurGrades.includes(grade)) {
      category = 'SOUS_OFFICIER';
      categorySousOfficier = 'SOUS_OFFICIER_SUPERIEUR';
    } else if (sousOfficierSubalterneGrades.includes(grade)) {
      category = 'SOUS_OFFICIER';
      categorySousOfficier = 'SOUS_OFFICIER_SUBALTERNE';
    } else if (soldatGrades.includes(grade)) {
      category = 'SOLDAT';
    }
    
    // Update the form data with detected categories
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      categorie: category,
      categorieOfficier: categoryOfficier,
      categorieSousOfficier: categorySousOfficier
    }));
  } else if (name === 'armeId') {
    // Reset specialiteId when arme changes
    setFormData(prev => ({ ...prev, [name]: value, specialiteId: '' }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
}, [formData, gradesByCategory]);
  const handleDiplomeChange = useCallback((e) => {
    const { name, value } = e.target;
    setDiplomeForm(prev => ({ ...prev, [name]: value }));
  }, []);
  
  // Handle changes for decoration form
  const handleDecorationChange = useCallback((e) => {
    const { name, value } = e.target;
    setDecorationForm(prev => ({ ...prev, [name]: value }));
  }, []);
  
  // Handle changes for document form
  const handleDocumentChange = useCallback((e) => {
    const { name, value, files } = e.target;
    
    if (name === 'file') {
      setDocumentForm(prev => ({ 
        ...prev, 
        file: files[0],
        nomFichier: files[0]?.name || prev.nomFichier 
      }));
    } else {
      setDocumentForm(prev => ({ ...prev, [name]: value }));
    }
  }, []);
  
  // Add a diplome to temp collection
  const handleAddDiplome = useCallback((e) => {
    e.preventDefault();
    
    if (!diplomeForm.diplomeId || !diplomeForm.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Find the diplome by ID to include its details
    const selectedDiplome = diplomes.find(d => d.id === diplomeForm.diplomeId);
    
    const newDiplome = {
      ...diplomeForm,
      id: `temp_${Date.now()}`, // Temporary ID until saved
      diplome: selectedDiplome
    };
    
    setTempDiplomes(prev => [...prev, newDiplome]);
    
    // Reset form
    setDiplomeForm({
      diplomeId: '',
      description: '', // Reset description instead of institution
      dateObtention: new Date().toISOString().split('T')[0],
      observations: ''
    });
    
    // Close modal
    setShowDiplomeModal(false);
  }, [diplomeForm, diplomes]);
  
  // Add a decoration to temp collection
  const handleAddDecoration = useCallback((e) => {
    e.preventDefault();
    
    if (!decorationForm.titre || !decorationForm.dateObtention) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const newDecoration = {
      ...decorationForm,
      id: `temp_${Date.now()}` // Temporary ID until saved
    };
    
    setTempDecorations(prev => [...prev, newDecoration]);
    
    // Reset form
    setDecorationForm({
      titre: '',
      description: '',
      dateObtention: new Date().toISOString().split('T')[0]
    });
    
    // Close modal
    setShowDecorationModal(false);
  }, [decorationForm]);
  
  
  // Add a document to temp collection
  const handleAddDocument = useCallback((e) => {
    e.preventDefault();
    
    if (!documentForm.nomFichier || !documentForm.file) {
      alert('Veuillez remplir tous les champs obligatoires et sélectionner un fichier');
      return;
    }
    
    const newDocument = {
      ...documentForm,
      id: `temp_${Date.now()}`, // Temporary ID until saved
      dateUpload: new Date().toISOString(),
      cheminFichier: URL.createObjectURL(documentForm.file) // Create temporary URL for preview
    };
    
    setTempDocuments(prev => [...prev, newDocument]);
    
    // Reset form
    setDocumentForm({
      nomFichier: '',
      typeDocument: 'IDENTITE',
      file: null
    });
    
    // Close modal
    setShowDocumentModal(false);
  }, [documentForm]);
  
  // Remove a diplome from temp collection
  const handleRemoveDiplome = useCallback((index) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce diplôme?')) {
      setTempDiplomes(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  }, []);
  
  // Remove a decoration from temp collection
  const handleRemoveDecoration = useCallback((index) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette décoration?')) {
      setTempDecorations(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  }, []);
  
  // Remove a document from temp collection
  const handleRemoveDocument = useCallback((index) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document?')) {
      setTempDocuments(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  }, []);
  
  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }, []);

// Upload documents using FormData
const uploadDocuments = useCallback(async (militaireId) => {
  for (const doc of tempDocuments) {
    // Only upload new documents that have a file
    if (doc.file) {
      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('typeDocument', doc.typeDocument);
      formData.append('nomFichier', doc.nomFichier);
      
      try {
        await api.post(`/api/militaires/${militaireId}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        console.error('Error uploading document:', error);
        // Continue with other documents even if one fails
      }
    }
  }
}, [tempDocuments]);


  
  // Submit main form
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Create a copy of the data for submission
    const submitData = { ...formData };
    
    // Add the attachments with the correct field names
    submitData.diplomes = tempDiplomes.map(d => ({
      diplomeId: d.diplomeId,
      description: d.description, // Changed from institution to description
      dateObtention: d.dateObtention,
      observations: d.observations
    }));
    
    submitData.decorations = tempDecorations.map(d => ({
      titre: d.titre,
      description: d.description,
      dateObtention: d.dateObtention
    }));
    
    // Rest of the handler remains the same...
    
    // Handle categories - REMOVE the fields instead of setting to null
    if (submitData.categorie !== 'OFFICIER') {
      delete submitData.categorieOfficier;
    } else if (!submitData.categorieOfficier) {
      // If it's an officer but no sub-category is selected, set empty string
      submitData.categorieOfficier = '';
    }
    
    if (submitData.categorie !== 'SOUS_OFFICIER') {
      delete submitData.categorieSousOfficier;
    } else if (!submitData.categorieSousOfficier) {
      // If it's a sous-officer but no sub-category is selected, set empty string
      submitData.categorieSousOfficier = '';
    }
    
    try {
      if (isEditMode) {
        const result = await dispatch(updateMilitaire({ 
          id, 
          militaireData: submitData 
        })).unwrap();
        
        // Upload documents if any
        if (tempDocuments.some(doc => doc.file)) {
          await uploadDocuments(result.id);
        }
        
        alert('Militaire mis à jour avec succès');
        navigate(`/militaires/${result.id}`);
      } else {
        const result = await dispatch(createMilitaire(submitData)).unwrap();
        
        // Upload documents if any
        if (tempDocuments.some(doc => doc.file)) {
          await uploadDocuments(result.id);
        }
        
        alert('Militaire créé avec succès');
        navigate(`/militaires/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving militaire:', error);
      alert(`Erreur: ${error.error || 'Une erreur est survenue lors de l\'enregistrement'}`);
    }
  }, [formData, tempDiplomes, tempDecorations, tempDocuments, isEditMode, id, dispatch, navigate, uploadDocuments]);
  
  // 4. Updated display in the UI for diplomes to use description instead of institution
  // This replaces the part where diplomes are displayed in the UI
  {tempDiplomes.length === 0 ? (
    <p className="text-gray-500 italic">Aucun diplôme ajouté</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tempDiplomes.map((diplome, index) => (
        <div key={diplome.id} className="border rounded-md p-3 relative">
          <button
            type="button"
            onClick={() => handleRemoveDiplome(index)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            title="Supprimer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h4 className="font-medium">
            {diplome.diplome?.titre || 'Diplôme'}
          </h4>
          <p className="text-sm text-gray-600">Description: {diplome.description}</p>
          <p className="text-sm text-gray-500">Obtenu le: {formatDate(diplome.dateObtention)}</p>
          {diplome.observations && (
            <p className="text-sm text-gray-500 mt-1">{diplome.observations}</p>
          )}
        </div>
      ))}
    </div>
  )}




// Diplome Modal Component
const DiplomeModal = () => {
  if (!showDiplomeModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full" id="diplome-form-container">
        <h2 className="text-xl font-bold mb-4">Ajouter un diplôme</h2>
        
        <form onSubmit={handleAddDiplome}>
          <div className="mb-4">
            <label htmlFor="diplomeId" className="block text-gray-700 mb-1">
              Diplôme <span className="text-red-500">*</span>
            </label>
            <select
              id="diplomeId"
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
            <label htmlFor="description" className="block text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="Description"
              name="description"
              value={diplomeForm.description}
              onChange={handleDiplomeChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
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
              value={diplomeForm.dateObtention}
              onChange={handleDiplomeChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="observations" className="block text-gray-700 mb-1">
              Observations
            </label>
            <textarea
              id="observations"
              name="observations"
              value={diplomeForm.observations}
              onChange={handleDiplomeChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              rows="3"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowDiplomeModal(false)}
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
                <label htmlFor="uniteId" className="block text-gray-700 mb-1">
                  Unité <span className="text-red-500">*</span>
                </label>
                <select
                  id="uniteId"
                  name="uniteId"
                  value={formData.uniteId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
                  required
                >
                  <option value="">Sélectionner une unité</option>
                  {unites.map(unite => (
                    <option key={unite.id} value={unite.id}>
                      {unite.nom} ({unite.code}) {unite.type && `- ${unite.type}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
                  
   {/* Military Information Section - Simplified version */}
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
  
  {/* Improved GradeSelect that automatically detects categories */}
  <div className="form-group">
    <label htmlFor="grade" className="block text-gray-700 mb-1">
      Grade <span className="text-red-500">*</span>
    </label>
    <GradeSelect 
      value={formData.grade}
      onChange={handleChange}
      disabled={false} 
      />
  </div>
  
  {/* Hidden fields to store auto-detected categories */}
  <input type="hidden" name="categorie" value={formData.categorie} />
  <input type="hidden" name="categorieOfficier" value={formData.categorieOfficier} />
  <input type="hidden" name="categorieSousOfficier" value={formData.categorieSousOfficier} />
  
  {/* Display currently selected categories and subcategories as read-only info */}
  {formData.grade && (
    <div className="form-group col-span-2">
      <label className="block text-gray-700 mb-1">
        Catégorie
      </label>
      <div className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-700">
        <span className="font-medium">
          {formData.categorie === 'OFFICIER' ? 'Officier' : 
           formData.categorie === 'SOUS_OFFICIER' ? 'Sous-Officier' : 
           formData.categorie === 'SOLDAT' ? 'Soldat' : 'Non définie'}
        </span>
        
        {formData.categorieOfficier && (
          <span className="ml-2">
            ({formData.categorieOfficier === 'OFFICIER_SUPERIEUR' ? 'Supérieur' : 'Subalterne'})
          </span>
        )}
        
        {formData.categorieSousOfficier && (
          <span className="ml-2">
            ({formData.categorieSousOfficier === 'SOUS_OFFICIER_SUPERIEUR' ? 'Supérieur' : 'Subalterne'})
          </span>
        )}
      </div>
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
  
          {/* Diplomes Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h2 className="text-lg font-semibold text-gray-700">Diplômes</h2>
              <button
                type="button"
                onClick={() => setShowDiplomeModal(true)}
                className="bg-[#40916c] text-white px-3 py-1 rounded-md hover:bg-[#2d6a4f] text-sm transition-colors"
              >
                + Ajouter un diplôme
              </button>
            </div>
            
            {tempDiplomes.length === 0 ? (
              <p className="text-gray-500 italic">Aucun diplôme ajouté</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tempDiplomes.map((diplome, index) => (
                <div key={diplome.id} className="border rounded-md p-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveDiplome(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <h4 className="font-medium">
                    {diplome.diplome?.titre || 'Diplôme'}
                  </h4>
                  <p className="text-sm text-gray-600">Description: {diplome.description}</p>
                  <p className="text-sm text-gray-500">Obtenu le: {formatDate(diplome.dateObtention)}</p>
                  {diplome.observations && (
                    <p className="text-sm text-gray-500 mt-1">{diplome.observations}</p>
                  )}
                </div>
              ))}
          </div>
                )}
                </div>
          
          {/* Decorations Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h2 className="text-lg font-semibold text-gray-700">Décorations</h2>
              <button
                type="button"
                onClick={() => setShowDecorationModal(true)}
                className="bg-[#40916c] text-white px-3 py-1 rounded-md hover:bg-[#2d6a4f] text-sm transition-colors"
              >
                + Ajouter une décoration
              </button>
            </div>
            
            {tempDecorations.length === 0 ? (
              <p className="text-gray-500 italic">Aucune décoration ajoutée</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tempDecorations.map((decoration, index) => (
                  <div key={decoration.id} className="border rounded-md p-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveDecoration(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <h4 className="font-medium">{decoration.titre}</h4>
                    <p className="text-sm text-gray-500">Obtenue le: {formatDate(decoration.dateObtention)}</p>
                    {decoration.description && (
                      <p className="text-sm text-gray-500 mt-1">{decoration.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Documents Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h2 className="text-lg font-semibold text-gray-700">Documents</h2>
              <button
                type="button"
                onClick={() => setShowDocumentModal(true)}
                className="bg-[#40916c] text-white px-3 py-1 rounded-md hover:bg-[#2d6a4f] text-sm transition-colors"
              >
              + Ajouter un document
              </button>
            </div>
            
            {tempDocuments.length === 0 ? (
              <p className="text-gray-500 italic">Aucun document ajouté</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tempDocuments.map((document, index) => (
                  <div key={document.id} className="border rounded-md p-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <h4 className="font-medium">{document.nomFichier}</h4>
                    <p className="text-sm text-gray-500">
                      Type: {document.typeDocument.replace(/_/g, ' ')}
                    </p>
                    {document.file && (
                      <p className="text-sm text-gray-500">
                        Fichier: {document.file.name} ({Math.round(document.file.size / 1024)} Ko)
                      </p>
                    )}
                    {document.cheminFichier && !document.file && (
                      <p className="text-sm text-blue-500 mt-1">
                        <a href={document.cheminFichier} target="_blank" rel="noopener noreferrer">
                          Voir le document
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
        
        
{/* Modals */}
<DiplomModal 
showModal={showDiplomeModal}
onClose={() => setShowDiplomeModal(false)}
diplomeForm={diplomeForm}
handleDiplomeChange={handleDiplomeChange}
handleAddDiplome={handleAddDiplome}
diplomes={diplomes}
/>

<DecorationModal 
showModal={showDecorationModal}
onClose={() => setShowDecorationModal(false)}
decorationForm={decorationForm}
handleDecorationChange={handleDecorationChange}
handleAddDecoration={handleAddDecoration}
/>

<DocumentModal 
showModal={showDocumentModal}
onClose={() => setShowDocumentModal(false)}
documentForm={documentForm}
handleDocumentChange={handleDocumentChange}
handleAddDocument={handleAddDocument}
/>
      </div>
    );
  };
  
  export default MilitaireForm;