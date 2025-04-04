// src/pages/militaires/MilitairesPrintPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMilitaires } from '../../redux/slices/militaireSlice';

const MilitairesPrintPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [error, setError] = useState(null);
  const { militaires } = useSelector(state => state.militaires);
  const iframeRef = useRef(null);
  
  // Format the date
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  
  // Handle return to list
  const handleReturn = () => {
    navigate('/militaires');
  };
  
  // Format grade for display
  const formatGrade = (grade) => {
    if (!grade) return '-';
    return grade.replace(/_/g, ' ');
  };
  
  useEffect(() => {
    // Load all militaires for printing
    const loadData = async () => {
      try {
        // Fetch militaires with a large limit to get all records
        await dispatch(fetchMilitaires({
          limit: 1000,
          page: 1
        })).unwrap();
        
        setIsLoading(false);
        setIsPrintReady(true);
      } catch (error) {
        console.error('Error loading print data:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]);
  
  // Generate printable content and inject into iframe
  useEffect(() => {
    if (isPrintReady && militaires.length > 0 && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Create the printable content
      const printableContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des Militaires</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Page setup */
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          
          /* Header styles */
          .bilingual-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 2px solid #40916c;
            padding-bottom: 10px;
          }
          
          .header-left {
            text-align: left;
            font-size: 12px;
            line-height: 1.3;
          }
          
          .header-right {
            text-align: right;
            font-size: 12px;
            line-height: 1.3;
            direction: rtl;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          /* Logo styles */
          .logo-container {
            text-align: center;
            margin: 20px 0;
          }
          
          .logo {
            max-height: 70px;
          }
          
          /* Document title */
          .document-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            color: #40916c;
          }
          
          /* Print date */
          .print-date {
            text-align: right;
            font-size: 12px;
            margin-bottom: 15px;
          }
          
          /* Table styles */
          .militaires-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
          }
          
          .militaires-table th,
          .militaires-table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            font-size: 11px;
          }
          
          .militaires-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          
          .militaires-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .numerotation {
            width: 30px;
            text-align: center;
          }
          
          .matricule {
            width: 80px;
          }
          
          .nom-complet {
            width: auto;
          }
          
          .grade {
            width: 100px;
          }
          
          .unite {
            width: 100px;
          }
          
          .observation {
            width: 110px;
          }
          
          /* Total count */
          .total-count {
            margin-top: 15px;
            text-align: right;
            font-weight: bold;
            font-size: 13px;
          }
          
          /* Footer */
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          
          /* Ensure page breaks don't happen in the middle of rows */
          tr {
            page-break-inside: avoid;
          }
          
          /* Repeat table headers on each page */
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          /* Print container */
          .print-container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- Bilingual Header -->
          <div class="bilingual-header">
            <div class="header-left">
              <p class="font-bold">République islamique de Mauritanie</p>
              <p>Ministère de la défense chargé des affaires des retraités</p>
              <p>et des enfants de martyrs</p>
              <p>Etat major général des armées</p>
              <p>Group Polytechnique</p>
              <p>Service des ressources humaines</p>
            </div>
            <div class="header-right">
              <p class="font-bold">الجمهورية الإسلامية الموريتانية</p>
              <p>وزارة الدفاع وشؤون المتقاعدين</p>
              <p>وأولاد الشهداء</p>
              <p>الأركان العامة للجيوش</p>
              <p>مجمع بولتكنيك</p>
              <p>مصلحة المصادر البشرية</p>
            </div>
          </div>
          
          <!-- Logo -->
          <div class="logo-container">
            <img src="/assets/gp-logo.png" alt="GP Logo" class="logo" onerror="this.style.display='none';" />
          </div>
          
          <!-- Title -->
          <h1 class="document-title">LISTE DES MILITAIRES</h1>
          
          <!-- Print date -->
          <div class="print-date">
            <p>Date d'impression: ${formattedDate}</p>
          </div>
          
          <!-- Table -->
          <table class="militaires-table">
            <thead>
              <tr>
                <th class="numerotation">N°</th>
                <th class="nom-complet">Nom complet</th>
                <th class="matricule">Matricule</th>
                <th class="grade">Grade</th>
                <th class="unite">Unité</th>
                <th class="observation">Observation</th>
              </tr>
            </thead>
            <tbody>
              ${militaires.map((militaire, index) => `
                <tr>
                  <td class="numerotation">${index + 1}</td>
                  <td class="nom-complet">${militaire.personnel?.nom || '-'} ${militaire.personnel?.prenom || '-'}</td>
                  <td class="matricule">${militaire.matricule || '-'}</td>
                  <td class="grade">${formatGrade(militaire.grade)}</td>
                  <td class="unite">${militaire.division || militaire.sousUnite?.nom || '-'}</td>
                  <td class="observation">${militaire.situation?.replace(/_/g, ' ') || 'PRESENT'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Total count -->
          <div class="total-count">
            <p>Total des militaires: ${militaires.length}</p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>Document généré par le Système de Gestion du Personnel - Group Polytechnique</p>
          </div>
        </div>
        
        <script>
          // Auto-print when loaded
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
      `;
      
      // Write to iframe
      iframeDoc.open();
      iframeDoc.write(printableContent);
      iframeDoc.close();
    }
  }, [isPrintReady, militaires, formattedDate, formatGrade]);
  
  if (isLoading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh',
        padding: '20px'
      }}>
        <div className="spinner" style={{ 
          border: '4px solid rgba(0, 0, 0, 0.1)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          borderLeftColor: '#40916c',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p>Préparation du document pour impression...</p>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container" style={{
        maxWidth: '500px',
        margin: '50px auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e53e3e', marginBottom: '20px' }}>Erreur</h2>
        <p>{error}</p>
        <button 
          onClick={handleReturn}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Retour à la liste
        </button>
      </div>
    );
  }
  
  return (
    <div className="iframe-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      maxWidth: '100%',
      margin: '0 auto'
    }}>
      <div className="controls" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button 
          onClick={() => iframeRef.current?.contentWindow?.print()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#40916c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Imprimer
        </button>
        <button 
          onClick={handleReturn}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Retour à la liste
        </button>
      </div>
      
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        height: '700px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: 'white'
      }}>
        <iframe 
          ref={iframeRef}
          title="Aperçu d'impression"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default MilitairesPrintPage;