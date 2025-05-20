// src/pages/unites/UniteDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link }               from 'react-router-dom';
import { useDispatch, useSelector }      from 'react-redux';
import {
  fetchUniteByCode,
  fetchUnitePersonnel
} from '../../redux/slices/uniteSlice';
import Loader       from '../../components/common/Loader';
import ErrorAlert   from '../../components/common/ErrorAlert';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  HomeIcon,
  UserPlusIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { printUnitePersonnel }            from '../../utils/PrintUtils';

export default function UniteDetail() {
  const { code } = useParams();
  const dispatch = useDispatch();

  // Redux state
  const {
    currentUnite,
    personnel: { data, pagination },
    personnelLoading,
    personnelError
  } = useSelector(state => state.unites);

  // Local UI state
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage]             = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  // Load unit metadata when `code` changes
  useEffect(() => {
    if (code) dispatch(fetchUniteByCode(code));
  }, [code, dispatch]);

  // Load personnel when unit, page, or filter changes
  useEffect(() => {
    if (currentUnite?.id) {
      dispatch(fetchUnitePersonnel({
        uniteId:       currentUnite.id,
        page,
        limit:         10,
        typePersonnel: typeFilter || undefined
      }));
    }
  }, [currentUnite?.id, page, typeFilter, dispatch]);

  const handleFilterChange = e => {
    setTypeFilter(e.target.value);
    setPage(1);
  };
  const handlePrevPage = () => setPage(p => Math.max(p - 1, 1));
  const handleNextPage = () => setPage(p => Math.min(p + 1, pagination.totalPages));

  const formatText = txt => txt ? txt.replace(/_/g, ' ') : '-';

  const handlePrint = () => {
    if (isPrinting || data.length === 0) return;
    setIsPrinting(true);
    try {
      printUnitePersonnel(data, currentUnite, pagination);
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setTimeout(() => setIsPrinting(false), 2000);
    }
  };

  if (personnelLoading) return <Loader />;
  if (personnelError)   return <ErrorAlert message={personnelError} />;
  if (!currentUnite)    return <ErrorAlert message="Unité non trouvée" />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb/Header */}
      <div className="flex items-center text-gray-700 space-x-2">
        <Link to="/unites" className="hover:text-gray-900">
          <HomeIcon className="w-6 h-6" />
        </Link>
        <span className="text-lg">/</span>
        <h1 className="text-2xl font-semibold">{currentUnite.code}</h1>
      </div>

      {/* Unit Details Card */}
      <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p><span className="font-semibold">Nom :</span> {currentUnite.nom}</p>
          <p><span className="font-semibold">Type :</span> {currentUnite.type}</p>
          {currentUnite.description && (
            <p><span className="font-semibold">Description :</span> {currentUnite.description}</p>
          )}
        </div>
        <div className="space-y-2">
          {currentUnite.institut && (
            <>
              <p><span className="font-semibold">Emplacement :</span> {currentUnite.institut.emplacement}</p>
              <p><span className="font-semibold">Année d'étude :</span> {currentUnite.institut.anneeEtude || 'N/A'}</p>
            </>
          )}
          {currentUnite.dct && (
            <>
              <p><span className="font-semibold">Domaine :</span> {currentUnite.dct.domaine}</p>
              <p><span className="font-semibold">Niveau :</span> {currentUnite.dct.niveau}</p>
            </>
          )}
          {currentUnite.pc && (
            <>
              <p><span className="font-semibold">Zone d'opération :</span> {currentUnite.pc.zoneOperation}</p>
            </>
          )}
        </div>
      </div>

      {/* Filter/Add/Print Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <label className="font-medium">Filtrer :</label>
          <select
            value={typeFilter}
            onChange={handleFilterChange}
            className="border rounded p-2"
          >
            <option value="">Tous</option>
            <option value="MILITAIRE">Militaires</option>
            <option value="CIVIL_ETUDIANT">Étudiants</option>
            <option value="CIVAL_EMPLOYE">Employés</option>
            <option value="CIVAL_PROFESSEUR">Professeurs</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            disabled={isPrinting || data.length === 0}
            className={`inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ${
              isPrinting || data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PrinterIcon className="w-5 h-5 mr-2" />
            {isPrinting ? 'Impression...' : 'Imprimer'}
          </button>
          <Link
            to={`/militaires/new?uniteId=${currentUnite.id}`}
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Matricule','Nom','Prénom','Grade','Catégorie','Situation','Unité','Actions'].map(col => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? data.map(person => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{person.militaire?.matricule || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{person.nom}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{person.prenom}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{person.militaire?.grade ? formatText(person.militaire.grade) : '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{person.typePersonnel ? formatText(person.typePersonnel) : '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{person.militaire?.situation ? formatText(person.militaire.situation) : '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{person.unite?.code}</td>
                <td className="px-4 py-2 text-sm text-gray-500 text-right">
                  <div className="inline-flex space-x-2">
                    <Link to={`/militaires/${person.militaire?.id}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded-full" title="Voir">
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                    <Link to={`/militaires/edit/${person.militaire?.id}`} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-full" title="Modifier">
                      <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded-full" title="Supprimer">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                  Aucun personnel trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button onClick={handlePrevPage} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">
            Précédent
          </button>
          <span className="px-2 py-1 text-sm text-gray-700">{page} / {pagination.totalPages}</span>
          <button onClick={handleNextPage} disabled={page === pagination.totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
