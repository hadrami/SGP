// src/redux/slices/professeurSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import professeurApi from '../../api/professeur.api';

// Thunks asynchrones
export const fetchProfesseurs = createAsyncThunk(
  'professeurs/fetchProfesseurs',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await professeurApi.getAllProfesseurs(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des professeurs' });
    }
  }
);

export const fetchProfesseurById = createAsyncThunk(
  'professeurs/fetchProfesseurById',
  async (id, { rejectWithValue }) => {
    try {
      return await professeurApi.getProfesseurById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération du professeur' });
    }
  }
);

export const createProfesseur = createAsyncThunk(
  'professeurs/createProfesseur',
  async (professeurData, { rejectWithValue }) => {
    try {
      return await professeurApi.createProfesseur(professeurData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création du professeur' });
    }
  }
);

export const updateProfesseur = createAsyncThunk(
  'professeurs/updateProfesseur',
  async ({ id, professeurData }, { rejectWithValue }) => {
    try {
      return await professeurApi.updateProfesseur(id, professeurData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour du professeur' });
    }
  }
);

export const deleteProfesseur = createAsyncThunk(
  'professeurs/deleteProfesseur',
  async (id, { rejectWithValue }) => {
    try {
      await professeurApi.deleteProfesseur(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression du professeur' });
    }
  }
);

export const fetchProfesseurMatieres = createAsyncThunk(
  'professeurs/fetchProfesseurMatieres',
  async (id, { rejectWithValue }) => {
    try {
      return await professeurApi.getProfesseurMatieres(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des matières du professeur' });
    }
  }
);

export const fetchProfesseurClasses = createAsyncThunk(
  'professeurs/fetchProfesseurClasses',
  async (id, { rejectWithValue }) => {
    try {
      return await professeurApi.getProfesseurClasses(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des classes du professeur' });
    }
  }
);

// Création du slice
const professeurSlice = createSlice({
  name: 'professeurs',
  initialState: {
    professeurs: [],
    currentProfesseur: null,
    matieres: [],
    classes: [],
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
    clearCurrentProfesseur: (state) => {
      state.currentProfesseur = null;
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
      // Cas pour fetchProfesseurs
      .addCase(fetchProfesseurs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfesseurs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          // Si l'API renvoie des données paginées
          state.professeurs = action.payload.data;
          state.pagination = action.payload.meta || state.pagination;
        } else {
          // Si l'API renvoie juste un tableau
          state.professeurs = action.payload;
        }
      })
      .addCase(fetchProfesseurs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des professeurs';
      })
      
      // Cas pour fetchProfesseurById
      .addCase(fetchProfesseurById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfesseurById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentProfesseur = action.payload;
      })
      .addCase(fetchProfesseurById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération du professeur';
      })
      
      // Cas pour createProfesseur
      .addCase(createProfesseur.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProfesseur.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.professeurs.push(action.payload);
        state.currentProfesseur = action.payload;
      })
      .addCase(createProfesseur.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création du professeur';
      })
      
      // Cas pour updateProfesseur
      .addCase(updateProfesseur.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfesseur.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentProfesseur = action.payload;
        const index = state.professeurs.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.professeurs[index] = action.payload;
        }
      })
      .addCase(updateProfesseur.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour du professeur';
      })
      
      // Cas pour deleteProfesseur
      .addCase(deleteProfesseur.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProfesseur.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.professeurs = state.professeurs.filter(p => p.id !== action.payload);
        if (state.currentProfesseur && state.currentProfesseur.id === action.payload) {
          state.currentProfesseur = null;
        }
      })
      .addCase(deleteProfesseur.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression du professeur';
      })
      
      // Cas pour fetchProfesseurMatieres
      .addCase(fetchProfesseurMatieres.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfesseurMatieres.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.matieres = action.payload;
      })
      .addCase(fetchProfesseurMatieres.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des matières';
      })
      
      // Cas pour fetchProfesseurClasses
      .addCase(fetchProfesseurClasses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfesseurClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.classes = action.payload;
      })
      .addCase(fetchProfesseurClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des classes';
      });
  }
});

export const { 
  clearCurrentProfesseur, 
  clearError, 
  setPage, 
  setLimit 
} = professeurSlice.actions;

export default professeurSlice.reducer;
