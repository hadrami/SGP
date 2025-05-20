// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link }                       from 'react-router-dom';
import { useSelector }                from 'react-redux';
import ChangePasswordModal            from '../../components/ChangePasswordModal';
import { useTranslation }             from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const { user = {} }             = useSelector(state => state.auth);

  // Show password-change modal on first login
  useEffect(() => {
    if (user.isFirstLogin) {
      setShowModal(true);
    }
  }, [user]);

  // Demo counts
  const militairesCount  = 127;
  const professeursCount = 42;
  const etudiantsCount   = 215;
  const employesCount    = 35;

  const summaryCards = [
    {
      title: t('dashboard.cards.militaires'),
      count: militairesCount,
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-[#40916c]',
      textColor: 'text-white'
    },
    {
      title: t('dashboard.cards.professeurs'),
      count: professeursCount,
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5
                   S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18
                   7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477
                   14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253
                   v13C19.832 18.477 18.247 18 16.5 18
                   c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'bg-[#90e0ef]',
      textColor: 'text-[#40916c]'
    },
    {
      title: t('dashboard.cards.etudiants'),
      count: etudiantsCount,
      icon: (
        <svg className="w-10 h-10 text-[#40916c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479
                   A11.952 11.952 0 0012 20.055a11.952 11.952 0
                   00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      color: 'bg-[#90e0ef] bg-opacity-40',
      textColor: 'text-[#40916c]'
    },
    {
      title: t('dashboard.cards.employes'),
      count: employesCount,
      icon: (
        <svg className="w-10 h-10 text-[#40916c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745
                   M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01
                   M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0
                   00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-[#90e0ef] bg-opacity-40',
      textColor: 'text-[#40916c]'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome banner */}
      <div className="bg-[#ffff3f] bg-opacity-20 rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#40916c] mb-2">
          {t('dashboard.welcome')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t('dashboard.overview')}
        </p>

        <ChangePasswordModal isOpen={showModal} onClose={() => setShowModal(false)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {summaryCards.map((card, idx) => (
            <div key={idx} className={`${card.color} rounded-lg shadow-lg overflow-hidden`}>
              <div className="px-4 py-5 sm:p-6 flex items-center justify-between">
                <div>
                  <dt className={`text-sm font-medium ${card.textColor} truncate`}>
                    {card.title}
                  </dt>
                  <dd className={`mt-1 text-3xl font-semibold ${card.textColor}`}>
                    {card.count}
                  </dd>
                </div>
                <div className={`rounded-full ${idx === 0 ? 'bg-white bg-opacity-30' : 'bg-white'} p-2`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#90e0ef] bg-opacity-40 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-[#40916c] mb-2">
            {t('dashboard.totalStaff')}
          </h3>
          <p className="text-3xl font-bold text-[#40916c]">
            {militairesCount + professeursCount + etudiantsCount + employesCount}
          </p>
        </div>

        <div className="bg-[#90e0ef] bg-opacity-40 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-[#40916c] mb-2">
            {t('dashboard.recentActivity')}
          </h3>
          <ul className="list-disc list-inside text-gray-600">
            <li>{t('dashboard.activity.updateRecord')}</li>
            <li>{t('dashboard.activity.newEmployee')}</li>
          </ul>
        </div>

        <div className="bg-[#90e0ef] bg-opacity-40 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-[#40916c] mb-2">
            {t('dashboard.alerts')}
          </h3>
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm">
            {t('dashboard.alerts.pending', { count: 3 })}
          </div>
        </div>
      </div>

      {/* Institute logos */}
      <div className="logos-container mt-10 mb-4 flex space-x-6 justify-center">
        {['ESP','IS2M','IPGEI','ISME','ISMS','ISM-BTPU'].map(code => (
          <Link key={code} to={`/instituts/${code}`}>
            <img
              src={`/assets/${code}.png`}
              alt={code}
              className="h-16 hover:opacity-75 transition-opacity"
              onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
