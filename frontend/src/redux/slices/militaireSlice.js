// src/redux/slices/militaireSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import militaireApi from '../../api/militaire.api';

// Thunks asynchrones
export const fetchMilitaires = createAsyncThunk(
  'militaires/fetchMilitaires',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('Calling getAllMilitaires with params:', params);
      // Check for token before making request
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available for fetchMilitaires');
        return rejectWithValue({ error: 'Authentification requise' });
      }
      
      const response = await militaireApi.getAllMilitaires(params);
      console.log('API response data:', response);
      return response;
    } catch (error) {
      console.error('Error in fetchMilitaires:', error);
      // More detailed error handling
      if (error.response?.status === 401) {
        // Token expired or invalid
        return rejectWithValue({ 
          error: 'Session expirée. Veuillez vous reconnecter.', 
          status: 401 
        });
      }
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des militaires' });
    }
  }
);

export const fetchMilitaireById = createAsyncThunk(
  'militaires/fetchMilitaireById',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Dispatching fetchMilitaireById for ID: ${id}`);
      const response = await militaireApi.getMilitaireById(id);
      console.log('Militaire data received:', response);
      return response;
    } catch (error) {
      console.error(`Error in fetchMilitaireById for ${id}:`, error);
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération du militaire' });
    }
  }
);

export const fetchMilitaireByMatricule = createAsyncThunk(
  'militaires/fetchMilitaireByMatricule',
  async (matricule, { rejectWithValue }) => {
    try {
      console.log(`Dispatching fetchMilitaireByMatricule for matricule: ${matricule}`);
      const response = await militaireApi.getMilitaireByMatricule(matricule);
      console.log('Militaire data received:', response);
      return response;
    } catch (error) {
      console.error(`Error in fetchMilitaireByMatricule for ${matricule}:`, error);
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération du militaire' });
    }
  }
);

export const createMilitaire = createAsyncThunk(
  'militaires/createMilitaire',
  async (militaireData, { rejectWithValue }) => {
    try {
      const response = await militaireApi.createMilitaire(militaireData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la création du militaire' });
    }
  }
);

export const updateMilitaire = createAsyncThunk(
  'militaires/updateMilitaire',
  async ({ id, militaireData }, { rejectWithValue }) => {
    try {
      const response = await militaireApi.updateMilitaire(id, militaireData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour du militaire' });
    }
  }
);

export const deleteMilitaire = createAsyncThunk(
  'militaires/deleteMilitaire',
  async (id, { rejectWithValue }) => {
    try {
      const response = await militaireApi.deleteMilitaire(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la suppression du militaire' });
    }
  }
);

export const fetchMilitaireStats = createAsyncThunk(
  'militaires/fetchMilitaireStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await militaireApi.getMilitaireStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des statistiques' });
    }
  }
);

export const updateMilitaireSituation = createAsyncThunk(
  'militaires/updateMilitaireSituation',
  async ({ id, situationData }, { rejectWithValue }) => {
    try {
      const response = await militaireApi.updateMilitaireSituation(id, situationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la mise à jour de la situation du militaire' });
    }
  }
);

export const fetchMilitaireSituationHistory = createAsyncThunk(
  'militaires/fetchMilitaireSituationHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await militaireApi.getMilitaireSituationHistory(id);
      return { id, situationHistory: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération de l\'historique des situations' });
    }
  }
);

export const addDecoration = createAsyncThunk(
  'militaires/addDecoration',
  async ({ militaireId, decorationData }, { rejectWithValue }) => {
    try {
      const response = await militaireApi.addDecoration(militaireId, decorationData);
      return { militaireId, decoration: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de l\'ajout de la décoration' });
    }
  }
);

export const addNotation = createAsyncThunk(
  'militaires/addNotation',
  async ({ militaireId, notationData }, { rejectWithValue }) => {
    try {
      const response = await militaireApi.addNotation(militaireId, notationData);
      return { militaireId, notation: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de l\'ajout de la notation' });
    }
  }
);

export const addStageMilitaire = createAsyncThunk(
  'militaires/addStageMilitaire',
  async ({ militaireId, stageData }, { rejectWithValue }) => {
    try {
      const response = await militaireApi.addStageMilitaire(militaireId, stageData);
      return { militaireId, stage: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de l\'ajout du stage militaire' });
    }
  }
);

export const fetchArmes = createAsyncThunk(
  'militaires/fetchArmes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await militaireApi.getArmes();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des armes' });
    }
  }
);

export const fetchSpecialitesByArme = createAsyncThunk(
  'militaires/fetchSpecialitesByArme',
  async (armeId, { rejectWithValue }) => {
    try {
      const response = await militaireApi.getSpecialitesByArme(armeId);
      return { armeId, specialites: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des spécialités' });
    }
  }
);

export const fetchFonctions = createAsyncThunk(
  'militaires/fetchFonctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await militaireApi.getFonctions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des fonctions' });
    }
  }
);

export const fetchSousUnites = createAsyncThunk(
  'militaires/fetchSousUnites',
  async (uniteId = null, { rejectWithValue }) => {
    try {
      const response = await militaireApi.getSousUnites(uniteId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la récupération des sous-unités' });
    }
  }
);

// Création du slice
const militaireSlice = createSlice({
  name: 'militaires',
  initialState: {
    militaires: [],
    currentMilitaire: null,
    situationHistory: [],
    stats: null,
    armes: [],
    specialites: {},
    fonctions: [],
    sousUnites: [],
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
    clearCurrentMilitaire: (state) => {
      state.currentMilitaire = null;
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
    clearSituationHistory: (state) => {
      state.situationHistory = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Cas pour fetchMilitaires
      .addCase(fetchMilitaires.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMilitaires.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Check if data is in expected format
        if (action.payload && action.payload.data) {
          state.militaires = action.payload.data;
          // Only update pagination if it exists in response
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          } else if (action.payload.meta) {
            state.pagination = action.payload.meta;
          }
        } else {
          // Handle unexpected response format
          console.error('Unexpected response format:', action.payload);
          state.militaires = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchMilitaires.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des militaires';
        
        // Handle 401 errors specially
        if (action.payload?.status === 401) {
          // Clear militaires list on auth error
          state.militaires = [];
        }
      })
      
      // Cas pour fetchMilitaireById
      .addCase(fetchMilitaireById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMilitaireById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentMilitaire = action.payload;
      })
      .addCase(fetchMilitaireById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération du militaire';
      })
      
      // Cas pour fetchMilitaireByMatricule
      .addCase(fetchMilitaireByMatricule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMilitaireByMatricule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentMilitaire = action.payload;
      })
      .addCase(fetchMilitaireByMatricule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération du militaire';
      })
      
      // Cas pour createMilitaire
      .addCase(createMilitaire.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMilitaire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.militaires.push(action.payload);
      })
      .addCase(createMilitaire.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la création du militaire';
      })
      
      // Cas pour updateMilitaire
      .addCase(updateMilitaire.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMilitaire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Update both in list and current if applicable
        if (state.currentMilitaire && state.currentMilitaire.id === action.payload.id) {
          state.currentMilitaire = action.payload;
        }
        
        const index = state.militaires.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.militaires[index] = action.payload;
        }
      })
      .addCase(updateMilitaire.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour du militaire';
      })
      
      // Cas pour deleteMilitaire
      .addCase(deleteMilitaire.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMilitaire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        state.militaires = state.militaires.filter(m => m.id !== action.payload.id);
        if (state.currentMilitaire && state.currentMilitaire.id === action.payload.id) {
          state.currentMilitaire = null;
        }
      })
      .addCase(deleteMilitaire.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la suppression du militaire';
      })
      
      // Cas pour fetchMilitaireStats
      .addCase(fetchMilitaireStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMilitaireStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchMilitaireStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des statistiques';
      })
      
      // Cas pour updateMilitaireSituation
      .addCase(updateMilitaireSituation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMilitaireSituation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Update both in list and current if applicable
        if (state.currentMilitaire && state.currentMilitaire.id === action.payload.id) {
          state.currentMilitaire = action.payload;
        }
        
        const index = state.militaires.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.militaires[index] = action.payload;
        }
      })
      .addCase(updateMilitaireSituation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la mise à jour de la situation du militaire';
      })
      
      // Cas pour fetchMilitaireSituationHistory
      .addCase(fetchMilitaireSituationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMilitaireSituationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.situationHistory = action.payload.situationHistory;
      })
      .addCase(fetchMilitaireSituationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération de l\'historique des situations';
      })
      
      // Cas pour addDecoration
      .addCase(addDecoration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addDecoration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Add to current militaire if it's the same one
        if (state.currentMilitaire && state.currentMilitaire.id === action.payload.militaireId) {
          if (!state.currentMilitaire.decorations) {
            state.currentMilitaire.decorations = [];
          }
          state.currentMilitaire.decorations.push(action.payload.decoration);
        }
      })
      .addCase(addDecoration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de l\'ajout de la décoration';
      })
      
      // Cas pour addNotation
      .addCase(addNotation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Add to current militaire if it's the same one
        if (state.currentMilitaire && state.currentMilitaire.id === action.payload.militaireId) {
          if (!state.currentMilitaire.notations) {
            state.currentMilitaire.notations = [];
          }
          state.currentMilitaire.notations.push(action.payload.notation);
        }
      })
      .addCase(addNotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de l\'ajout de la notation';
      })
      
      // Cas pour addStageMilitaire
      .addCase(addStageMilitaire.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addStageMilitaire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Add to current militaire if it's the same one
        if (state.currentMilitaire && state.currentMilitaire.id === action.payload.militaireId) {
          if (!state.currentMilitaire.stagesMilitaires) {
            state.currentMilitaire.stagesMilitaires = [];
          }
          state.currentMilitaire.stagesMilitaires.push(action.payload.stage);
        }
      })
      .addCase(addStageMilitaire.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de l\'ajout du stage militaire';
      })
      
      // Cas pour fetchArmes
      .addCase(fetchArmes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArmes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.armes = action.payload;
      })
      .addCase(fetchArmes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des armes';
      })
      
      // Cas pour fetchSpecialitesByArme
      .addCase(fetchSpecialitesByArme.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpecialitesByArme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.specialites[action.payload.armeId] = action.payload.specialites;
      })
      .addCase(fetchSpecialitesByArme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des spécialités';
      })
      
      // Cas pour fetchFonctions
      .addCase(fetchFonctions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFonctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.fonctions = action.payload;
      })
      .addCase(fetchFonctions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des fonctions';
      })
      
      // Cas pour fetchSousUnites
      .addCase(fetchSousUnites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSousUnites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.sousUnites = action.payload;
      })
      .addCase(fetchSousUnites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors de la récupération des sous-unités';
      })

      // Default case for any other rejected action
      .addMatcher(
        action => action.type.endsWith('/rejected'),
        (state, action) => {
          // Handle authentication errors globally
          if (action.payload?.status === 401) {
            state.error = 'Session expirée. Veuillez vous reconnecter.';
          }
        }
      );
  }
});

export const { clearCurrentMilitaire, clearError, setPage, setLimit, clearSituationHistory } = militaireSlice.actions;
export default militaireSlice.reducer;