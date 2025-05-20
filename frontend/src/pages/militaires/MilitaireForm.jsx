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
  deleteDiplome,
  addNotation,
  addStageMilitaire
} from '../../redux/slices/militaireSlice';

// At the top of your file with other imports
import { 
  officierSuperieurGrades, 
  officierSubalterneGrades, 
  sousOfficierSuperieurGrades, 
  sousOfficierSubalterneGrades, 
  soldatGrades 
} from '../../constants/gradeConstants';

import DiplomModal from '../../components/DiplomModal';
import DecorationModal from '../../components/DecorationModal';
import DocumentModal from '../../components/DocumentModal';
import StageModal from '../../components/StageModal';
import NotationModal from '../../components/NotationModal';
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
  const [decorationsList, setDecorationsList] = useState([]);

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
  const [showStageModal, setShowStageModal] = useState(false);
  const [showNotationModal, setShowNotationModal] = useState(false);
  
  // State for storing temporary items before saving
  const [tempDiplomes, setTempDiplomes] = useState([]);
  const [tempDecorations, setTempDecorations] = useState([]);
  const [tempDocuments, setTempDocuments] = useState([]);
  const [tempStages, setTempStages] = useState([]);
  const [tempNotations, setTempNotations] = useState([]);

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
    categorieOfficier: null,
    categorieSousOfficier: null,
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
    documents: [],
    stages: [],
    notations: []
  });

  // Diplome form state
 
  
  // Decoration form state
  const [decorationForm, setDecorationForm] = useState({
    decorationId: '',
    description: '',
    dateObtention: new Date().toISOString().split('T')[0],
    observations: ''
  });
  
  // Document form state
  const [documentForm, setDocumentForm] = useState({
    nomFichier: '',
    typeDocument: 'IDENTITE',
    file: null
  });

  // Stage form state
  const [stageForm, setStageForm] = useState({
    titre: '',
    description: '',
    lieu: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    statut: 'EN_COURS',
    observations: ''
  });
  
  // Notation form state
  const [notationForm, setNotationForm] = useState({
    typeNotation: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    notateur: '',
    observations: ''
  });

  // Add this useEffect at the top of your MilitaireForm component to handle modals closing
  useEffect(() => {
    const handleMouseDown = (e) => {
      // For each modal that's open, prevent it from closing if user clicks inside form
      
      
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
      
      if (showStageModal) {
        const stageForm = document.getElementById('stage-form-container');
        if (stageForm && stageForm.contains(e.target)) {
          e.stopPropagation();
        }
      }
      
      if (showNotationModal) {
        const notationForm = document.getElementById('notation-form-container');
        if (notationForm && notationForm.contains(e.target)) {
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
  }, [showDiplomeModal, showDecorationModal, showDocumentModal, showStageModal, showNotationModal]);

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
        categorieOfficier: currentMilitaire.categorieOfficier || null,
        categorieSousOfficier: currentMilitaire.categorieSousOfficier || null,
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
      
      if (currentMilitaire.stagesMilitaires) {
        setTempStages(currentMilitaire.stagesMilitaires);
      }
      
      if (currentMilitaire.notations) {
        setTempNotations(currentMilitaire.notations);
      }
    }
  }, [currentMilitaire, isEditMode]);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'nni') {
      // Only allow digits for NNI and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').substring(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    }
   
    if (name === 'grade') {
      // Auto-detect category and subcategory based on grade
      const grade = value;
      let newCategorie = '';
      let newCategorieOfficier = null;
      let newCategorieSousOfficier = null;
      
      // Determine category based on grade
      if (officierSuperieurGrades.includes(grade)) {
        newCategorie = 'OFFICIER';
        newCategorieOfficier = 'OFFICIER_SUPERIEUR';
      } else if (officierSubalterneGrades.includes(grade)) {
        newCategorie = 'OFFICIER';
        newCategorieOfficier = 'OFFICIER_SUBALTERNE';
      } else if (sousOfficierSuperieurGrades.includes(grade)) {
        newCategorie = 'SOUS_OFFICIER';
        newCategorieSousOfficier = 'SOUS_OFFICIER_SUPERIEUR';
      } else if (sousOfficierSubalterneGrades.includes(grade)) {
        newCategorie = 'SOUS_OFFICIER';
        newCategorieSousOfficier = 'SOUS_OFFICIER_SUBALTERNE';
      } else if (soldatGrades.includes(grade)) {
        newCategorie = 'SOLDAT';
        // For soldiers, both subcategory fields should be null
      }
      
      // Update the form data with detected categories
      setFormData(prev => ({ 
        ...prev, 
        grade,
        categorie: newCategorie,
        categorieOfficier: newCategorieOfficier,
        categorieSousOfficier: newCategorieSousOfficier
      }));
    } else if (name === 'categorie') {
      // When changing the main category manually, reset subcategories to null
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        categorieOfficier: null,
        categorieSousOfficier: null,
        grade: '' // Reset grade when category changes
      }));
    }
    else if (name === 'sousUniteId') {
      // If value is empty string, set it to null
      setFormData(prev => ({ 
        ...prev, 
        [name]: value.trim() === '' ? null : value 
      }));
    }
    else if (name === 'armeId') {
      // Reset specialiteId when arme changes
      setFormData(prev => ({ ...prev, [name]: value, specialiteId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
  
  // Handle changes for stage form
  const handleStageChange = useCallback((e) => {
    const { name, value } = e.target;
    setStageForm(prev => ({ ...prev, [name]: value }));
  }, []);
  
  // Handle changes for notation form
  const handleNotationChange = useCallback((e) => {
    const { name, value } = e.target;
    setNotationForm(prev => ({ ...prev, [name]: value }));
  }, []);
  
 // Add a diplome to temp collection





// Add this to your useEffect
useEffect(() => {
  // Fetch decorations for dropdown
  const fetchDecorations = async () => {
    try {
      const response = await api.get('/api/militaires/decorations');
      setDecorationsList(response.data);
    } catch (error) {
      console.error('Error fetching decorations:', error);
    }
  };
  
  // Execute fetch
  fetchDecorations();
  
  // ... rest of your existing useEffect code
}, [dispatch, id, isEditMode]);

// Update handleAddDecoration function
const handleAddDecoration = useCallback((e) => {
  e.preventDefault();
  
  if (!decorationForm.decorationId || !decorationForm.dateObtention) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  // Find the decoration by ID to include its details
  const selectedDecoration = decorationsList.find(d => d.id === decorationForm.decorationId);
  
  const newDecoration = {
    ...decorationForm,
    id: `temp_${Date.now()}`, // Temporary ID until saved
    decoration: selectedDecoration
  };
  
  setTempDecorations(prev => [...prev, newDecoration]);
  
  // Reset form
  setDecorationForm({
    decorationId: '',
    description: '',
    dateObtention: new Date().toISOString().split('T')[0],
    observations: ''
  });
  
  // Close modal
  setShowDecorationModal(false);
}, [decorationForm, decorationsList]);

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

// Add a stage to temp collection
const handleAddStage = useCallback((e) => {
  e.preventDefault();
  
  if (!stageForm.titre || !stageForm.lieu || !stageForm.dateDebut) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  const newStage = {
    ...stageForm,
    id: `temp_${Date.now()}` // Temporary ID until saved
  };
  
  setTempStages(prev => [...prev, newStage]);
  
  // Reset form
  setStageForm({
    titre: '',
    description: '',
    lieu: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    statut: 'EN_COURS',
    observations: ''
  });
  
  // Close modal
  setShowStageModal(false);
}, [stageForm]);

// Add a notation to temp collection
const handleAddNotation = useCallback((e) => {
  e.preventDefault();
  
  if (!notationForm.typeNotation || !notationForm.date || !notationForm.note || !notationForm.notateur) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  const newNotation = {
    ...notationForm,
    id: `temp_${Date.now()}` // Temporary ID until saved
  };
  
  setTempNotations(prev => [...prev, newNotation]);
  
  // Reset form
  setNotationForm({
    typeNotation: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    notateur: '',
    observations: ''
  });
  
  // Close modal
  setShowNotationModal(false);
}, [notationForm]);

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

// Remove a stage from temp collection
const handleRemoveStage = useCallback((index) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce stage?')) {
    setTempStages(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }
}, []);

// Remove a notation from temp collection
const handleRemoveNotation = useCallback((index) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette notation?')) {
    setTempNotations(prev => {
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



// Handle form submission
const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  
  // Create a copy of the data for submission
  const submitData = { ...formData };
  
  if (!submitData.sousUniteId || submitData.sousUniteId === '') {
    submitData.sousUniteId = null;
  }

  // Add the attachments with the correct field names
  submitData.diplomes = tempDiplomes.map(d => ({
    diplomeId: d.diplomeId,
    description: d.description,
    dateObtention: d.dateObtention,
    observations: d.observations
  }));
  
  submitData.militaireDecorations = tempDecorations.map(d => ({
    decorationId: d.decorationId,
    description: d.description,
    dateObtention: d.dateObtention,
    observations: d.observations
  }));
  
  // Add the stages
  submitData.stages = tempStages.map(s => ({
    titre: s.titre,
    description: s.description,
    lieu: s.lieu,
    dateDebut: s.dateDebut,
    dateFin: s.dateFin,
    statut: s.statut,
    observations: s.observations
  }));
  
  // Add the notations
  submitData.notations = tempNotations.map(n => ({
    typeNotation: n.typeNotation,
    date: n.date,
    note: parseFloat(n.note),
    notateur: n.notateur,
    observations: n.observations
  }));
  
  // Handle categories properly with explicit null values
  // Do not convert null to empty string - maintain null values
  if (submitData.categorie === 'OFFICIER') {
    // For officers, ensure sous-officier category is null
    submitData.categorieSousOfficier = null;
    // Only set categorieOfficier if it's not already set
    if (!submitData.categorieOfficier) {
      submitData.categorieOfficier = 'OFFICIER_SUBALTERNE'; // Default value
    }
  } else if (submitData.categorie === 'SOUS_OFFICIER') {
    // For sous-officers, ensure officer category is null
    submitData.categorieOfficier = null;
    // Only set categorieSousOfficier if it's not already set
    if (!submitData.categorieSousOfficier) {
      submitData.categorieSousOfficier = 'SOUS_OFFICIER_SUBALTERNE'; // Default value
    }
  } else if (submitData.categorie === 'SOLDAT') {
    // For soldiers, both categories should be null
    submitData.categorieOfficier = null;
    submitData.categorieSousOfficier = null;
  }

  // Console log to ensure we're sending the correct data
  console.log('Submitting militaire data:', submitData);
  
  // Define the upload documents function inside handleSubmit to avoid the circular dependency
  const uploadDocuments = async (militaireId) => {
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
  };
  
  // Define functions to add notations and stages
  const addNotations = async (militaireId) => {
    for (const notation of tempNotations) {
      // Only add notations that don't already exist on the server
      if (notation.id.startsWith('temp_')) {
        try {
          await dispatch(addNotation({
            militaireId,
            notationData: {
              typeNotation: notation.typeNotation,
              date: notation.date,
              note: parseFloat(notation.note),
              notateur: notation.notateur,
              observations: notation.observations
            }
          })).unwrap();
        } catch (error) {
          console.error('Error adding notation:', error);
          // Continue with other notations even if one fails
        }
      }
    }
  };
  
  const addStages = async (militaireId) => {
    for (const stage of tempStages) {
      // Only add stages that don't already exist on the server
      if (stage.id.startsWith('temp_')) {
        try {
          await dispatch(addStageMilitaire({
            militaireId,
            stageData: {
              titre: stage.titre,
              description: stage.description,
              lieu: stage.lieu,
              dateDebut: stage.dateDebut,
              dateFin: stage.dateFin,
              statut: stage.statut,
              observations: stage.observations
            }
          })).unwrap();
        } catch (error) {
          console.error('Error adding stage:', error);
          // Continue with other stages even if one fails
        }
      }
    }
  };

  // Define function to add diplomas
const addDiplomas = async (militaireId) => {
  for (const diplome of tempDiplomes) {
    // Only add diplomas that don't already exist on the server
    if (diplome.id.startsWith('temp_')) {
      try {
       // In the addDiplomas function, change this line:
await dispatch(addDiplome({
  militaireId,
  diplomeData: {
    diplomeId: diplome.diplomeId,
    description: diplome.description,  // This is correct now
    dateObtention: diplome.dateObtention,
    observations: diplome.observations
  }
})).unwrap();
      } catch (error) {
        console.error('Error adding diplome:', error);
        // Continue with other diplomas even if one fails
      }
    }
  }
};
  


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
    
    // Add new diplomas, notations and stages
    await addDiplomas(result.id);
    await addNotations(result.id);
    await addStages(result.id);
    
    alert('Militaire mis à jour avec succès');
    navigate(`/militaires/${result.id}`);
  } else {
    const result = await dispatch(createMilitaire(submitData)).unwrap();
    
    // Upload documents if any
    if (tempDocuments.some(doc => doc.file)) {
      await uploadDocuments(result.id);
    }
    
    // Add diplomas, notations and stages for newly created militaire
    await addDiplomas(result.id);
    await addNotations(result.id);
    await addStages(result.id);
    
    alert('Militaire créé avec succès');
    navigate(`/militaires/${result.id}`);
  }
} catch (error) {
  console.error('Error saving militaire:', error);
  alert(`Erreur: ${error.error || 'Une erreur est survenue lors de l\'enregistrement'}`);
}
}, [
  formData, 
  tempDiplomes, 
  tempDecorations, 
  tempDocuments,
  tempStages,
  tempNotations,
  isEditMode, 
  id, 
  dispatch, 
  navigate
]);


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
            <select id="uniteId" name="uniteId" value={formData.uniteId}
                            onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                       <option value="">Sélectionner une unité</option>
                     {unites.map(i => <option key={i.id} value={i.id}>{i.nom} ({i.code})</option>)}
                     {unites.map(u => (
                       <option key={u.id} value={u.id}>
                          {u.code} – {u.nom}
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
          
          {/* Grade selection using the GradeSelect component */}
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
          
          {/* Display current category info in a more intuitive way */}
          {formData.grade && (
            <div className="form-group col-span-2">
              <label className="block text-gray-700 mb-1">
                Catégorie détectée
              </label>
              <div className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-700">
                {formData.categorie === 'OFFICIER' && (
                  <span>
                    <strong>Officier</strong>
                    {formData.categorieOfficier === 'OFFICIER_SUPERIEUR' ? 
                      ' (Supérieur)' : formData.categorieOfficier === 'OFFICIER_SUBALTERNE' ? 
                      ' (Subalterne)' : ''}
                  </span>
                )}
                
                {formData.categorie === 'SOUS_OFFICIER' && (
                  <span>
                    <strong>Sous-Officier</strong>
                    {formData.categorieSousOfficier === 'SOUS_OFFICIER_SUPERIEUR' ? 
                      ' (Supérieur)' : formData.categorieSousOfficier === 'SOUS_OFFICIER_SUBALTERNE' ? 
                      ' (Subalterne)' : ''}
                  </span>
                )}
                
                {formData.categorie === 'SOLDAT' && (
                  <span><strong>Soldat</strong></span>
                )}
                
                {!formData.categorie && (
                  <span className="text-gray-400">Aucune catégorie détectée</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                La catégorie est automatiquement détectée en fonction du grade sélectionné
              </p>
            </div>
          )}
          
          {/* Add hidden fields to ensure values are included in the form submission */}
          <input type="hidden" name="categorie" value={formData.categorie || ''} />
          <input type="hidden" name="categorieOfficier" value={formData.categorieOfficier || ''} />
          <input type="hidden" name="categorieSousOfficier" value={formData.categorieSousOfficier || ''} />
          
          <div className="form-group">
            <label htmlFor="groupeSanguin" className="block text-gray-700 mb-1">
              Groupe sanguin
            </label>
            <select
              id="groupeSanguin"
              name="groupeSanguin"
              value={formData.groupeSanguin || ''}
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
              value={formData.dateRecrutement || ''}
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
              value={formData.telephoneService || ''}
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
              value={formData.dateDernierePromotion || ''}
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
              value={formData.sousUniteId || ''} // Ensure it's an empty string when null
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
      onClick={() => setShowDiplomeModal(true)}
      className="bg-[#40916c] text-white px-4 py-2 rounded-md"
      
    >
      Ajouter un diplôme
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
        
        {/* Stages Militaires Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center border-b pb-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Stages militaires</h2>
            <button
              type="button"
              onClick={() => setShowStageModal(true)}
              className="bg-[#40916c] text-white px-3 py-1 rounded-md hover:bg-[#2d6a4f] text-sm transition-colors"
            >
              + Ajouter un stage
            </button>
          </div>
          
          {tempStages.length === 0 ? (
            <p className="text-gray-500 italic">Aucun stage militaire ajouté</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tempStages.map((stage, index) => (
                <div key={stage.id} className="border rounded-md p-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveStage(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <h4 className="font-medium">{stage.titre}</h4>
                  <p className="text-sm text-gray-600">Lieu: {stage.lieu}</p>
                  <p className="text-sm text-gray-500">
                    Période: {formatDate(stage.dateDebut)} 
                    {stage.dateFin && ` - ${formatDate(stage.dateFin)}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Statut: {
                      stage.statut === 'EN_COURS' ? 'En cours' :
                      stage.statut === 'EFFECTUE' ? 'Effectué' :
                      stage.statut === 'ANNULE' ? 'Annulé' :
                      stage.statut === 'PLANIFIE' ? 'Planifié' : stage.statut
                    }
                  </p>
                  {stage.description && (
                    <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Notations Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center border-b pb-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Notations</h2>
            <button
              type="button"
              onClick={() => setShowNotationModal(true)}
              className="bg-[#40916c] text-white px-3 py-1 rounded-md hover:bg-[#2d6a4f] text-sm transition-colors"
            >
              + Ajouter une notation
            </button>
          </div>
          
          {tempNotations.length === 0 ? (
            <p className="text-gray-500 italic">Aucune notation ajoutée</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tempNotations.map((notation, index) => (
                <div key={notation.id} className="border rounded-md p-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveNotation(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <h4 className="font-medium">{
                    notation.typeNotation === 'ANNUELLE' ? 'Notation annuelle' :
                    notation.typeNotation === 'EXCEPTIONNELLE' ? 'Notation exceptionnelle' :
                    notation.typeNotation === 'STAGE' ? 'Notation de stage' :
                    notation.typeNotation === 'MISSION' ? 'Notation de mission' : notation.typeNotation
                  }</h4>
                  <p className="text-sm text-gray-600">Note: <strong>{notation.note}/20</strong></p>
                  <p className="text-sm text-gray-500">Date: {formatDate(notation.date)}</p>
                  <p className="text-sm text-gray-500">Notateur: {notation.notateur}</p>
                  {notation.observations && (
                    <p className="text-sm text-gray-500 mt-1">{notation.observations}</p>
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
      militaireId={currentMilitaire?.id}
      availableDiplomes={diplomes}
      onDiplomeAdded={(newDiplome) => {
        setTempDiplomes((prev) => [...prev, newDiplome]);
      }}
    />
    

      <DecorationModal 
        showModal={showDecorationModal}
        onClose={() => setShowDecorationModal(false)}
        decorationForm={decorationForm}
        handleDecorationChange={handleDecorationChange}
        handleAddDecoration={handleAddDecoration}
        decorations={decorationsList}
      />

      <DocumentModal 
        showModal={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        documentForm={documentForm}
        handleDocumentChange={handleDocumentChange}
        handleAddDocument={handleAddDocument}
      />
      
      <StageModal 
        showModal={showStageModal}
        onClose={() => setShowStageModal(false)}
        stageForm={stageForm}
        handleStageChange={handleStageChange}
        handleAddStage={handleAddStage}
      />
      
      <NotationModal 
        showModal={showNotationModal}
        onClose={() => setShowNotationModal(false)}
        notationForm={notationForm}
        handleNotationChange={handleNotationChange}
        handleAddNotation={handleAddNotation}
      />
    </div>
  );
};

export default MilitaireForm;