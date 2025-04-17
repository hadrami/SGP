// src/utils/PrintUtils.js
import moment from 'moment';

/**
 * Creates and opens a print window with formatted militaires list
 * @param {Array} militaires - The array of militaire objects to print
 * @param {Object} pagination - Pagination information including total count
 */
export const printMilitairesList = (militaires, pagination) => {
  // Create a new window for printing
  const printWindow = window.open('', 'Print Militaires', 'height=600,width=800');
  
  // Format the date in French locale
  const formattedDate = moment().format('DD/MM/YYYY');
  
  // Generate the header HTML
  const headerHTML = `
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
  `;
  
  // Format the grade for display
  const formatGrade = (grade) => {
    if (!grade) return '-';
    return grade.replace(/_/g, ' ');
  };
  
  // Generate the table HTML
  const tableHTML = `
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
  `;
  
  // Full HTML content for the print window
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Liste des Militaires</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        
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
        
        .logo-container {
          text-align: center;
          margin: 20px 0;
        }
        
        .logo {
          max-height: 80px;
        }
        
        .page-title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
          color: #40916c;
        }
        
        .print-date {
          text-align: right;
          font-size: 12px;
          margin-bottom: 10px;
        }
        
        .font-bold {
          font-weight: bold;
        }
        
        .militaires-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        
        .militaires-table th,
        .militaires-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        
        .militaires-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .militaires-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .numerotation {
          width: 40px;
          text-align: center;
        }
        
        .matricule {
          width: 100px;
        }
        
        .grade {
          width: 120px;
        }
        
        .unite {
          width: 120px;
        }
        
        .observation {
          width: 120px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        
        .total-count {
          margin-top: 10px;
          text-align: right;
          font-weight: bold;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${headerHTML}
        
        <div class="logo-container">
          <img src="/assets/gp-logo.png" alt="GP Logo" class="logo" />
        </div>
        
        <h1 class="page-title">LISTE DES MILITAIRES</h1>
        
        <div class="print-date">
          <p>Date d'impression: ${formattedDate}</p>
        </div>
        
        ${tableHTML}
        
        <div class="total-count">
          <p>Total des militaires: ${pagination.total}</p>
        </div>
        
      </div>
      <script>
        window.onload = function() {
          // Try to load the logo
          const logo = document.querySelector('.logo');
          logo.onerror = function() {
            // If logo fails to load, hide it
            this.style.display = 'none';
          };
          
          // Print after a short delay to ensure styles are applied
          setTimeout(function() {
            window.print();
            // Close window after printing (or cancel)
            window.onfocus = function() {
              setTimeout(function() {
                window.close();
              }, 500);
            };
          }, 1000);
        };
      </script>
    </body>
    </html>
  `;
  
  // Write to the new window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};

/**
 * Creates and opens a print window with formatted personnel list for an unite
 * @param {Array} personnel - The array of personnel objects to print
 * @param {Object} unite - The unite object containing name and type info
 * @param {Object} pagination - Pagination information including total count
 */
export const printUnitePersonnel = (personnel, unite, pagination) => {
  // Create a new window for printing
  const printWindow = window.open('', 'Print Unite Personnel', 'height=600,width=800');
  
  // Format the date in French locale
  const formattedDate = moment().format('DD/MM/YYYY');
  
  // Generate the header HTML - Same as militaires list
  const headerHTML = `
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
  `;

  // Format the personnel type for display
  const formatPersonnelType = (type) => {
    if (!type) return '-';
    return type.replace('CIVIL_', '').replace(/_/g, ' ');
  };
  
  // Generate the table HTML for personnel
  const tableHTML = `
    <table class="personnel-table">
      <thead>
        <tr>
          <th class="numerotation">N°</th>
          <th class="nom">Nom</th>
          <th class="prenom">Prénom</th>
          <th class="type">Type</th>
          <th class="details">Détails</th>
        </tr>
      </thead>
      <tbody>
        ${personnel.map((person, index) => `
          <tr>
            <td class="numerotation">${index + 1}</td>
            <td class="nom">${person.nom || '-'}</td>
            <td class="prenom">${person.prenom || '-'}</td>
            <td class="type">${formatPersonnelType(person.typePersonnel)}</td>
            <td class="details">
              ${person.typePersonnel === 'MILITAIRE' && person.militaire ? 
                 `${person.militaire.grade?.replace(/_/g, ' ') || '-'} - ${person.militaire.matricule || '-'}` : 
                person.typePersonnel === 'CIVIL_PROFESSEUR' && person.professeur ?
                 `${person.professeur.specialite || '-'}` :
                person.typePersonnel === 'CIVIL_ETUDIANT' && person.etudiant ?
                 `${person.etudiant.matricule || '-'} - ${person.etudiant.anneeEtude ? person.etudiant.anneeEtude + 'e année' : '-'}` :
                person.typePersonnel === 'CIVIL_EMPLOYE' && person.employe ?
                 `${person.employe.position || '-'}` : '-'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  // Full HTML content for the print window
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Personnel de l'Unité ${unite.nom}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        
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
        
        .logo-container {
          text-align: center;
          margin: 20px 0;
        }
        
        .logo {
          max-height: 80px;
        }
        
        .page-title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
          color: #40916c;
        }
        
        .subtitle {
          text-align: center;
          font-size: 16px;
          margin: 10px 0 20px;
        }
        
        .print-date {
          text-align: right;
          font-size: 12px;
          margin-bottom: 10px;
        }
        
        .font-bold {
          font-weight: bold;
        }
        
        .personnel-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        
        .personnel-table th,
        .personnel-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        
        .personnel-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .personnel-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .numerotation {
          width: 40px;
          text-align: center;
        }
        
        .nom, .prenom {
          width: 150px;
        }
        
        .type {
          width: 120px;
        }
        
        .details {
          width: 200px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        
        .total-count {
          margin-top: 10px;
          text-align: right;
          font-weight: bold;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${headerHTML}
        
        <div class="logo-container">
          <img src="/assets/gp-logo.png" alt="GP Logo" class="logo" />
        </div>
        
        <h1 class="page-title">LISTE DU PERSONNEL</h1>
        <h2 class="subtitle">${unite.type} : ${unite.nom} (${unite.code})</h2>
        
        <div class="print-date">
          <p>Date d'impression: ${formattedDate}</p>
        </div>
        
        ${tableHTML}
        
        <div class="total-count">
          <p>Total du personnel: ${pagination.total || personnel.length}</p>
        </div>
        
      </div>
      <script>
        window.onload = function() {
          // Try to load the logo
          const logo = document.querySelector('.logo');
          logo.onerror = function() {
            // If logo fails to load, hide it
            this.style.display = 'none';
          };
          
          // Print after a short delay to ensure styles are applied
          setTimeout(function() {
            window.print();
            // Close window after printing (or cancel)
            window.onfocus = function() {
              setTimeout(function() {
                window.close();
              }, 500);
            };
          }, 1000);
        };
      </script>
    </body>
    </html>
  `;
  
  // Write to the new window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};

export default {
  printMilitairesList,
  printUnitePersonnel
};