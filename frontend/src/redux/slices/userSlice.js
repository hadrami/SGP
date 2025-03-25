// src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "../../api/user.api";

const initialState = {
  users: [],
  currentUser: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunk pour récupérer la liste des utilisateurs
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await userApi.getUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Une erreur est survenue");
    }
  }
);

// Async thunk pour récupérer un utilisateur par son ID
export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Une erreur est survenue");
    }
  }
);

// Async thunk pour créer un utilisateur
export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userApi.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Une erreur est survenue");
    }
  }
);

// Async thunk pour mettre à jour un utilisateur
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser(id, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Une erreur est survenue");
    }
  }
);

// Async thunk pour supprimer un utilisateur
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await userApi.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Une erreur est survenue");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          "Erreur lors de la récupération des utilisateurs";
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          "Erreur lors de la récupération de l'utilisateur";
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          "Erreur lors de la création de l'utilisateur";
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          "Erreur lors de la mise à jour de l'utilisateur";
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.currentUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          "Erreur lors de la suppression de l'utilisateur";
      });
  },
});

export const { resetUserError, clearCurrentUser } = userSlice.actions;

export default userSlice.reducer;
