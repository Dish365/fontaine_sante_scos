import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define types for user data
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "analyst" | "viewer";
  department: string;
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: {
      email: boolean;
      inApp: boolean;
      alerts: {
        quality: boolean;
        environmental: boolean;
        supplier: boolean;
      };
    };
    dashboardLayout: any; // This would be a more complex type in a real app
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const login = createAsyncThunk(
  "user/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.post('/auth/login', { email, password });
      // return response.data;

      // Mock login for now
      if (email === "admin@example.com" && password === "password") {
        return {
          user: mockUsers[0],
          token: "mock-jwt-token",
        };
      }

      throw new Error("Invalid credentials");
    } catch (error) {
      return rejectWithValue("Invalid email or password");
    }
  }
);

export const register = createAsyncThunk(
  "user/register",
  async (
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.post('/auth/register', userData);
      // return response.data;

      // Mock register for now
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: userData.email.split("@")[0],
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "viewer",
        department: "General",
        preferences: {
          theme: "system",
          notifications: {
            email: true,
            inApp: true,
            alerts: {
              quality: true,
              environmental: true,
              supplier: true,
            },
          },
          dashboardLayout: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        user: newUser,
        token: "mock-jwt-token",
      };
    } catch (error) {
      return rejectWithValue("Registration failed");
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call if needed
      // await api.post('/auth/logout');
      return true;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get('/auth/profile');
      // return response.data;

      // Mock profile fetch for now
      // In a real app, we would use the token to fetch the user profile
      return mockUsers[0];
    } catch (error) {
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData: Partial<User>, { getState, rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put('/auth/profile', userData);
      // return response.data;

      // Mock update for now
      return {
        ...mockUsers[0],
        ...userData,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue("Failed to update user profile");
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  "user/updatePreferences",
  async (
    preferences: Partial<User["preferences"]>,
    { getState, rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put('/auth/preferences', preferences);
      // return response.data;

      // Mock update for now
      const state = getState() as { user: AuthState };
      const currentUser = state.user.user;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      return {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ...preferences,
        },
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue("Failed to update user preferences");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;
export const userReducer = userSlice.reducer;

// Mock data for development
const mockUsers: User[] = [
  {
    id: "user_001",
    username: "admin",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    department: "Management",
    preferences: {
      theme: "system",
      notifications: {
        email: true,
        inApp: true,
        alerts: {
          quality: true,
          environmental: true,
          supplier: true,
        },
      },
      dashboardLayout: null,
    },
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-06-01T00:00:00Z",
  },
  {
    id: "user_002",
    username: "manager",
    email: "manager@example.com",
    firstName: "Manager",
    lastName: "User",
    role: "manager",
    department: "Operations",
    preferences: {
      theme: "light",
      notifications: {
        email: true,
        inApp: true,
        alerts: {
          quality: true,
          environmental: false,
          supplier: true,
        },
      },
      dashboardLayout: null,
    },
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-06-02T00:00:00Z",
  },
  {
    id: "user_003",
    username: "analyst",
    email: "analyst@example.com",
    firstName: "Analyst",
    lastName: "User",
    role: "analyst",
    department: "Quality Control",
    preferences: {
      theme: "dark",
      notifications: {
        email: false,
        inApp: true,
        alerts: {
          quality: true,
          environmental: true,
          supplier: false,
        },
      },
      dashboardLayout: null,
    },
    createdAt: "2023-01-03T00:00:00Z",
    updatedAt: "2023-06-03T00:00:00Z",
  },
];
