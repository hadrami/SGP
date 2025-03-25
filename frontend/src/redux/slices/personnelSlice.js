// src/redux/slices/personnelSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import personnelApi from '../../api/personnel.api';

// Thunks asynchrones
export const fetchPersonnels = createAsyncThunk(
  'personnels/fetchPersonnels',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await personnelApi.getAllPersonnels(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des personnels' });
    }
  }
);

export const fetchPersonnelById = createAsyncThunk(
  'personnels/fetchPersonnelById',
  async (id, { rejectWithValue }) => {
    try {
      return await personnelApi.getPersonnelById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération du personnel' });
    }
  }
);

export const fetchPersonnelByNni = createAsyncThunk(
  'personnels/fetchPersonnelByNni',
  async (nni, { rejectWithValue }) => {
    try {
      return await personnelApi.getPersonnelByNni(nni);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération du personnel' });
    }
  }
);

export const createPersonnel = createAsyncThunk(
  'personnels/createPersonnel',
  async (personnelData, { rejectWithValue }) => {
    try {
      return await personnelApi.createPersonnel(personnelData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création du personnel' });
    }
  }
);

export const updatePersonnel = createAsyncThunk(
  'personnels/updatePersonnel',
  async ({ id, personnelData }, { rejectWithValue }) => {
    try {
      return await personnelApi.updatePersonnel(id, personnelData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour du personnel' });
    }
  }
);

export const deletePersonnel = createAsyncThunk(
  'personnels/deletePersonnel',
  async (id, { rejectWithValue }) => {
    try {
      await personnelApi.deletePersonnel(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression du personnel' });
    }
  }
);

export const fetchPersonnelStats = createAsyncThunk(
  'personnels/fetchPersonnelStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await personnelApi.getPersonnelStats(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des statistiques' });
    }
  }
);

// Création du slice
const personnelSlice = createSlice({
  name: 'personnels',
  initialState: {
    personnels: [],
    currentPersonnel: null,
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
    clearCurrentPersonnel: (state) => {
      state.currentPersonnel = null;
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
      // Cas pour fetchPersonnels
      .addCase(fetchPersonnels.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersonnels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.personnels = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchPersonnels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des personnels';
      })
      
      // Cas pour fetchPersonnelById ou fetchPersonnelByNni
      .addCase(fetchPersonnelById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersonnelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentPersonnel = action.payload;
      })
      .addCase(fetchPersonnelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération du personnel';
      })
      
      .addCase(fetchPersonnelByNni.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersonnelByNni.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentPersonnel = action.payload;
      })
      .addCase(fetchPersonnelByNni.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération du personnel';
      })
      
      // Cas pour createPersonnel
      .addCase(createPersonnel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPersonnel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.personnels.push(action.payload);
        state.currentPersonnel = action.payload;
      })
      .addCase(createPersonnel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création du personnel';
      })
      
      // Cas pour updatePersonnel
      .addCase(updatePersonnel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePersonnel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentPersonnel = action.payload;
        const index = state.personnels.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.personnels[index] = action.payload;
        }
      })
      .addCase(updatePersonnel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour du personnel';
      })
      
      // Cas pour deletePersonnel
      .addCase(deletePersonnel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePersonnel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.personnels = state.personnels.filter(p => p.id !== action.payload);
        if (state.currentPersonnel && state.currentPersonnel.id === action.payload) {
          state.currentPersonnel = null;
        }
      })
      .addCase(deletePersonnel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression du personnel';
      })
      
      // Cas pour fetchPersonnelStats
      .addCase(fetchPersonnelStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersonnelStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchPersonnelStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des statistiques';
      });
  }
});

export const { clearCurrentPersonnel, clearError, setPage, setLimit } = personnelSlice.actions;
export default personnelSlice.reducer;