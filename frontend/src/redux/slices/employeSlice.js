// src/redux/slices/employeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import employeApi from '../../api/employe.api';

// Thunks asynchrones
export const fetchEmployes = createAsyncThunk(
  'employes/fetchEmployes',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await employeApi.getAllEmployes(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des employés' });
    }
  }
);

export const fetchEmployeById = createAsyncThunk(
  'employes/fetchEmployeById',
  async (id, { rejectWithValue }) => {
    try {
      return await employeApi.getEmployeById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'employé' });
    }
  }
);

export const fetchEmployeByNni = createAsyncThunk(
  'employes/fetchEmployeByNni',
  async (nni, { rejectWithValue }) => {
    try {
      return await employeApi.getEmployeByNni(nni);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'employé' });
    }
  }
);

export const createEmploye = createAsyncThunk(
  'employes/createEmploye',
  async (employeData, { rejectWithValue }) => {
    try {
      return await employeApi.createEmploye(employeData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création de l\'employé' });
    }
  }
);

export const updateEmploye = createAsyncThunk(
  'employes/updateEmploye',
  async ({ id, employeData }, { rejectWithValue }) => {
    try {
      return await employeApi.updateEmploye(id, employeData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour de l\'employé' });
    }
  }
);

export const deleteEmploye = createAsyncThunk(
  'employes/deleteEmploye',
  async (id, { rejectWithValue }) => {
    try {
      await employeApi.deleteEmploye(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression de l\'employé' });
    }
  }
);

export const updateEmployeSituation = createAsyncThunk(
  'employes/updateEmployeSituation',
  async ({ id, situation }, { rejectWithValue }) => {
    try {
      return await employeApi.updateEmployeSituation(id, situation);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour de la situation de l\'employé' });
    }
  }
);

export const fetchEmployesByInstitut = createAsyncThunk(
  'employes/fetchEmployesByInstitut',
  async ({ institutId, params = {} }, { rejectWithValue }) => {
    try {
      return await employeApi.getEmployesByInstitut(institutId, params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des employés de l\'institut' });
    }
  }
);

export const fetchEmployesByTypeContrat = createAsyncThunk(
  'employes/fetchEmployesByTypeContrat',
  async ({ typeContrat, params = {} }, { rejectWithValue }) => {
    try {
      return await employeApi.getEmployesByTypeContrat(typeContrat, params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des employés par type de contrat' });
    }
  }
);

export const fetchEmployeDocuments = createAsyncThunk(
  'employes/fetchEmployeDocuments',
  async (id, { rejectWithValue }) => {
    try {
      return await employeApi.getEmployeDocuments(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des documents de l\'employé' });
    }
  }
);

export const addEmployeDocument = createAsyncThunk(
  'employes/addEmployeDocument',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await employeApi.addEmployeDocument(id, formData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de l\'ajout du document' });
    }
  }
);

export const searchEmployes = createAsyncThunk(
  'employes/searchEmployes',
  async (searchCriteria, { rejectWithValue }) => {
    try {
      return await employeApi.searchEmployes(searchCriteria);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la recherche des employés' });
    }
  }
);

export const fetchEmployeStats = createAsyncThunk(
  'employes/fetchEmployeStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await employeApi.getEmployeStats(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des statistiques des employés' });
    }
  }
);

export const importEmployes = createAsyncThunk(
  'employes/importEmployes',
  async (formData, { rejectWithValue }) => {
    try {
      return await employeApi.importEmployes(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de l\'importation des employés' });
    }
  }
);

// Création du slice
const employeSlice = createSlice({
  name: 'employes',
  initialState: {
    employes: [],
    filteredEmployes: [],
    currentEmploye: null,
    documents: [],
    stats: null,
    isLoading: false,
    isImporting: false,
    isExporting: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  },
  reducers: {
    clearCurrentEmploye: (state) => {
      state.currentEmploye = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    resetFilteredEmployes: (state) => {
      state.filteredEmployes = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Cas pour fetchEmployes
      .addCase(fetchEmployes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          // Si l'API renvoie des données paginées
          state.employes = action.payload.data;
          state.pagination = action.payload.meta || state.pagination;
        } else {
          // Si l'API renvoie juste un tableau
          state.employes = action.payload;
        }
      })
      .addCase(fetchEmployes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des employés';
      })
      
      // Cas pour fetchEmployeById
      .addCase(fetchEmployeById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEmploye = action.payload;
      })
      .addCase(fetchEmployeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'employé';
      })
      
      // Cas pour fetchEmployeByNni
      .addCase(fetchEmployeByNni.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployeByNni.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEmploye = action.payload;
      })
      .addCase(fetchEmployeByNni.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'employé';
      })
      
      // Cas pour createEmploye
      .addCase(createEmploye.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEmploye.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.employes.push(action.payload);
        state.currentEmploye = action.payload;
      })
      .addCase(createEmploye.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création de l\'employé';
      })
      
      // Cas pour updateEmploye
      .addCase(updateEmploye.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEmploye.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEmploye = action.payload;
        const index = state.employes.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.employes[index] = action.payload;
        }
      })
      .addCase(updateEmploye.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour de l\'employé';
      })
      
      // Cas pour deleteEmploye
      .addCase(deleteEmploye.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEmploye.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.employes = state.employes.filter(e => e.id !== action.payload);
        if (state.currentEmploye && state.currentEmploye.id === action.payload) {
          state.currentEmploye = null;
        }
      })
      .addCase(deleteEmploye.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression de l\'employé';
      })
      
      // Cas pour updateEmployeSituation
      .addCase(updateEmployeSituation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEmployeSituation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEmploye = action.payload;
        const index = state.employes.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.employes[index] = action.payload;
        }
      })
      .addCase(updateEmployeSituation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour de la situation de l\'employé';
      })
      
      // Cas pour fetchEmployesByInstitut
      .addCase(fetchEmployesByInstitut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployesByInstitut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          state.filteredEmployes = action.payload.data;
          state.pagination = action.payload.meta || state.pagination;
        } else {
          state.filteredEmployes = action.payload;
        }
      })
      .addCase(fetchEmployesByInstitut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des employés par institut';
      })
      
      // Cas pour fetchEmployesByTypeContrat
      .addCase(fetchEmployesByTypeContrat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployesByTypeContrat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          state.filteredEmployes = action.payload.data;
          state.pagination = action.payload.meta || state.pagination;
        } else {
          state.filteredEmployes = action.payload;
        }
      })
      .addCase(fetchEmployesByTypeContrat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des employés par type de contrat';
      })
      
      // Cas pour fetchEmployeDocuments
      .addCase(fetchEmployeDocuments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployeDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.documents = action.payload;
      })
      .addCase(fetchEmployeDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des documents';
      })
      
      // Cas pour addEmployeDocument
      .addCase(addEmployeDocument.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addEmployeDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.documents.push(action.payload);
      })
      .addCase(addEmployeDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de l\'ajout du document';
      })
      
      // Cas pour searchEmployes
      .addCase(searchEmployes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchEmployes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          state.filteredEmployes = action.payload.data;
          state.pagination = action.payload.meta || state.pagination;
        } else {
          state.filteredEmployes = action.payload;
        }
      })
      .addCase(searchEmployes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la recherche des employés';
      })
      
      // Cas pour fetchEmployeStats
      .addCase(fetchEmployeStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployeStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchEmployeStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des statistiques';
      })
      
      // Cas pour importEmployes
      .addCase(importEmployes.pending, (state) => {
        state.isImporting = true;
      })
      .addCase(importEmployes.fulfilled, (state, action) => {
        state.isImporting = false;
        state.error = null;
        // Ajouter ou remplacer les employés importés
        const importedIds = action.payload.map(e => e.id);
        state.employes = [
          ...state.employes.filter(e => !importedIds.includes(e.id)),
          ...action.payload
        ];
      })
      .addCase(importEmployes.rejected, (state, action) => {
        state.isImporting = false;
        state.error = action.payload?.error || 'Erreur lors de l\'importation des employés';
      });
  }
});

export const { 
  clearCurrentEmploye, 
  clearError, 
  setPage, 
  setLimit,
  resetFilteredEmployes
} = employeSlice.actions;

export default employeSlice.reducer;
