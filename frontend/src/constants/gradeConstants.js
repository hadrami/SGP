// src/constants/gradeConstants.js

// Officiers Supérieurs
export const officierSuperieurGrades = [
  'COMMANDANT',
  'LIEUTENANT_COLONEL',
  'COLONEL',
  'GENERAL',
  'MEDECIN_COMMANDANT',
  'MEDECIN_LIEUTENANT_COLONEL',
  'MEDECIN_COLONEL',
  'MEDECIN_GENERAL',
  'INTENDANT_COMMANDANT',
  'INTENDANT_LIEUTENANT_COLONEL',
  'INTENDANT_COLONEL',
  'INTENDANT_GENERAL',
  'COMMANDANT_INGENIEUR',
  'LIEUTENANT_COLONEL_INGENIEUR',
  'COLONEL_INGENIEUR',
  'GENERAL_INGENIEUR'
];

// Officiers Subalternes
export const officierSubalterneGrades = [
  'SOUS_LIEUTENANT',
  'LIEUTENANT',
  'CAPITAINE',
  'LIEUTENANT_INGENIEUR',
  'CAPITAINE_INGENIEUR',
  'INTENDANT_SOUS_LIEUTENANT',
  'INTENDANT_LIEUTENANT',
  'INTENDANT_CAPITAINE',
  'MEDECIN_LIEUTENANT',
  'MEDECIN_CAPITAINE'
];

// Sous-Officiers Supérieurs
export const sousOfficierSuperieurGrades = [
  'ADJUDANT',
  'ADJUDANT_CHEF'
];

// Sous-Officiers Subalternes
export const sousOfficierSubalterneGrades = [
  'SERGENT',
  'SERGENT_CHEF'
];

// Soldats
export const soldatGrades = [
  'SOLDAT_DEUXIEME_CLASSE',
  'SOLDAT_PREMIERE_CLASSE',
  'CAPORAL'
];

// Function to determine category and subcategory based on grade
export const getCategoriesFromGrade = (grade) => {
  let categorie = '';
  let categorieOfficier = null;
  let categorieSousOfficier = null;
  
  if (officierSuperieurGrades.includes(grade)) {
    categorie = 'OFFICIER';
    categorieOfficier = 'OFFICIER_SUPERIEUR';
  } else if (officierSubalterneGrades.includes(grade)) {
    categorie = 'OFFICIER';
    categorieOfficier = 'OFFICIER_SUBALTERNE';
  } else if (sousOfficierSuperieurGrades.includes(grade)) {
    categorie = 'SOUS_OFFICIER';
    categorieSousOfficier = 'SOUS_OFFICIER_SUPERIEUR';
  } else if (sousOfficierSubalterneGrades.includes(grade)) {
    categorie = 'SOUS_OFFICIER';
    categorieSousOfficier = 'SOUS_OFFICIER_SUBALTERNE';
  } else if (soldatGrades.includes(grade)) {
    categorie = 'SOLDAT';
  }
  
  return { categorie, categorieOfficier, categorieSousOfficier };
};