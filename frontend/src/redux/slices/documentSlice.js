// src/redux/slices/documentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import documentApi from '../../api/document.api';

// Thunks asynchrones
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await documentApi.getAllDocuments(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des documents' });
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (id, { rejectWithValue }) => {
    try {
      return await documentApi.getDocumentById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération du document' });
    }
  }
);

export const fetchDocumentsByPersonnel = createAsyncThunk(
  'documents/fetchDocumentsByPersonnel',
  async (personnelId, { rejectWithValue }) => {
    try {
      return await documentApi.getDocumentsByPersonnel(personnelId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des documents du personnel' });
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ formData, personnelId }, { rejectWithValue }) => {
    try {
      return await documentApi.uploadDocument(formData, personnelId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors du téléchargement du document' });
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, documentData }, { rejectWithValue }) => {
    try {
      return await documentApi.updateDocument(id, documentData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour du document' });
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await documentApi.deleteDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression du document' });
    }
  }
);

export const downloadDocument = createAsyncThunk(
  'documents/downloadDocument',
  async (id, { rejectWithValue }) => {
    try {
      return await documentApi.downloadDocument(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors du téléchargement du document' });
    }
  }
);

// Création du slice
const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    currentDocument: null,
    downloadUrl: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    },
    isLoading: false,
    isUploading: false,
    error: null
  },
  reducers: {
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearDownloadUrl: (state) => {
      state.downloadUrl = null;
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
      // Cas pour fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.documents = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des documents';
      })
      
      // Cas pour fetchDocumentById
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération du document';
      })
      
      // Cas pour fetchDocumentsByPersonnel
      .addCase(fetchDocumentsByPersonnel.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDocumentsByPersonnel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.documents = action.payload;
      })
      .addCase(fetchDocumentsByPersonnel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des documents du personnel';
      })
      
      // Cas pour uploadDocument
      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.error = null;
        state.documents.push(action.payload);
        state.currentDocument = action.payload;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload?.error || 'Erreur lors du téléchargement du document';
      })
      
      // Cas pour updateDocument
      .addCase(updateDocument.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentDocument = action.payload;
        const index = state.documents.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour du document';
      })
      
      // Cas pour deleteDocument
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.documents = state.documents.filter(d => d.id !== action.payload);
        if (state.currentDocument && state.currentDocument.id === action.payload) {
          state.currentDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression du document';
      })
      
      // Cas pour downloadDocument
      .addCase(downloadDocument.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(downloadDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.downloadUrl = action.payload;
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors du téléchargement du document';
      });
  }
});

export const { clearCurrentDocument, clearError, clearDownloadUrl, setPage, setLimit } = documentSlice.actions;
export default documentSlice.reducer;