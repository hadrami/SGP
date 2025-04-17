// src/components/PersonnelTable.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PersonnelTable = ({ personnel }) => {
  // Helper function to get personnel type in French
  const getPersonnelType = (type) => {
    const types = {
      MILITAIRE: 'Militaire',
      CIVIL_PROFESSEUR: 'Professeur',
      CIVIL_ETUDIANT: 'Étudiant',
      CIVIL_EMPLOYE: 'Employé'
    };
    return types[type] || type;
  };

  // Helper function to get detail link based on personnel type
  const getDetailLink = (personnel) => {
    switch (personnel.typePersonnel) {
      case 'MILITAIRE':
        return `/militaires/${personnel.id}`;
      case 'CIVIL_PROFESSEUR':
        return `/professeurs/${personnel.id}`;
      case 'CIVIL_ETUDIANT':
        return `/etudiants/${personnel.id}`;
      case 'CIVIL_EMPLOYE':
        return `/employes/${personnel.id}`;
      default:
        return '#';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prénom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Identifiant
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {personnel.map((person) => (
            <tr key={person.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{person.nom}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{person.prenom}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${person.typePersonnel === 'MILITAIRE' ? 'bg-green-100 text-green-800' : 
                    person.typePersonnel === 'CIVIL_PROFESSEUR' ? 'bg-blue-100 text-blue-800' : 
                    person.typePersonnel === 'CIVIL_ETUDIANT' ? 'bg-purple-100 text-purple-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {getPersonnelType(person.typePersonnel)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {person.militaire?.matricule || person.etudiant?.matricule || person.nni || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link 
                  to={getDetailLink(person)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonnelTable;