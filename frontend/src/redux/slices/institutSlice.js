// src/redux/slices/institutSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import institutApi from '../../api/institut.api';

// Thunks asynchrones
export const fetchInstituts = createAsyncThunk(
  'instituts/fetchInstituts',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await institutApi.getAllInstituts(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des instituts' });
    }
  }
);

export const fetchInstitutById = createAsyncThunk(
  'instituts/fetchInstitutById',
  async (id, { rejectWithValue }) => {
    try {
      return await institutApi.getInstitutById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'institut' });
    }
  }
);

export const createInstitut = createAsyncThunk(
  'instituts/createInstitut',
  async (institutData, { rejectWithValue }) => {
    try {
      return await institutApi.createInstitut(institutData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création de l\'institut' });
    }
  }
);

export const updateInstitut = createAsyncThunk(
  'instituts/updateInstitut',
  async ({ id, institutData }, { rejectWithValue }) => {
    try {
      return await institutApi.updateInstitut(id, institutData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour de l\'institut' });
    }
  }
);

export const deleteInstitut = createAsyncThunk(
  'instituts/deleteInstitut',
  async (id, { rejectWithValue }) => {
    try {
      await institutApi.deleteInstitut(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression de l\'institut' });
    }
  }
);

export const fetchInstitutMilitaires = createAsyncThunk(
  'instituts/fetchInstitutMilitaires',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      return await institutApi.getInstitutMilitaires(id, params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des militaires de l\'institut' });
    }
  }
);

export const fetchInstitutCivils = createAsyncThunk(
  'instituts/fetchInstitutCivils',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      return await institutApi.getInstitutCivils(id, params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des civils de l\'institut' });
    }
  }
);

export const fetchInstitutStats = createAsyncThunk(
  'instituts/fetchInstitutStats',
  async (id, { rejectWithValue }) => {
    try {
      return await institutApi.getInstitutStats(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des statistiques de l\'institut' });
    }
  }
);

// Création du slice
const institutSlice = createSlice({
  name: 'instituts',
  initialState: {
    instituts: [],
    currentInstitut: null,
    institutMilitaires: [],
    institutCivils: [],
    stats: null,
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
    clearCurrentInstitut: (state) => {
      state.currentInstitut = null;
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
      // Cas pour fetchInstituts
      .addCase(fetchInstituts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInstituts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          // Si l'API renvoie des données paginées
          state.instituts = action.payload.data;
          state.pagination = action.payload.meta || state.pagination;
        } else {
          // Si l'API renvoie juste un tableau
          state.instituts = action.payload;
        }
      })
      .addCase(fetchInstituts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des instituts';
      })
      
      // Cas pour fetchInstitutById
      .addCase(fetchInstitutById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInstitutById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentInstitut = action.payload;
      })
      .addCase(fetchInstitutById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'institut';
      })
      
      // Cas pour createInstitut
      .addCase(createInstitut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createInstitut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.instituts.push(action.payload);
        state.currentInstitut = action.payload;
      })
      .addCase(createInstitut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création de l\'institut';
      })
      
      // Cas pour updateInstitut
      .addCase(updateInstitut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateInstitut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentInstitut = action.payload;
        const index = state.instituts.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.instituts[index] = action.payload;
        }
      })
      .addCase(updateInstitut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour de l\'institut';
      })
      
      // Cas pour deleteInstitut
      .addCase(deleteInstitut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteInstitut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.instituts = state.instituts.filter(i => i.id !== action.payload);
        if (state.currentInstitut && state.currentInstitut.id === action.payload) {
          state.currentInstitut = null;
        }
      })
      .addCase(deleteInstitut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression de l\'institut';
      })
      
      // Cas pour fetchInstitutMilitaires
      .addCase(fetchInstitutMilitaires.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInstitutMilitaires.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          state.institutMilitaires = action.payload.data;
        } else {
          state.institutMilitaires = action.payload;
        }
      })
      .addCase(fetchInstitutMilitaires.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des militaires de l\'institut';
      })
      
      // Cas pour fetchInstitutCivils
      .addCase(fetchInstitutCivils.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInstitutCivils.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          state.institutCivils = action.payload.data;
        } else {
          state.institutCivils = action.payload;
        }
      })
      .addCase(fetchInstitutCivils.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des civils de l\'institut';
      })
      
      // Cas pour fetchInstitutStats
      .addCase(fetchInstitutStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInstitutStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchInstitutStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des statistiques de l\'institut';
      });
  }
});

export const { clearCurrentInstitut, clearError, setPage, setLimit } = institutSlice.actions;
export default institutSlice.reducer;
