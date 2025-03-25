// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/auth.api';

// Async thunks
// Update this in your authSlice.js
// Update this in your authSlice.js

export const login = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      // Clear any existing tokens first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Make the login request
      const data = await authApi.login(identifier, password);
      
      // Validate response data
      if (!data || !data.token) {
        console.error('Login response missing token:', data);
        return rejectWithValue({ error: 'Réponse du serveur invalide' });
      }
      
      // Store token in localStorage IMMEDIATELY
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login successful, token saved to localStorage');
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data || { error: 'Erreur lors de la connexion' });
    }
  }
);
// Add the changePassword thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      
      // If password changed successfully and this was first login,
      // update the user in localStorage
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.isFirstLogin) {
          user.isFirstLogin = false;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Erreur lors du changement de mot de passe' });
    }
  }
);

// Improved verifyAuth thunk
export const verifyAuth = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log("Token check:", !!token);
      
      // If no token exists, authentication fails - but don't log it repeatedly
      if (!token) {
        // Return a rejection but with a clear non-error status to prevent loops
        return rejectWithValue({ 
          error: 'No authentication token found',
          noToken: true // Flag to indicate this is an expected condition
        });
      }
      
      // Try to parse user from localStorage
      let user = null;
      try {
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
      
      // Always verify with server to ensure token is valid
      try {
        console.log("Verifying token with server");
        const response = await authApi.verifyToken();
        
        if (response.valid) {
          // Use server user data if available, fallback to stored user
          const verifiedUser = response.user || user;
          
          // Update localStorage with fresh data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(verifiedUser));
          
          return { 
            user: verifiedUser,
            token 
          };
        } else {
          // Token invalid - clear storage
          console.log("Server reported token as invalid");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return rejectWithValue({ error: 'Session expirée ou invalide' });
        }
      } catch (apiError) {
        console.error('API error during token verification:', apiError);
        
        // If API call fails but we have user data, assume token is still valid
        // This allows offline/server-down scenarios to still work
        if (user) {
          console.log("Using cached credentials due to API error");
          return { user, token };
        }
        
        // No user data and API failed - authentication fails
        return rejectWithValue({ error: 'Impossible de vérifier la session' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      return rejectWithValue({ error: 'Erreur lors de la vérification de session' });
    }
  }
);

// Load initial state from localStorage
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  passwordChangeSuccess: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Clear state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Remove from localStorage directly
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordChangeSuccess: (state) => {
      state.passwordChangeSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        
        // Add a console log to verify token storage
        console.log('Saving token to localStorage:', action.payload.token);
        // Make sure these lines exist
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.error || 'Erreur lors de la connexion';
      })
      
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.passwordChangeSuccess = true;
        
        // Update user in state if first login
        if (state.user && state.user.isFirstLogin) {
          state.user.isFirstLogin = false;
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Erreur lors du changement de mot de passe';
        state.passwordChangeSuccess = false;
      })
      
      // Verify auth cases
      .addCase(verifyAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifyAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        
        // Only set error message if it's not a "no token" situation
        // This prevents showing error messages for expected conditions
        if (action.payload?.noToken) {
          state.error = null; // Clear any previous errors
        } else {
          state.error = action.payload?.error || 'Session expirée';
        }
      });
  }
});

export const { logout, clearError, clearPasswordChangeSuccess } = authSlice.actions;
export default authSlice.reducer;