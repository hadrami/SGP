// src/pages/militaires/GradeSelect.jsx
import React from 'react';

// Import grade constants from your constants file
import { 
  officierSuperieurGrades, 
  officierSubalterneGrades, 
  sousOfficierSuperieurGrades, 
  sousOfficierSubalterneGrades, 
  soldatGrades 
} from '../../constants/gradeConstants';

const GradeSelect = ({ value, onChange, disabled }) => {
  const handleChange = (e) => {
    // Forward the change event with the correct format
    onChange({
      target: {
        name: 'grade',
        value: e.target.value
      }
    });
  };

  // Helper function to generate a readable grade label
  const getGradeLabel = (grade) => {
    // Convert from SNAKE_CASE to readable format with proper capitalization
    return grade
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <select
      id="grade"
      name="grade"
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916c]"
      required
    >
      <option value="">Sélectionner un grade</option>
      
      {/* Officiers Supérieurs */}
      <optgroup label="Officiers Supérieurs">
        {officierSuperieurGrades.map(grade => (
          <option key={grade} value={grade}>
            {getGradeLabel(grade)}
          </option>
        ))}
      </optgroup>
      
      {/* Officiers Subalternes */}
      <optgroup label="Officiers Subalternes">
        {officierSubalterneGrades.map(grade => (
          <option key={grade} value={grade}>
            {getGradeLabel(grade)}
          </option>
        ))}
      </optgroup>
      
      {/* Sous-Officiers Supérieurs */}
      <optgroup label="Sous-Officiers Supérieurs">
        {sousOfficierSuperieurGrades.map(grade => (
          <option key={grade} value={grade}>
            {getGradeLabel(grade)}
          </option>
        ))}
      </optgroup>
      
      {/* Sous-Officiers Subalternes */}
      <optgroup label="Sous-Officiers Subalternes">
        {sousOfficierSubalterneGrades.map(grade => (
          <option key={grade} value={grade}>
            {getGradeLabel(grade)}
          </option>
        ))}
      </optgroup>
      
      {/* Soldats */}
      <optgroup label="Soldats">
        {soldatGrades.map(grade => (
          <option key={grade} value={grade}>
            {getGradeLabel(grade)}
          </option>
        ))}
      </optgroup>
    </select>
  );
};

export default GradeSelect;