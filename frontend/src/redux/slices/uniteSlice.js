// src/redux/slices/uniteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import uniteApi from '../../api/unite.api';

// Thunks asynchrones
export const fetchUnites = createAsyncThunk(
  'unites/fetchUnites',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await uniteApi.getAllUnites(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des unités' });
    }
  }
);

export const fetchUniteById = createAsyncThunk(
  'unites/fetchUniteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await uniteApi.getUniteById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'unité' });
    }
  }
);

export const fetchUniteByCode = createAsyncThunk(
  'unites/fetchUniteByCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await uniteApi.getUniteByCode(code);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'unité par code' });
    }
  }
);

export const fetchUnitesByType = createAsyncThunk(
  'unites/fetchUnitesByType',
  async (type, { rejectWithValue }) => {
    try {
      const response = await uniteApi.getUnitesByType(type);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des unités par type' });
    }
  }
);

// Récupérer le personnel d'une unité donnée
export const fetchUnitePersonnel = createAsyncThunk(
  'unites/fetchUnitePersonnel',
  async (
    { uniteId, page = 1, limit = 10, search = '', typePersonnel = '' },
    { rejectWithValue }
  ) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (typePersonnel) params.typePersonnel = typePersonnel;
      const response = await uniteApi.getUnitePersonnel(uniteId, params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Erreur lors de la récupération du personnel');
    }
  }
);


export const fetchUniteStats = createAsyncThunk(
  'unites/fetchUniteStats',
  async (uniteId, { rejectWithValue }) => {
    try {
      const response = await uniteApi.getUniteStats(uniteId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des statistiques de l\'unité' });
    }
  }
);

export const fetchUniteSousUnites = createAsyncThunk(
  'unites/fetchUniteSousUnites',
  async (uniteId, { rejectWithValue }) => {
    try {
      const response = await uniteApi.getUniteSousUnites(uniteId);
      return { uniteId, sousUnites: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des sous-unités' });
    }
  }
);

export const createUnite = createAsyncThunk(
  'unites/createUnite',
  async (uniteData, { rejectWithValue }) => {
    try {
      const response = await uniteApi.createUnite(uniteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création de l\'unité' });
    }
  }
);

export const updateUnite = createAsyncThunk(
  'unites/updateUnite',
  async ({ id, uniteData }, { rejectWithValue }) => {
    try {
      const response = await uniteApi.updateUnite(id, uniteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour de l\'unité' });
    }
  }
);

export const deleteUnite = createAsyncThunk(
  'unites/deleteUnite',
  async (id, { rejectWithValue }) => {
    try {
      await uniteApi.deleteUnite(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression de l\'unité' });
    }
  }
);

// Création du slice
const uniteSlice = createSlice({
  name: 'unites',
  initialState: {
    list: [],
    listLoading: false,
    listError: null,
    personnel: {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    },
    sousUnites: [],
    stats: null,
    isLoading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    personnel: {
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    },
    personnelLoading: false,
    personnelError: null
  },
  reducers: {
    clearCurrentUnite: (state) => {
      state.currentUnite = null;
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
      // Cas pour fetchUnites
      .addCase(fetchUnites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUnites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          // Si l'API renvoie des données paginées
          state.unites = action.payload.data;
          state.pagination = action.payload.pagination || state.pagination;
        } else {
          // Si l'API renvoie juste un tableau
          state.unites = action.payload;
        }
      })
      .addCase(fetchUnites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des unités';
      })
      
      // Cas pour fetchUniteById
      .addCase(fetchUniteById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUniteById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentUnite = action.payload;
      })
      .addCase(fetchUniteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'unité';
      })
      
      // Cas pour fetchUniteByCode
      .addCase(fetchUniteByCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUniteByCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentUnite = action.payload;
      })
      .addCase(fetchUniteByCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'unité par code';
      })
      
      // Cas pour fetchUnitesByType
      .addCase(fetchUnitesByType.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUnitesByType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Stocker les unités par type
        if (action.meta && action.meta.arg) {
          state.unitesByType[action.meta.arg] = action.payload;
        }
      })
      .addCase(fetchUnitesByType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des unités par type';
      })
      
      
      // fetchUnitePersonnel
      .addCase(fetchUnitePersonnel.pending, state => {
        state.personnelLoading = true;
        state.personnelError = null;
      })
      .addCase(fetchUnitePersonnel.fulfilled, (state, action) => {
        state.personnelLoading = false;
        state.personnel.data = action.payload.data;
        state.personnel.pagination = action.payload.pagination;
      })
      .addCase(fetchUnitePersonnel.rejected, (state, action) => {
        state.personnelLoading = false;
        state.personnelError = action.payload;
      })
      
      // Cas pour fetchUniteStats
      .addCase(fetchUniteStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUniteStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchUniteStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des statistiques';
      })
      
      // Cas pour fetchUniteSousUnites
      .addCase(fetchUniteSousUnites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUniteSousUnites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.sousUnites = action.payload.sousUnites;
      })
      .addCase(fetchUniteSousUnites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des sous-unités';
      })
      
      // Cas pour createUnite
      .addCase(createUnite.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUnite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.unites.push(action.payload);
        state.currentUnite = action.payload;
      })
      .addCase(createUnite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création de l\'unité';
      })
      
      // Cas pour updateUnite
      .addCase(updateUnite.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUnite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentUnite = action.payload;
        const index = state.unites.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.unites[index] = action.payload;
        }
      })
      .addCase(updateUnite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour de l\'unité';
      })
      
      // Cas pour deleteUnite
      .addCase(deleteUnite.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUnite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.unites = state.unites.filter(i => i.id !== action.payload);
        if (state.currentUnite && state.currentUnite.id === action.payload) {
          state.currentUnite = null;
        }
      })
      .addCase(deleteUnite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression de l\'unité';
      })
  }
});

export const { clearCurrentUnite, clearError, setPage, setLimit } = uniteSlice.actions;
export default uniteSlice.reducer;