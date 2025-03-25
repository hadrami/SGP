// src/pages/militaires/MilitaireDetail.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchMilitaireByMatricule, fetchMilitaireById, clearCurrentMilitaire, deleteMilitaire, fetchMilitaireSituationHistory } from '../../redux/slices/militaireSlice';

const MilitaireDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentMilitaire, isLoading, error, situationHistory } = useSelector(state => state.militaires);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  useEffect(() => {
    if (id.includes('-')) {
      dispatch(fetchMilitaireById(id));
    } else {
      dispatch(fetchMilitaireByMatricule(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentMilitaire());
    };
  }, [dispatch, id]);

  // Format date in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Format grade for display
  const formatGrade = (grade) => {
    if (!grade) return '';
    return grade.replace(/_/g, ' ');
  };

  // Format groupe sanguin for display
  const formatGroupeSanguin = (groupe) => {
    if (!groupe) return 'Non spécifié';
    return groupe.replace(/_/g, '');
  };
  
  // Get situation class and color
  const getSituationStyle = (situation) => {
    switch(situation) {
      case 'PRESENT':
        return 'bg-green-500 text-white';
      case 'MISSION':
        return 'bg-blue-500 text-white';
      case 'CONGE':
        return 'bg-yellow-500 text-white';
      case 'HOSPITALISATION':
        return 'bg-red-500 text-white';
      case 'FORMATION':
        return 'bg-purple-500 text-white';
      case 'DETACHEMENT':
        return 'bg-indigo-500 text-white';
      case 'RETRAITE':
        return 'bg-gray-500 text-white';
      case 'DISPONIBILITE':
        return 'bg-pink-500 text-white';
      case 'DESERTEUR':
        return 'bg-red-700 text-white';
      case 'ABSENT':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Get status badge for stages
  const getStageStatusBadge = (status) => {
    switch(status) {
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800';
      case 'EFFECTUE':
        return 'bg-green-100 text-green-800';
      case 'PLANIFIE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANNULE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get rating color based on score
  const getRatingColor = (note) => {
    if (note >= 16) return 'bg-green-100 text-green-800';
    if (note >= 12) return 'bg-blue-100 text-blue-800';
    if (note >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  // Handle delete militaire
  const handleDelete = async () => {
    if (currentMilitaire) {
      await dispatch(deleteMilitaire(currentMilitaire.id));
      navigate('/militaires');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#40916c] mb-4 md:mb-0">Détails du Militaire</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/militaires"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Retour à la liste
          </Link>
          {currentMilitaire && (
            <>
              <Link
                to={`/militaires/edit/${currentMilitaire.id}`}
                className="bg-[#40916c] text-white px-4 py-2 rounded-md hover:bg-[#2d6a4f] transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Modifier
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Supprimer
              </button>
            </>
          )}
        </div>
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
      ) : currentMilitaire ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* En-tête avec informations principales */}
          <div className="bg-[#40916c] p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{currentMilitaire.personnel?.nom} {currentMilitaire.personnel?.prenom}</h2>
                <p className="mt-1 text-white opacity-90">
                  {formatGrade(currentMilitaire.grade)} • Matricule: {currentMilitaire.matricule}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#40916c] text-sm font-medium">
                  {currentMilitaire.categorie?.replace(/_/g, ' ')}
                  {currentMilitaire.categorieOfficier && ` - ${currentMilitaire.categorieOfficier.replace(/_/g, ' ')}`}
                  {currentMilitaire.categorieSousOfficier && ` - ${currentMilitaire.categorieSousOfficier.replace(/_/g, ' ')}`}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSituationStyle(currentMilitaire.situation)}`}>
                {currentMilitaire.situation?.replace(/_/g, ' ') || 'PRÉSENT'} 
                {currentMilitaire.situationDepuis && ` depuis le ${formatDate(currentMilitaire.situationDepuis)}`}
              </div>
            </div>
          </div>

          {/* Contenu avec les détails */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Informations personnelles */}
              <div>
                <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
                  Informations personnelles
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">NNI</p>
                    <p className="font-medium">{currentMilitaire.personnel?.nni || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de naissance</p>
                    <p className="font-medium">{formatDate(currentMilitaire.personnel?.dateNaissance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lieu de naissance</p>
                    <p className="font-medium">{currentMilitaire.personnel?.lieuNaissance || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{currentMilitaire.personnel?.telephone || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentMilitaire.personnel?.email || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Institut</p>
                    <p className="font-medium">{currentMilitaire.personnel?.institut?.nom || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              {/* Informations militaires */}
              <div>
                <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
                  Informations militaires
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Groupe sanguin</p>
                    <p className="font-medium">{formatGroupeSanguin(currentMilitaire.groupeSanguin)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de recrutement</p>
                    <p className="font-medium">{formatDate(currentMilitaire.dateRecrutement)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de dernière promotion</p>
                    <p className="font-medium">{formatDate(currentMilitaire.dateDernierePromotion)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone de service</p>
                    <p className="font-medium">{currentMilitaire.telephoneService || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Division</p>
                    <p className="font-medium">{currentMilitaire.division || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fonction</p>
                    <p className="font-medium">{currentMilitaire.fonction?.titre || currentMilitaire.position?.titre || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Informations sur la situation */}
              <div>
                <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
                  Situation Actuelle
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Situation</p>
                    <p className="font-medium">{currentMilitaire.situation?.replace(/_/g, ' ') || 'PRÉSENT'}</p>
                  </div>
                  {currentMilitaire.situationDetail && (
                    <div>
                      <p className="text-sm text-gray-500">Détails de la situation</p>
                      <p className="font-medium">{currentMilitaire.situationDetail}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Depuis le</p>
                    <p className="font-medium">{formatDate(currentMilitaire.situationDepuis)}</p>
                  </div>
                  {currentMilitaire.situationJusqua && (
                    <div>
                      <p className="text-sm text-gray-500">Jusqu'au</p>
                      <p className="font-medium">{formatDate(currentMilitaire.situationJusqua)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations professionnelles */}
              <div>
                <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
                  Informations Professionnelles
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Arme / Branche</p>
                    <p className="font-medium">{currentMilitaire.arme?.nom || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Spécialité</p>
                    <p className="font-medium">{currentMilitaire.specialite?.nom || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sous-unité</p>
                    <p className="font-medium">{currentMilitaire.sousUnite?.nom || 'Non spécifiée'}</p>
                  </div>
                  {currentMilitaire.sousUnite?.unite && (
                    <div>
                      <p className="text-sm text-gray-500">Unité</p>
                      <p className="font-medium">{currentMilitaire.sousUnite.unite.nom}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Historique de situations */}
            {currentMilitaire.situationsHistorique && currentMilitaire.situationsHistorique.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
                  Historique des situations
                </h3>
                <div className="bg-white overflow-hidden border rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Situation</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentMilitaire.situationsHistorique.map((situation) => (
                          <tr key={situation.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${getSituationStyle(situation.situation)}`}>
                                {situation.situation.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{situation.detail || '-'}</td>
                            <td className="px-4 py-3 text-sm">{formatDate(situation.dateDebut)}</td>
                            <td className="px-4 py-3 text-sm">{formatDate(situation.dateFin)}</td>
                            <td className="px-4 py-3 text-sm">{situation.observations || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
{/* Décorations */}
{currentMilitaire.decorations && currentMilitaire.decorations.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
      Décorations
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentMilitaire.decorations.map((decoration) => (
        <div key={decoration.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-[#40916c] bg-opacity-10 p-2 rounded-md mr-3">
              <svg className="w-6 h-6 text-[#40916c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{decoration.titre}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Obtenue le {formatDate(decoration.dateObtention)}
              </p>
              {decoration.description && (
                <p className="text-sm text-gray-600 mt-2">{decoration.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Notations */}
{currentMilitaire.notations && currentMilitaire.notations.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
      Notations
    </h3>
    <div className="bg-white overflow-hidden border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notateur</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentMilitaire.notations.map((notation) => (
              <tr key={notation.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{notation.typeNotation.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(notation.date)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <span className={`px-2 py-1 rounded-full ${getRatingColor(notation.note)}`}>
                    {notation.note.toFixed(1)}/20
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{notation.notateur}</td>
                <td className="px-4 py-3 text-sm">{notation.observations || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{/* Stages militaires */}
{currentMilitaire.stagesMilitaires && currentMilitaire.stagesMilitaires.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
      Stages militaires
    </h3>
    <div className="bg-white overflow-hidden border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentMilitaire.stagesMilitaires.map((stage) => (
              <tr key={stage.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{stage.titre}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{stage.lieu}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {formatDate(stage.dateDebut)} {stage.dateFin ? ` - ${formatDate(stage.dateFin)}` : ''}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStageStatusBadge(stage.statut)}`}>
                    {stage.statut.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{stage.observations || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{/* Diplômes du personnel */}
{currentMilitaire.personnel?.diplomes && currentMilitaire.personnel.diplomes.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
      Diplômes
    </h3>
    <div className="bg-white overflow-hidden border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'obtention</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentMilitaire.personnel.diplomes.map((diplome) => (
              <tr key={diplome.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{diplome.titre}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{diplome.typeDiplome.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{diplome.institution}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(diplome.dateObtention)}</td>
                <td className="px-4 py-3 text-sm">{diplome.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{/* Documents section */}
{currentMilitaire.personnel?.documents && currentMilitaire.personnel.documents.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-[#40916c] mb-4 border-b pb-2">
      Documents
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentMilitaire.personnel.documents.map((doc) => (
        <div key={doc.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-[#40916c] bg-opacity-10 p-2 rounded-md mr-3">
              <svg className="w-6 h-6 text-[#40916c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{doc.nomFichier}</h4>
              <p className="text-sm text-gray-500">Type: {doc.typeDocument?.replace(/_/g, ' ')}</p>
              <p className="text-xs text-gray-500 mt-1">
                Ajouté le {formatDate(doc.dateUpload)} par {doc.uploadeur?.name || 'Inconnu'}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t flex justify-end">
            <a 
              href={`/uploads/${doc.cheminFichier}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Télécharger
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>Aucun militaire trouvé avec cet identifiant.</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Confirmation de suppression</h2>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer le militaire{' '}
              <span className="font-semibold">
                {currentMilitaire.personnel?.nom} {currentMilitaire.personnel?.prenom}
              </span>{' '}
              avec le matricule <span className="font-semibold">{currentMilitaire.matricule}</span> ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

export default MilitaireDetail;