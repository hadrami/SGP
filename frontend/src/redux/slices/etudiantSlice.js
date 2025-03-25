// src/redux/slices/etudiantSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import etudiantApi from '../../api/etudiant.api';

// Thunks asynchrones
export const fetchEtudiants = createAsyncThunk(
  'etudiants/fetchEtudiants',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await etudiantApi.getAllEtudiants(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des étudiants' });
    }
  }
);

export const fetchEtudiantById = createAsyncThunk(
  'etudiants/fetchEtudiantById',
  async (id, { rejectWithValue }) => {
    try {
      return await etudiantApi.getEtudiantById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'étudiant' });
    }
  }
);

export const fetchEtudiantByMatricule = createAsyncThunk(
  'etudiants/fetchEtudiantByMatricule',
  async (matricule, { rejectWithValue }) => {
    try {
      return await etudiantApi.getEtudiantByMatricule(matricule);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'étudiant' });
    }
  }
);

export const createEtudiant = createAsyncThunk(
  'etudiants/createEtudiant',
  async (etudiantData, { rejectWithValue }) => {
    try {
      return await etudiantApi.createEtudiant(etudiantData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création de l\'étudiant' });
    }
  }
);

export const updateEtudiant = createAsyncThunk(
  'etudiants/updateEtudiant',
  async ({ id, etudiantData }, { rejectWithValue }) => {
    try {
      return await etudiantApi.updateEtudiant(id, etudiantData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour de l\'étudiant' });
    }
  }
);

export const deleteEtudiant = createAsyncThunk(
  'etudiants/deleteEtudiant',
  async (id, { rejectWithValue }) => {
    try {
      await etudiantApi.deleteEtudiant(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression de l\'étudiant' });
    }
  }
);

export const fetchEtudiantReleveNotes = createAsyncThunk(
  'etudiants/fetchEtudiantReleveNotes',
  async (id, { rejectWithValue }) => {
    try {
      return await etudiantApi.getEtudiantReleveNotes(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des relevés de notes' });
    }
  }
);

export const fetchEtudiantStages = createAsyncThunk(
  'etudiants/fetchEtudiantStages',
  async (id, { rejectWithValue }) => {
    try {
      return await etudiantApi.getEtudiantStages(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des stages' });
    }
  }
);

export const updateEtudiantStatut = createAsyncThunk(
  'etudiants/updateEtudiantStatut',
  async ({ id, statut }, { rejectWithValue }) => {
    try {
      return await etudiantApi.updateEtudiantStatut(id, statut);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour du statut' });
    }
  }
);

// Création du slice
const etudiantSlice = createSlice({
  name: 'etudiants',
  initialState: {
    etudiants: [],
    currentEtudiant: null,
    releveNotes: [],
    stages: [],
    isLoading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  },
  reducers: {
    clearCurrentEtudiant: (state) => {
      state.currentEtudiant = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Cas pour fetchEtudiants
      .addCase(fetchEtudiants.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEtudiants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          // Si l'API renvoie des données paginées
          state.etudiants = action.payload.data;
          state.pagination = action.payload.meta || state.pagination;
        } else {
          // Si l'API renvoie juste un tableau
          state.etudiants = action.payload;
        }
      })
      .addCase(fetchEtudiants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des étudiants';
      })
      
      // Cas pour fetchEtudiantById
      .addCase(fetchEtudiantById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEtudiantById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEtudiant = action.payload;
      })
      .addCase(fetchEtudiantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'étudiant';
      })
      
      // Cas pour fetchEtudiantByMatricule
      .addCase(fetchEtudiantByMatricule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEtudiantByMatricule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEtudiant = action.payload;
      })
      .addCase(fetchEtudiantByMatricule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'étudiant';
      })
      
      // Cas pour createEtudiant
      .addCase(createEtudiant.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEtudiant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.etudiants.push(action.payload);
        state.currentEtudiant = action.payload;
      })
      .addCase(createEtudiant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création de l\'étudiant';
      })
      
      // Cas pour updateEtudiant
      .addCase(updateEtudiant.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEtudiant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEtudiant = action.payload;
        const index = state.etudiants.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.etudiants[index] = action.payload;
        }
      })
      .addCase(updateEtudiant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour de l\'étudiant';
      })
      
      // Cas pour deleteEtudiant
      .addCase(deleteEtudiant.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEtudiant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.etudiants = state.etudiants.filter(e => e.id !== action.payload);
        if (state.currentEtudiant && state.currentEtudiant.id === action.payload) {
          state.currentEtudiant = null;
        }
      })
      .addCase(deleteEtudiant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression de l\'étudiant';
      })
      
      // Cas pour fetchEtudiantReleveNotes
      .addCase(fetchEtudiantReleveNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEtudiantReleveNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.releveNotes = action.payload;
      })
      .addCase(fetchEtudiantReleveNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des relevés de notes';
      })
      
      // Cas pour fetchEtudiantStages
      .addCase(fetchEtudiantStages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEtudiantStages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stages = action.payload;
      })
      .addCase(fetchEtudiantStages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des stages';
      })
      
      // Cas pour updateEtudiantStatut
      .addCase(updateEtudiantStatut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEtudiantStatut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentEtudiant = action.payload;
        const index = state.etudiants.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.etudiants[index] = action.payload;
        }
      })
      .addCase(updateEtudiantStatut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour du statut';
      });
  }
});

export const { 
  clearCurrentEtudiant, 
  clearError, 
  setPage, 
  setLimit 
} = etudiantSlice.actions;

export default etudiantSlice.reducer;
