// src/redux/slices/situationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import situationApi from '../../api/situation.api';

// Thunks asynchrones
export const fetchSituations = createAsyncThunk(
  'situations/fetchSituations',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await situationApi.getAllSituations(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des situations' });
    }
  }
);

export const fetchSituationById = createAsyncThunk(
  'situations/fetchSituationById',
  async (id, { rejectWithValue }) => {
    try {
      return await situationApi.getSituationById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de la situation' });
    }
  }
);

export const fetchSituationsByInstitut = createAsyncThunk(
  'situations/fetchSituationsByInstitut',
  async ({ institutId, params = {} }, { rejectWithValue }) => {
    try {
      return await situationApi.getSituationsByInstitut(institutId, params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des situations' });
    }
  }
);

export const fetchSituationsByDate = createAsyncThunk(
  'situations/fetchSituationsByDate',
  async ({ date, params = {} }, { rejectWithValue }) => {
    try {
      return await situationApi.getSituationsByDate(date, params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des situations' });
    }
  }
);

export const createSituation = createAsyncThunk(
  'situations/createSituation',
  async (situationData, { rejectWithValue }) => {
    try {
      return await situationApi.createSituation(situationData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création de la situation' });
    }
  }
);

export const updateSituation = createAsyncThunk(
  'situations/updateSituation',
  async ({ id, situationData }, { rejectWithValue }) => {
    try {
      return await situationApi.updateSituation(id, situationData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour de la situation' });
    }
  }
);

export const deleteSituation = createAsyncThunk(
  'situations/deleteSituation',
  async (id, { rejectWithValue }) => {
    try {
      await situationApi.deleteSituation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression de la situation' });
    }
  }
);

export const fetchSituationStats = createAsyncThunk(
  'situations/fetchSituationStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await situationApi.getSituationStats(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des statistiques' });
    }
  }
);

// Création du slice
const situationSlice = createSlice({
  name: 'situations',
  initialState: {
    situations: [],
    currentSituation: null,
    stats: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    },
    isLoading: false,
    error: null
  },
  reducers: {
    clearCurrentSituation: (state) => {
      state.currentSituation = null;
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
      // Cas pour fetchSituations
      .addCase(fetchSituations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSituations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.situations = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchSituations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des situations';
      })
      
      // Cas pour fetchSituationById
      .addCase(fetchSituationById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSituationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentSituation = action.payload;
      })
      .addCase(fetchSituationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de la situation';
      })
      
      // Cas pour fetchSituationsByInstitut
      .addCase(fetchSituationsByInstitut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSituationsByInstitut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.situations = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchSituationsByInstitut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des situations par institut';
      })
      
      // Cas pour fetchSituationsByDate
      .addCase(fetchSituationsByDate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSituationsByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.situations = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchSituationsByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des situations par date';
      })
      
      // Cas pour createSituation
      .addCase(createSituation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSituation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.situations.push(action.payload);
        state.currentSituation = action.payload;
      })
      .addCase(createSituation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création de la situation';
      })
      
      // Cas pour updateSituation
      .addCase(updateSituation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSituation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentSituation = action.payload;
        const index = state.situations.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.situations[index] = action.payload;
        }
      })
      .addCase(updateSituation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour de la situation';
      })
      
      // Cas pour deleteSituation
      .addCase(deleteSituation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSituation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.situations = state.situations.filter(s => s.id !== action.payload);
        if (state.currentSituation && state.currentSituation.id === action.payload) {
          state.currentSituation = null;
        }
      })
      .addCase(deleteSituation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression de la situation';
      })
      
      // Cas pour fetchSituationStats
      .addCase(fetchSituationStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSituationStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchSituationStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des statistiques';
      });
  }
});

export const { clearCurrentSituation, clearError, setPage, setLimit } = situationSlice.actions;
export default situationSlice.reducer;