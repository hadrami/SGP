// src/components/militaires/GradeSelect.jsx
import React from 'react';

/**
 * A specialized component for selecting military grades
 * With automatic category detection - organized by rank hierarchy
 */
const GradeSelect = ({ value, onChange, disabled = false }) => {
  // Define all grades in a single array with their category information
  const allGrades = [
    // === OFFICIERS SUPÉRIEURS ===
    { 
      value: "GENERAL", 
      label: "Général",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "GENERAL_INGENIEUR", 
      label: "Général Ingénieur",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "MEDECIN_GENERAL", 
      label: "Médecin Général",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "INTENDANT_GENERAL", 
      label: "Intendant Général",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "COLONEL", 
      label: "Colonel",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "COLONEL_INGENIEUR", 
      label: "Colonel Ingénieur",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "MEDECIN_COLONEL", 
      label: "Médecin Colonel",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "INTENDANT_COLONEL", 
      label: "Intendant Colonel",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "LIEUTENANT_COLONEL", 
      label: "Lieutenant-Colonel",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "LIEUTENANT_COLONEL_INGENIEUR", 
      label: "Lieutenant-Colonel Ingénieur",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "MEDECIN_LIEUTENANT_COLONEL", 
      label: "Médecin Lieutenant-Colonel",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "INTENDANT_LIEUTENANT_COLONEL", 
      label: "Intendant Lieutenant-Colonel",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "COMMANDANT", 
      label: "Commandant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "COMMANDANT_INGENIEUR", 
      label: "Commandant Ingénieur",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "MEDECIN_COMMANDANT", 
      label: "Médecin Commandant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    { 
      value: "INTENDANT_COMMANDANT", 
      label: "Intendant Commandant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUPERIEUR"
    },
    
    // === OFFICIERS SUBALTERNES ===
    { 
      value: "CAPITAINE", 
      label: "Capitaine",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "CAPITAINE_INGENIEUR", 
      label: "Capitaine Ingénieur",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "MEDECIN_CAPITAINE", 
      label: "Médecin Capitaine",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "INTENDANT_CAPITAINE", 
      label: "Intendant Capitaine",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "LIEUTENANT", 
      label: "Lieutenant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "LIEUTENANT_INGENIEUR", 
      label: "Lieutenant Ingénieur",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "MEDECIN_LIEUTENANT", 
      label: "Médecin Lieutenant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "INTENDANT_LIEUTENANT", 
      label: "Intendant Lieutenant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "SOUS_LIEUTENANT", 
      label: "Sous-Lieutenant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    { 
      value: "INTENDANT_SOUS_LIEUTENANT", 
      label: "Intendant Sous-Lieutenant",
      category: "OFFICIER",
      subCategory: "OFFICIER_SUBALTERNE"
    },
    
    // === SOUS-OFFICIERS SUPÉRIEURS ===
    { 
      value: "ADJUDANT_CHEF", 
      label: "Adjudant-Chef",
      category: "SOUS_OFFICIER",
      subCategory: "SOUS_OFFICIER_SUPERIEUR"
    },
    { 
      value: "ADJUDANT", 
      label: "Adjudant",
      category: "SOUS_OFFICIER",
      subCategory: "SOUS_OFFICIER_SUPERIEUR"
    },
    
    // === SOUS-OFFICIERS SUBALTERNES ===
    { 
      value: "SERGENT_CHEF", 
      label: "Sergent-Chef",
      category: "SOUS_OFFICIER",
      subCategory: "SOUS_OFFICIER_SUBALTERNE"
    },
    { 
      value: "SERGENT", 
      label: "Sergent",
      category: "SOUS_OFFICIER",
      subCategory: "SOUS_OFFICIER_SUBALTERNE"
    },
    
    // === SOLDATS ===
    { 
      value: "CAPORAL", 
      label: "Caporal",
      category: "SOLDAT",
      subCategory: null
    },
    { 
      value: "SOLDAT_PREMIERE_CLASSE", 
      label: "Soldat 1ère Classe",
      category: "SOLDAT",
      subCategory: null
    },
    { 
      value: "SOLDAT_DEUXIEME_CLASSE", 
      label: "Soldat 2ème Classe",
      category: "SOLDAT", 
      subCategory: null
    }
  ];

  // Function to handle change events with category information
  const handleChange = (e) => {
    const selectedGrade = e.target.value;
    
    if (onChange) {
      // Find the grade information to get its category and subcategory
      const gradeInfo = allGrades.find(grade => grade.value === selectedGrade) || {};
      
      // Create a synthetic event with additional data
      const enhancedEvent = {
        ...e,
        gradeInfo: {
          category: gradeInfo.category || '',
          subCategory: gradeInfo.subCategory || ''
        }
      };
      
      onChange(enhancedEvent);
    }
  };

  return (
    <select
      id="grade"
      name="grade"
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
      disabled={disabled}
      required
    >
      <option value="">Sélectionner un grade</option>
      
      <optgroup label="Officiers Supérieurs">
        {allGrades
          .filter(grade => grade.subCategory === "OFFICIER_SUPERIEUR")
          .map(grade => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))
        }
      </optgroup>
      
      <optgroup label="Officiers Subalternes">
        {allGrades
          .filter(grade => grade.subCategory === "OFFICIER_SUBALTERNE")
          .map(grade => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))
        }
      </optgroup>
      
      <optgroup label="Sous-Officiers Supérieurs">
        {allGrades
          .filter(grade => grade.subCategory === "SOUS_OFFICIER_SUPERIEUR")
          .map(grade => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))
        }
      </optgroup>
      
      <optgroup label="Sous-Officiers Subalternes">
        {allGrades
          .filter(grade => grade.subCategory === "SOUS_OFFICIER_SUBALTERNE")
          .map(grade => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))
        }
      </optgroup>
      
      <optgroup label="Soldats">
        {allGrades
          .filter(grade => grade.category === "SOLDAT")
          .map(grade => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))
        }
      </optgroup>
    </select>
  );
};

export default GradeSelect;