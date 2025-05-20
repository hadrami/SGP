// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import Footer from '../components/Footer';
import LanguageSelector from '../components/LanguageSelector';


const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isHovering, setIsHovering] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // Auto-hide sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(isHovering);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isHovering]);
  
  // Toggle for a menu
  const toggleMenu = (index) => {
    setExpandedMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Handle mouse enter/leave for sidebar
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // Menus et sous-menus
  const navItems = [
    {
      name: 'Tableau de bord',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/dashboard',
      standalone: true
    },
    // Find the Personnel Militaire menu item and update it like this:
{
  name: 'Personnel Militaire',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  submenus: [
    { name: 'Liste des militaires', path: '/militaires' },
    { name: 'Ajouter un militaire', path: '/militaires/new' },
    { name: 'Officiers', path: '/militaires/categorie/officier' },
    { name: 'Sous-Officiers', path: '/militaires/categorie/sous-officier' },
    { name: 'HDT', path: '/militaires/categorie/soldat' }
  ]
},

    {
      name: 'Personnel Civil',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      submenus: [
        { name: 'Professeurs', path: '/professeurs' },
        { name: 'Étudiants', path: '/etudiants' },
        { name: 'Employés', path: '/employes' },
        { name: 'Ajouter personnel', path: '/personnel/new' }
      ]
    },
    // Modify the Instituts menu item to include specific institutes
{
  name: 'Instituts',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  submenus: [

    { name: 'ESP', path: '/instituts/ESP' },
    { name: 'IPGEI', path: '/instituts/IPGEI' },
    { name: 'ISMS', path: '/instituts/ISMS' },
    { name: 'ISME', path: '/instituts/ISME' },
    { name: 'IS2M', path: '/instituts/IS2M' },
    { name: 'ISMBTPU', path: '/instituts/ISMBTPU' }
  ]
},

// Add a new menu item for Directions
{
  name: 'Directions',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  submenus: [
    { name: 'DLDC', path: '/directions/DLDC' },
    { name: 'CTIS', path: '/directions/CTIS' }, 
    { name: 'SRH', path: '/directions/SRH' },
    { name: 'DSSGL', path: '/directions/DSSGL' },
    { name: 'SAF', path: '/directions/SAF' },
    { name: 'DEM', path: '/directions/DEM' },
    { name: 'COU', path: '/directions/COU' }
  ]
},

// Add a new menu item for PC
{
  name: 'PC',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  ),
  submenus: [
    { name: 'PC', path: '/pc/PC' },
  ]
},
    {
      name: 'Documents',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      submenus: [
        { name: 'Tous les documents', path: '/documents' },
        { name: 'Télécharger un document', path: '/documents/upload' },
        { name: 'Documents par type', path: '/documents/by-type' }
      ]
    },
    {
      name: 'Situation',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      submenus: [
        { name: 'Journalière', path: '/situations/daily' },
        { name: 'Mensuelle', path: '/situations/monthly' },
        { name: 'Annuelle', path: '/situations/yearly' },
        { name: 'Créer un rapport', path: '/situations/new' }
      ]
    },
   // Updated Recherche menu with submenus
  {
    name: 'Recherche',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    submenus: [
      { name: 'Recherche par matricule', path: '/search/matricule' },
      { name: 'Recherche par NNI', path: '/search/nni' },
      { name: 'Recherche par grade', path: '/search/grade' },
      { name: 'Recherche par institut', path: '/search/institut' },
      { name: 'Recherche avancée', path: '/search/advanced' }
    ]
  },
  
    {
      name: 'Statistiques',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      submenus: [
        { name: 'Vue d\'ensemble', path: '/statistics' },
        { name: 'Personnel militaire', path: '/statistics/militaires' },
        { name: 'Personnel civil', path: '/statistics/civils' },
        { name: 'Par instituts', path: '/statistics/instituts' }
      ]
    }
  ];
  
  // Check if user is admin for admin-only features
  const isAdmin = user && user.role === 'ADMIN';
  
  if (isAdmin) {
    navItems.push({
      name: 'Administration',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      submenus: [
        { name: 'Gestion des utilisateurs', path: '/admin/users' },
        { name: 'Paramètres du système', path: '/admin/settings' },
        { name: 'Journaux d\'activité', path: '/admin/logs' }
      ]
    });
  }
  
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay pour mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        {/* Sidebar hover area */}
        <div 
          className="hidden md:block fixed inset-y-0 left-0 w-4 z-40"
          onMouseEnter={handleMouseEnter}
        ></div>
        
        {/* Sidebar */}
        <div 
          className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed inset-y-0 flex flex-col flex-shrink-0 w-64 transition-transform duration-300 ease-in-out bg-[#40916c] text-white z-50 md:z-30
          `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* En-tête sidebar */}
          <div className="flex flex-col items-center justify-center h-20 px-4 bg-[#ffff3f]">
            <span className="text-lg font-semibold text-[#40916c] text-center mt-1">Système GP</span>
            
            {/* Bouton fermeture sidebar (mobile) */}
            <button
              className="absolute top-2 right-2 md:hidden text-[#40916c]"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Affichage de l'utilisateur connecté */}
          {user && (
            <div className="px-4 py-3 bg-[#2d6a4f] border-b border-[#52b788]">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#ffff3f] text-[#40916c] flex items-center justify-center font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs font-medium text-gray-200">{user.role || 'Utilisateur'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Menus */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item, idx) => (
                <div key={idx} className="mb-2">
                  {/* Si c'est un élément standalone */}
                  {item.standalone ? (
                    <Link 
                      to={item.path}
                      className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-[#2d6a4f]"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ) : (
                    <>
                      {/* En-tête du menu avec sous-menus */}
                      <button 
                        className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-[#2d6a4f]"
                        onClick={() => toggleMenu(idx)}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          {item.name}
                        </div>
                        <svg 
                          className={`h-5 w-5 transition-transform ${expandedMenus[idx] ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Sous-menus */}
                      {expandedMenus[idx] && (
                        <div className="mt-1 pl-4 space-y-1">
                          {item.submenus.map((submenu, subIdx) => (
                            <Link
                              key={subIdx}
                              to={submenu.path}
                              className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#2d6a4f] rounded-md"
                            >
                              {submenu.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
         
        </div>

        {/* Zone de contenu */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
{/* Bilingual header with better responsiveness */}
<div className="bg-white pt-2 pb-1">
  <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between header-container">
    {/* Left side - French text */}
    <div className="text-left mb-2 md:mb-0">
      <p className="font-semibold header-text">République islamique de Mauritanie</p>
      <p className="header-text">Ministère de la défense chargé des affaires des retraités</p>
      <p className="header-text">et des enfants de martyrs</p>
      <p className="header-text">Etat major général des armées</p>
      <p className="header-text">Group Polytechnique</p>
      <p className="header-text">Service des ressources humaines</p>
    </div>
    
    {/* Right side - Arabic text with RTL */}
    <div className="text-right rtl">
      <p className="font-semibold header-text">الجمهورية الإسلامية الموريتانية</p>
      <p className="header-text">وزارة الدفاع وشؤون المتقاعدين</p>
      <p className="header-text">وأولاد الشهداء</p>
      <p className="header-text">الأركان العامة للجيوش</p>
      <p className="header-text">مجمع بولتكنيك</p>
      <p className="header-text">مصلحة المصادر البشرية</p>
    </div>
  </div>
</div>
          {/* En-tête */}
          <header className="relative z-10 flex-shrink-0 bg-[#ffff3f] shadow h-20">
            <div className="w-full h-full flex items-center justify-between px-4">
              {/* Bouton menu (mobile) */}
              <button
                className="md:hidden text-[#40916c] focus:outline-none"
                onClick={() => setIsSidebarOpen(true)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <LanguageSelector />
             
              
              {/* Logo and text centered */}
              <div className="flex-1 flex items-center justify-center">
                <img 
                  src="/assets/gp-logo.png" 
                  alt="GP Logo" 
                  className="w-14 h-14 md:w-20 md:h-20 object-contain mr-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                <h1 className="text-lg md:text-xl font-semibold text-[#40916c]">
                  Gestion du Personnel
                </h1>
              </div>
              
              {/* Bouton de déconnexion à droite (remplace le bouton de connexion) */}
              <div>
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1 md:px-4 md:py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#40916c] hover:bg-[#2d6a4f] focus:outline-none"
                >
                  <svg className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white p-4 md:p-6">
            <Outlet />
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;