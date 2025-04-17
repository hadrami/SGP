// src/pages/institutes/InstitutesList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchInstituts, setPage, setLimit, deleteInstitut } from '../../redux/slices/institutSlice';
// Import icons
import { 
  EyeIcon, PencilSquareIcon, TrashIcon, 
  MagnifyingGlassIcon, PlusIcon, ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const InstitutesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const institutsState = useSelector(state => state.instituts);
  const auth = useSelector(state => state.auth);
  
  // Extract values with defaults to prevent undefined errors
  const instituts = institutsState?.instituts || [];
  const isLoading = institutsState?.isLoading || false;
  const error = institutsState?.error || null;
  
  // Provide default pagination values to prevent undefined errors
  const pagination = institutsState?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useState({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [institutToDelete, setInstitutToDelete] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Filter instituts by type to only show INSTITUT type
  const filteredInstituts = instituts.filter(inst => inst.type === 'INSTITUT');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!auth.isAuthenticated || initialLoadDone) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Load data with the token
        console.log('Loading institutes data');
        await dispatch(fetchInstituts({
          page: pagination.page,
          limit: pagination.limit,
          ...searchParams,
          type: 'INSTITUT' // Only fetch INSTITUT type
        })).unwrap();
        
        setInitialLoadDone(true);
      } catch (err) {
        console.error('Error loading data:', err);
        
        if (err?.status === 401) {
          navigate('/login');
        }
      }
    };
    
    loadData();
  }, [auth.isAuthenticated, dispatch, navigate]);

  // Separate useEffect for pagination/search changes
  useEffect(() => {
    // Only update data if we've already done an initial load
    if (!initialLoadDone || !auth.isAuthenticated) return;
    
    dispatch(fetchInstituts({
      page: pagination.page,
      limit: pagination.limit,
      ...searchParams,
      type: 'INSTITUT' // Ensure we only fetch INSTITUT type
    }));
    
  }, [pagination.page, pagination.limit, searchParams, auth.isAuthenticated, initialLoadDone, dispatch]);

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
  
  const openDeleteModal = (institut) => {
    setInstitutToDelete(institut);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setInstitutToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (!institutToDelete) return;
    
    try {
      await dispatch(deleteInstitut(institutToDelete.id)).unwrap();
      closeDeleteModal();
      // Success notification could be added here
    } catch (err) {
      console.error('Error deleting institute:', err);
      // Error notification could be added here
    }
  };
  
  // Handle print list
  const handlePrintList = () => {
    if (isPrinting || filteredInstituts.length === 0) return;
    
    setIsPrinting(true);
    
    try {
      // Navigate to the dedicated print page
      navigate('/institutes/print');
    } catch (error) {
      console.error('Error navigating to print page:', error);
      setIsPrinting(false);
    }
  };

  // Loading state
  if (isLoading && !initialLoadDone) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#40916c]"></div>
          <p className="mt-2 text-gray-500">Chargement des instituts...</p>
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Liste des Instituts</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Print button */}
          <button
            onClick={handlePrintList}
            disabled={isPrinting || filteredInstituts.length === 0}
            className={`bg-[#2d6a4f] text-white px-3 py-2 rounded-lg hover:bg-[#1c4330] transition-colors flex items-center justify-center w-full sm:w-auto ${
              isPrinting || filteredInstituts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PrinterIcon className="h-5 w-5 mr-1" />
            <span>Imprimer</span>
          </button>
          
          <Link 
            to="/institutes/new" 
            className="bg-[#40916c] text-white px-3 py-2 rounded-lg hover:bg-[#2d6a49] transition-colors flex items-center justify-center w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            <span>Ajouter un institut</span>
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
            placeholder="Rechercher un institut..."
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

      {/* Desktop table view */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Année d'Étude
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécialité
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstituts && filteredInstituts.length > 0 ? (
                filteredInstituts.map((institut) => (
                  <tr key={institut.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {institut.code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {institut.nom}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {institut.institut?.emplacement || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {institut.institut?.anneeEtude || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {institut.institut?.specialite || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex justify-end space-x-1">
                        <Link 
                          to={`/institutes/${institut.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full tooltip-container"
                          title="Voir"
                        >
                          <EyeIcon className="h-5 w-5" />
                          <span className="tooltip">Voir</span>
                        </Link>
                        <Link 
                          to={`/institutes/edit/${institut.id}`}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-full tooltip-container"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                          <span className="tooltip">Modifier</span>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(institut)}
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
                  <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                    {isLoading ? "Chargement..." : "Aucun institut trouvé"}
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
.map(pageNum => (
  <button
    key={pageNum}
    onClick={() => handlePageChange(pageNum)}
    className={`p-1.5 min-w-[32px] rounded text-sm ${
      pageNum === pagination.page
        ? 'bg-[#40916c] text-white'
        : 'text-gray-700 hover:bg-gray-200'
    }`}
  >
    {pageNum}
  </button>
))}
                
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

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer l'institut
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Voulez-vous vraiment supprimer cet institut ? Cette action est irréversible.
                      </p>
                      {institutToDelete && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-sm font-semibold">{institutToDelete.nom}</p>
                          <p className="text-xs text-gray-500">Code: {institutToDelete.code}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutesList;