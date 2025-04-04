// src/pages/militaires/MilitairesList.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { verifyAuth } from '../../redux/slices/authSlice';
import { fetchMilitaires, setPage, setLimit, deleteMilitaire } from '../../redux/slices/militaireSlice';
// Import icons
import { 
  EyeIcon, PencilSquareIcon, TrashIcon, 
  MagnifyingGlassIcon, PlusIcon, ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon,
  PrinterIcon // Added printer icon
} from '@heroicons/react/24/outline';
// Import print utility
import { printMilitairesList } from '../../utils/PrintUtils';

const MilitairesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const militairesState = useSelector(state => state.militaires);
  const auth = useSelector(state => state.auth);
  
  // Extract values with defaults to prevent undefined errors
  const militaires = militairesState?.militaires || [];
  const isLoading = militairesState?.isLoading || false;
  const error = militairesState?.error || null;
  
  // Provide default pagination values to prevent undefined errors
  const pagination = militairesState?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useState({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [militaireToDelete, setMilitaireToDelete] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false); // State to track printing status
  
  // Observer for infinite scrolling
  const observer = useRef();
  const lastMilitaireElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.page < pagination.totalPages && isMobile) {
        dispatch(setPage(pagination.page + 1));
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, pagination.page, pagination.totalPages, isMobile, dispatch]);

  // Check for window resize to update mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verify authentication and load initial data
  useEffect(() => {
    const verifyAndLoadData = async () => {
      // Only proceed if we're authenticated but haven't loaded data yet
      if (!auth.isAuthenticated || initialLoadDone) return;
      
      console.log('Starting authentication verification');
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token available');
          navigate('/login');
          return;
        }
        
        // Load data with the token
        console.log('Loading militaires data');
        await dispatch(fetchMilitaires({
          page: pagination.page,
          limit: pagination.limit,
          ...searchParams
        })).unwrap();
        
        // Mark as done only on success
        setInitialLoadDone(true);
        console.log('Initial data load complete');
      } catch (err) {
        console.error('Error loading data:', err);
        
        if (err?.status === 401) {
          navigate('/login');
        }
      }
    };
    
    verifyAndLoadData();
    
    // Only depend on auth state, not initialLoadDone which would cause reruns
  }, [auth.isAuthenticated, dispatch, navigate]);

  // Separate useEffect for pagination/search changes
  useEffect(() => {
    // Only update data if we've already done an initial load
    if (!initialLoadDone || !auth.isAuthenticated) return;
    
    console.log('Loading updated data due to filter/pagination change');
    
    dispatch(fetchMilitaires({
      page: pagination.page,
      limit: pagination.limit,
      ...searchParams
    }));
    
    // Don't include initialLoadDone in dependencies
  }, [pagination.page, pagination.limit, searchParams, auth.isAuthenticated, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchTerm ? { search: searchTerm } : {});
    dispatch(setPage(1)); // Reset to page 1 when searching
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (e) => {
    dispatch(setLimit(Number(e.target.value)));
    dispatch(setPage(1)); // Reset to page 1 when changing items per page
  };
  
  const openDeleteModal = (militaire) => {
    setMilitaireToDelete(militaire);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMilitaireToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (!militaireToDelete) return;
    
    try {
      await dispatch(deleteMilitaire(militaireToDelete.id)).unwrap();
      closeDeleteModal();
      // Success notification could be added here
    } catch (err) {
      console.error('Error deleting militaire:', err);
      // Error notification could be added here
    }
  };
  
  // Handle print list
  const handlePrintList = () => {
    if (isPrinting || militaires.length === 0) return;
    
    setIsPrinting(true);
    
    try {
      // Navigate to the dedicated print page
      navigate('/militaires/print');
    } catch (error) {
      console.error('Error navigating to print page:', error);
      setIsPrinting(false);
    }
  };

  // Format grade for display
  const formatGrade = (grade) => {
    if (!grade) return '-';
    return grade.replace(/_/g, ' ');
  };

  // Loading state
  if (isLoading && !initialLoadDone) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#40916c]"></div>
          <p className="mt-2 text-gray-500">Chargement des militaires...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
      {/* Header with responsive design */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Liste des Militaires</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Print button - Added here */}
          <button
            onClick={handlePrintList}
            disabled={isPrinting || militaires.length === 0}
            className={`bg-[#2d6a4f] text-white px-3 py-2 rounded-lg hover:bg-[#1c4330] transition-colors flex items-center justify-center w-full sm:w-auto ${
              isPrinting || militaires.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PrinterIcon className="h-5 w-5 mr-1" />
            <span>Imprimer</span>
          </button>
          
          <Link 
            to="/militaires/new" 
            className="bg-[#40916c] text-white px-3 py-2 rounded-lg hover:bg-[#2d6a49] transition-colors flex items-center justify-center w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            <span>Ajouter un militaire</span>
          </Link>
        </div>
      </div>

      {/* Search form - responsive */}
      <form onSubmit={handleSearch} className="mb-4 md:mb-6">
        <div className="relative flex items-center border rounded-lg overflow-hidden shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un militaire..."
            className="flex-grow px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#40916c]/20"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </div>
          <button
            type="submit"
            className="bg-[#40916c] text-white px-3 py-2 hover:bg-[#2d6a49] transition-colors"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-3">
          {militaires && militaires.length > 0 ? (
            militaires.map((militaire, index) => {
              // Apply ref to the last item for infinite scrolling
              const isLastElement = index === militaires.length - 1;
              return (
                <div 
                  key={militaire.id || militaire.matricule} 
                  ref={isLastElement ? lastMilitaireElementRef : null}
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-[#40916c]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg">
                        {militaire.personnel?.nom || '-'} {militaire.personnel?.prenom || '-'}
                      </h3>
                      <p className="text-sm text-gray-500">Mat: {militaire.matricule}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Link to={`/militaires/${militaire.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full tooltip-container">
                        <EyeIcon className="h-5 w-5" />
                        <span className="tooltip">Voir</span>
                      </Link>
                      <Link to={`/militaires/edit/${militaire.id}`} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full tooltip-container">
                        <PencilSquareIcon className="h-5 w-5" />
                        <span className="tooltip">Modifier</span>
                      </Link>
                      <button 
                        onClick={() => openDeleteModal(militaire)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full tooltip-container"
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span className="tooltip">Supprimer</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Grade:</span>
                      <span className="ml-1">{formatGrade(militaire.grade)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Catégorie:</span>
                      <span className="ml-1">{militaire.categorie?.replace(/_/g, ' ') || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Unité:</span>
                      <span className="ml-1">{militaire.division || militaire.sousUnite?.nom || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Situation:</span>
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                        militaire.situation === 'PRESENT' ? 'bg-green-100 text-green-800' :
                        militaire.situation === 'MISSION' ? 'bg-blue-100 text-blue-800' :
                        militaire.situation === 'CONGE' ? 'bg-yellow-100 text-yellow-800' :
                        militaire.situation === 'HOSPITALISATION' ? 'bg-red-100 text-red-800' :
                        militaire.situation === 'ABSENT' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {militaire.situation?.replace(/_/g, ' ') || 'PRESENT'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
              {isLoading ? "Chargement..." : "Aucun militaire trouvé"}
            </div>
          )}
          
          {/* Loading indicator for infinite scroll */}
          {isLoading && initialLoadDone && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#40916c]"></div>
            </div>
          )}
        </div>
      ) : (
        // Desktop table view
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prénom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {militaires && militaires.length > 0 ? (
                  militaires.map((militaire) => (
                    <tr key={militaire.id || militaire.matricule} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {militaire.matricule}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {militaire.personnel?.nom || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {militaire.personnel?.prenom || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatGrade(militaire.grade)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {militaire.categorie?.replace(/_/g, ' ') || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          militaire.situation === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          militaire.situation === 'MISSION' ? 'bg-blue-100 text-blue-800' :
                          militaire.situation === 'CONGE' ? 'bg-yellow-100 text-yellow-800' :
                          militaire.situation === 'HOSPITALISATION' ? 'bg-red-100 text-red-800' :
                          militaire.situation === 'ABSENT' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {militaire.situation?.replace(/_/g, ' ') || 'PRESENT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {militaire.division || militaire.sousUnite?.nom || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                        <div className="flex justify-end space-x-1">
                          <Link 
                            to={`/militaires/${militaire.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full tooltip-container"
                            title="Voir"
                          >
                            <EyeIcon className="h-5 w-5" />
                            <span className="tooltip">Voir</span>
                          </Link>
                          <Link 
                            to={`/militaires/edit/${militaire.id}`}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-full tooltip-container"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                            <span className="tooltip">Modifier</span>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(militaire)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full tooltip-container"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                            <span className="tooltip">Supprimer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-center text-gray-500">
                      {isLoading ? "Chargement..." : "Aucun militaire trouvé"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - only show if we have pages */}
          {pagination && pagination.totalPages > 0 && (
            <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center mb-3 md:mb-0">
                <span className="mr-2 text-sm text-gray-600">Afficher:</span>
                <select
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              
              <div className="flex items-center justify-center md:justify-end">
                <span className="mr-4 text-sm text-gray-600">
                  Page {pagination.page} sur {pagination.totalPages} 
                  <span className="hidden md:inline"> ({pagination.total} résultats)</span>
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className={`p-1.5 rounded ${
                      pagination.page === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronDoubleLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-1.5 rounded ${
                      pagination.page === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  
                  {/* Page numbers - only render if we have pagination data */}
                  {pagination.totalPages > 0 && 
                    Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(pageNum => (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                      ))
                      .map((pageNum, i, array) => (
                        <React.Fragment key={pageNum}>
                          {i > 0 && array[i - 1] !== pageNum - 1 && (
                            <span className="p-1.5 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`p-1.5 rounded w-8 h-8 flex items-center justify-center ${
                              pagination.page === pageNum
                                ? 'bg-[#40916c] text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      ))
                  }
                    
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-1.5 rounded ${
                      pagination.page === pagination.totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-1.5 rounded ${
                      pagination.page === pagination.totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronDoubleRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le militaire {militaireToDelete?.personnel?.nom} {militaireToDelete?.personnel?.prenom} ({militaireToDelete?.matricule}) ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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

export default MilitairesList;