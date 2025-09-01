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

// 1. Create which can include a file
export const createPersonnel = createAsyncThunk(
  'personnels/create',
  async ({ data, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      Object.entries(data).forEach(([k,v]) => form.append(k, v));
      if (file) form.append('file', file);

      const { data: created } = await personnelApi.createPersonnel(form);
      return created;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 2. Update metadata and then optionally swap photo
export const updatePersonnel = createAsyncThunk(
  'personnels/update',
  async ({ id, data, file }, { dispatch, rejectWithValue }) => {
    try {
      const { data: updated } = await personnelApi.updatePersonnel(id, data);
      if (file) {
        const form = new FormData();
        form.append('file', file);
        const { data: imageRes } = await personnelApi.uploadImage(id, form);
        updated.imageUrl = imageRes.imageUrl;
      }
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 3. (Existing) a standalone image‐only thunk if you still need it
export const uploadPersonnelImage = createAsyncThunk(
  'personnels/uploadImage',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await personnelApi.uploadImage(id, form);
      return { id, imageUrl: data.imageUrl };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
      })
       // uploadPersonnelImage
       .addCase(uploadPersonnelImage.pending, (state) => { state.isLoading = true; })
       .addCase(uploadPersonnelImage.fulfilled, (state, action) => {
         state.isLoading = false;
         state.error = null;
         const { id, imageUrl } = action.payload;
         if (state.currentPersonnel?.id === id) {
           state.currentPersonnel.imageUrl = imageUrl;
         }
         const idx = state.personnels.findIndex(p => p.id === id);
         if (idx !== -1) state.personnels[idx].imageUrl = imageUrl;
       })
       .addCase(uploadPersonnelImage.rejected, (state, action) => {
         state.isLoading = false;
         state.error = action.payload?.error || 'Erreur lors de l\'upload de l\'image';
       });
  }
});

export const { clearCurrentPersonnel, clearError, setPage, setLimit } = personnelSlice.actions;
export default personnelSlice.reducer;