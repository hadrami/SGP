// src/pages/dashboard/Dashboard.jsx
import React, {useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);

  const authState = useSelector(state => state.auth || {});
  const user = authState.user || {};
  
  
  // Check if it's the user's first login - log it but don't display modal
// Automatically show the password change modal if it's the user's first login
useEffect(() => {
  if (user?.isFirstLogin) {
    console.log('First login detected. Showing password change modal.');
    setShowModal(true);
  }
}, [user]);
  // Static data for demonstration - no API calls for now
  const militairesCount = 127;
  const professeursCount = 42;
  const etudiantsCount = 215;
  const employesCount = 35;

  // Cartes de résumé rapide
  const summaryCards = [
    {
      title: 'Militaires',
      count: militairesCount,
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-[#40916c]',
      textColor: 'text-white'
    },
    {
      title: 'Professeurs',
      count: professeursCount,
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'bg-[#90e0ef]',
      textColor: 'text-[#40916c]'
    },
    {
      title: 'Étudiants',
      count: etudiantsCount,
      icon: (
        <svg className="w-10 h-10 text-[#40916c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      color: 'bg-[#90e0ef] bg-opacity-40',
      textColor: 'text-[#40916c]'
    },
    {
      title: 'Employés',
      count: employesCount,
      icon: (
        <svg className="w-10 h-10 text-[#40916c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-[#90e0ef] bg-opacity-40',
      textColor: 'text-[#40916c]'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6">
      <div className="bg-[#ffff3f] bg-opacity-20 rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#40916c] mb-2">Bienvenue au système de gestion du personnel</h2>
        <p className="text-gray-600 mb-4">
          Utilisez le menu à gauche pour accéder aux différentes fonctionnalités.
        </p>
         {/* Change Password Modal */}
      <ChangePasswordModal isOpen={showModal} onClose={() => setShowModal(false)} />

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
            <div 
              key={index} 
              className={`${card.color} rounded-lg shadow-lg overflow-hidden`}
            >
              <div className="px-4 py-5 sm:p-6 flex items-center justify-between">
                <div>
                  <dt className={`text-sm font-medium ${card.textColor} truncate`}>
                    {card.title}
                  </dt>
                  <dd className={`mt-1 text-3xl font-semibold ${card.textColor}`}>
                    {card.count}
                  </dd>
                </div>
                <div className={`rounded-full ${index === 0 ? 'bg-white bg-opacity-30' : 'bg-white'} p-2`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte statistique */}
        <div className="bg-[#90e0ef] bg-opacity-40 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-[#40916c] mb-2">Effectif total</h3>
          <p className="text-3xl font-bold text-[#40916c]">{militairesCount + professeursCount + etudiantsCount + employesCount}</p>
        </div>
        
        {/* Carte activités */}
        <div className="bg-[#90e0ef] bg-opacity-40 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-[#40916c] mb-2">Activités récentes</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Mise à jour du dossier #1234</li>
            <li>• Nouvel employé ajouté</li>
          </ul>
        </div>
        
        {/* Carte alerte */}
        <div className="bg-[#90e0ef] bg-opacity-40 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-[#40916c] mb-2">Alertes</h3>
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm">
            3 dossiers nécessitent une mise à jour
          </div>
        </div>
      </div>

     
        {/* Institute logos */}
<div className="logos-container mt-10 mb-4">
  <img src="/assets/ESP.png" alt="ESP" className="h-16" 
       onError={(e) => {
         e.target.onerror = null;
         e.target.style.display = 'none';
       }}
  />
  <img src="/assets/IS2M.png" alt="IS2M" className="h-16" 
       onError={(e) => {
         e.target.onerror = null;
         e.target.style.display = 'none';
       }}
  />
  <img src="/assets/IPGEI.png" alt="IPGEI" className="h-16" 
       onError={(e) => {
         e.target.onerror = null;
         e.target.style.display = 'none';
       }}
  />
  <img src="/assets/ISME.png" alt="ISME" className="h-16" 
       onError={(e) => {
         e.target.onerror = null;
         e.target.style.display = 'none';
       }}
  />
  <img src="/assets/ISMS.png" alt="ISMS" className="h-16" 
       onError={(e) => {
         e.target.onerror = null;
         e.target.style.display = 'none';
       }}
  />
  <img src="/assets/ISM-BTPU.png" alt="ISMS" className="h-16" 
  onError={(e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
  }}
/>
</div>
    
      </div>
  );
};

export default Dashboard;