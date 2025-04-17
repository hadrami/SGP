// src/pages/unites/UniteDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUniteById, fetchUniteByCode, fetchUnitePersonnel, deleteUnite } from '../../redux/slices/uniteSlice';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import { EyeIcon, PencilSquareIcon, TrashIcon, HomeIcon , UserPlusIcon, PrinterIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { printUnitePersonnel } from '../../utils/PrintUtils';

const UniteDetail = () => {
  const { code } = useParams(); // Get the code or id from URL parameter
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unite, setUnite] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    const loadUnite = async () => {
      try {
        setLoading(true);
        let uniteData;
        
        // First try to fetch by ID
        try {
          uniteData = await dispatch(fetchUniteById(code)).unwrap();
        } catch (idError) {
          console.log('Not found by ID, trying code lookup...');
          // If that fails, try to fetch by code
          uniteData = await dispatch(fetchUniteByCode(code)).unwrap();
        }
        
        setUnite(uniteData);
        
        // Fetch personnel for this unite
        if (uniteData && uniteData.id) {
          const personnelData = await dispatch(fetchUnitePersonnel({
            uniteId: uniteData.id,
            page: pagination.page,
            limit: pagination.limit
          })).unwrap();
          
          setPersonnel(personnelData.data || []);
          setPagination(personnelData.pagination || pagination);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading unite data:', err);
        setError(err.message || 'Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    if (code) {
      loadUnite();
    }
  }, [code, dispatch, pagination.page, pagination.limit]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteUnite(unite.id)).unwrap();
      setShowDeleteConfirm(false);
      navigate('/unites');
    } catch (err) {
      console.error('Error deleting unite:', err);
      setError(err.message || 'Erreur lors de la suppression de l\'unité');
      setShowDeleteConfirm(false);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    if (isPrinting || !unite || personnel.length === 0) return;
    
    setIsPrinting(true);
    
    try {
      // Call the print utility function
      printUnitePersonnel(personnel, unite, pagination);
      
      // Reset printing state after a delay
      setTimeout(() => {
        setIsPrinting(false);
      }, 2000);
    } catch (error) {
      console.error('Error printing personnel list:', error);
      setIsPrinting(false);
    }
  };

  // Format personnel type for display
  const formatPersonnelType = (type) => {
    if (!type) return '-';
    return type.replace('CIVIL_', '').replace(/_/g, ' ');
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} />;
  if (!unite) return <ErrorAlert message="Unité non trouvée" />;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top actions bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#40916c] mb-4 md:mb-0">Détails de l'Unité</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/unites"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Dahboard
          </Link>
          <button 
            onClick={handlePrint}
            disabled={isPrinting || personnel.length === 0}
            className={`bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center ${
              isPrinting || personnel.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PrinterIcon className="w-5 h-5 mr-2" />
            Imprimer
          </button>
      
        
        </div>
      </div>

      {/* Unite details card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#40916c] mb-2">{unite.nom}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600"><span className="font-semibold">Code:</span> {unite.code}</p>
            <p className="text-gray-600"><span className="font-semibold">Type:</span> {unite.type}</p>
            {unite.institut && (
              <>
                <p className="text-gray-600"><span className="font-semibold">Emplacement:</span> {unite.institut.emplacement}</p>
                <p className="text-gray-600"><span className="font-semibold">Année d'étude:</span> {unite.institut.anneeEtude || 'N/A'}</p>
                <p className="text-gray-600"><span className="font-semibold">Spécialité:</span> {unite.institut.specialite || 'N/A'}</p>
              </>
            )}
            {unite.dct && (
              <>
                <p className="text-gray-600"><span className="font-semibold">Domaine:</span> {unite.dct.domaine || 'N/A'}</p>
                <p className="text-gray-600"><span className="font-semibold">Niveau:</span> {unite.dct.niveau || 'N/A'}</p>
              </>
            )}
            {unite.pc && (
              <>
                <p className="text-gray-600"><span className="font-semibold">Type PC:</span> {unite.pc.typePC || 'N/A'}</p>
                <p className="text-gray-600"><span className="font-semibold">Zone d'opération:</span> {unite.pc.zoneOperation || 'N/A'}</p>
              </>
            )}
          </div>
          <div>
            <p className="text-gray-600"><span className="font-semibold">Description:</span></p>
            <p className="text-gray-600">{unite.description || 'Aucune description disponible'}</p>
          </div>
        </div>
      </div>

      {/* Personnel list section - Header with action buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#40916c]">Personnel</h2>
        <Link
          to={`/militaires/new?uniteId=${unite.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Ajouter un militaire
        </Link>
      </div>

      {/* Personnel data table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {personnel.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personnel.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{person.nom}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{person.prenom}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          person.typePersonnel === 'MILITAIRE' ? 'bg-green-100 text-green-800' :
                          person.typePersonnel === 'CIVIL_PROFESSEUR' ? 'bg-blue-100 text-blue-800' :
                          person.typePersonnel === 'CIVIL_ETUDIANT' ? 'bg-yellow-100 text-yellow-800' :
                          person.typePersonnel === 'CIVIL_EMPLOYE' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatPersonnelType(person.typePersonnel)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {person.typePersonnel === 'MILITAIRE' && person.militaire && (
                          <span>
                            {person.militaire.grade && person.militaire.grade.replace(/_/g, ' ')}
                            {person.militaire.matricule && ` - ${person.militaire.matricule}`}
                          </span>
                        )}
                        {person.typePersonnel === 'CIVIL_PROFESSEUR' && person.professeur && (
                          <span>{person.professeur.specialite}</span>
                        )}
                        {person.typePersonnel === 'CIVIL_ETUDIANT' && person.etudiant && (
                          <span>
                          {person.etudiant.matricule}
                          {person.etudiant.anneeEtude && ` - ${person.etudiant.anneeEtude}e année`}
                        </span>
                      )}
                      {person.typePersonnel === 'CIVIL_EMPLOYE' && person.employe && (
                        <span>{person.employe.position}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex justify-end space-x-1">
                        {/* View action button */}
                        {person.typePersonnel === 'MILITAIRE' && person.militaire && (
                          <Link 
                            to={`/militaires/${person.militaire.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full tooltip-container"
                            title="Voir"
                          >
                            <EyeIcon className="h-5 w-5" />
                            <span className="tooltip">Voir</span>
                          </Link>
                        )}

                        {/* Edit action button */}
                        {person.typePersonnel === 'MILITAIRE' && person.militaire && (
                          <Link 
                            to={`/militaires/edit/${person.militaire.id}`}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-full tooltip-container"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                            <span className="tooltip">Modifier</span>
                          </Link>
                        )}

                        {/* Delete action button - would need a separate delete handler for personnel */}
                        {person.typePersonnel === 'MILITAIRE' && person.militaire && (
                          <button 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full tooltip-container"
                            title="Supprimer"
                            onClick={() => {/* Handle delete personnel */}}
                          >
                            <TrashIcon className="h-5 w-5" />
                            <span className="tooltip">Supprimer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center p-4 border-t border-gray-200">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`p-2 rounded ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  Précédent
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      pageNum === pagination.page ? 'bg-[#40916c] text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`p-2 rounded ${pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  Suivant
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center py-6">Aucun personnel trouvé pour cette unité</p>
      )}
    </div>

    {/* Delete confirmation modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
          <p className="mb-6">
            Êtes-vous sûr de vouloir supprimer l'unité <span className="font-semibold">{unite.nom}</span> ?
            Cette action est irréversible.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    )}

    {/* CSS for tooltips */}
    <style jsx="true">{`
      .tooltip-container {
        position: relative;
      }
      .tooltip {
        visibility: hidden;
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
      }
      .tooltip-container:hover .tooltip {
        visibility: visible;
        opacity: 1;
      }
    `}</style>
  </div>
);
};

export default UniteDetail;