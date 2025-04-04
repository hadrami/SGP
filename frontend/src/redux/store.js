// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import militaireReducer from './slices/militaireSlice';
import institutReducer from './slices/institutSlice'; 
import uniteReducer from './slices/uniteSlice'; 
import documentsReducer from './slices/documentSlice';

// Create and configure the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    militaires: militaireReducer,
    instituts: institutReducer,
    documents: documentsReducer,
    unites: uniteReducer,  // Add this line  // Make sure this is added to the store
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/verify/rejected'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.error', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.error'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;