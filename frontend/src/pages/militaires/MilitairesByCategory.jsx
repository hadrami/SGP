// src/pages/militaires/MilitairesByCategory.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchMilitaires, deleteMilitaire, setPage, setLimit } from '../../redux/slices/militaireSlice';

const MilitairesByCategory = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { militaires, pagination, isLoading, error } = useSelector(state => state.militaires);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  // Map URL param to actual category value
  const categoryMapping = {
    'officier': 'OFFICIER',
    'sous-officier': 'SOUS_OFFICIER',
    'soldat': 'SOLDAT'
  };
  
  // Display name for the category
  const categoryDisplayNames = {
    'OFFICIER': 'Officiers',
    'SOUS_OFFICIER': 'Sous-Officiers',
    'SOLDAT': 'Soldats'
  };
  
  const actualCategory = categoryMapping[category.toLowerCase()];
  const categoryDisplayName = categoryDisplayNames[actualCategory] || 'Militaires';

  // Fetch militaires on component mount and when pagination changes
  useEffect(() => {
    loadMilitaires();
  }, [pagination.page, pagination.limit, category]);

  // Load militaires with filters
  const loadMilitaires = (filters = {}) => {
    dispatch(fetchMilitaires({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      categorie: actualCategory,
      ...filters
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadMilitaires();
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      dispatch(setPage(newPage));
    }
  };

  // Handle delete confirmation
  const confirmDelete = (militaire) => {
    setDeleteConfirmation(militaire);
  };

  // Handle delete militaire
  const handleDelete = async () => {
    if (deleteConfirmation) {
      await dispatch(deleteMilitaire(deleteConfirmation.id));
      setDeleteConfirmation(null);
      loadMilitaires();
    }
  };

  // Format grade for display
  const formatGrade = (grade) => {
    if (!grade) return '';
    return grade.replace(/_/g, ' ');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#40916c] mb-4 md:mb-0">
          Liste des {categoryDisplayName}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link 
            to="/militaires/new" 
            className="bg-[#40916c] text-white px-4 py-2 rounded-md hover:bg-[#2d6a4f] transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Ajouter un militaire
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-grow min-w-[200px]">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou matricule..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#40916c]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="bg-[#40916c] text-white px-4 py-2 rounded-md hover:bg-[#2d6a4f] transition-colors"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#40916c]"></div>
          <p className="mt-2 text-gray-500">Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Category description */}
          <div className="bg-[#90e0ef] bg-opacity-20 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-[#40916c]">
              {categoryDisplayName}
            </h2>
            <p className="text-gray-600 mt-1">
              {actualCategory === 'OFFICIER' && 
                "Les officiers sont chargés du commandement, de la conception et de la coordination des opérations militaires."}
              {actualCategory === 'SOUS_OFFICIER' && 
                "Les sous-officiers ont un rôle d'encadrement et assurent la liaison entre les officiers et les militaires du rang."}
              {actualCategory === 'SOLDAT' && 
                "Les soldats constituent la base opérationnelle des forces armées et participent à l'exécution des missions."}
            </p>
          </div>

          {/* Militaires table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom & Prénom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {militaires.length > 0 ? (
                    militaires.map((militaire) => (
                      <tr key={militaire.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {militaire.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {militaire.personnel?.nom} {militaire.personnel?.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatGrade(militaire.grade)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {militaire.personnel?.institut?.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link 
                              to={`/militaires/${militaire.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Voir
                            </Link>
                            <Link 
                              to={`/militaires/edit/${militaire.id}`} 
                              className="text-[#40916c] hover:text-[#2d6a4f]"
                            >
                              Modifier
                            </Link>
                            <button 
                              onClick={() => confirmDelete(militaire)} 
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun militaire trouvé dans cette catégorie
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {militaires.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  sur <span className="font-medium">{pagination.total}</span> résultats
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page <= 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Précédent
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 rounded-md ${
                        pageNumber === pagination.page
                          ? 'bg-[#40916c] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page >= pagination.totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Confirmation de suppression</h2>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer le militaire{' '}
              <span className="font-semibold">
                {deleteConfirmation.personnel?.nom} {deleteConfirmation.personnel?.prenom}
              </span>{' '}
              avec le matricule <span className="font-semibold">{deleteConfirmation.matricule}</span> ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilitairesByCategory;