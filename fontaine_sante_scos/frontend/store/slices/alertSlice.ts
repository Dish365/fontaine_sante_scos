import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define types for alert data
export interface Alert {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "error" | "success";
  severity: "low" | "medium" | "high";
  category: "quality" | "environmental" | "supplier" | "system";
  isRead: boolean;
  isResolved: boolean;
  relatedEntityId?: string; // ID of related entity (supplier, material, etc.)
  relatedEntityType?: string; // Type of related entity
  createdAt: string;
  updatedAt: string;
}

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: {
    type: string | null;
    severity: string | null;
    category: string | null;
    isRead: boolean | null;
    isResolved: boolean | null;
  };
}

const initialState: AlertState = {
  alerts: [],
  unreadCount: 0,
  loading: false,
  error: null,
  filters: {
    type: null,
    severity: null,
    category: null,
    isRead: null,
    isResolved: null,
  },
};

// Async thunks for API calls
export const fetchAlerts = createAsyncThunk(
  "alert/fetchAlerts",
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get('/alerts');
      // return response.data;

      // Mock data for now
      return mockAlerts;
    } catch (error) {
      return rejectWithValue("Failed to fetch alerts");
    }
  }
);

export const markAlertAsRead = createAsyncThunk(
  "alert/markAsRead",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put(`/alerts/${id}/read`);
      // return response.data;

      // Mock update for now
      return {
        id,
        isRead: true,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(`Failed to mark alert with ID: ${id} as read`);
    }
  }
);

export const markAllAlertsAsRead = createAsyncThunk(
  "alert/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put('/alerts/read-all');
      // return response.data;

      // Mock update for now
      return true;
    } catch (error) {
      return rejectWithValue("Failed to mark all alerts as read");
    }
  }
);

export const resolveAlert = createAsyncThunk(
  "alert/resolve",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put(`/alerts/${id}/resolve`);
      // return response.data;

      // Mock update for now
      return {
        id,
        isResolved: true,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(`Failed to resolve alert with ID: ${id}`);
    }
  }
);

export const deleteAlert = createAsyncThunk(
  "alert/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // await api.delete(`/alerts/${id}`);
      // return id;

      // Mock delete for now
      return id;
    } catch (error) {
      return rejectWithValue(`Failed to delete alert with ID: ${id}`);
    }
  }
);

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    addAlert: (
      state,
      action: PayloadAction<Omit<Alert, "id" | "createdAt" | "updatedAt">>
    ) => {
      const newAlert: Alert = {
        ...action.payload,
        id: `alert_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.alerts.unshift(newAlert);
      if (!newAlert.isRead) {
        state.unreadCount += 1;
      }
    },
    setTypeFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.type = action.payload;
    },
    setSeverityFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.severity = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setIsReadFilter: (state, action: PayloadAction<boolean | null>) => {
      state.filters.isRead = action.payload;
    },
    setIsResolvedFilter: (state, action: PayloadAction<boolean | null>) => {
      state.filters.isResolved = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearAlertError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
        state.unreadCount = action.payload.filter(
          (alert: Alert) => !alert.isRead
        ).length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark as read
      .addCase(markAlertAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAlertAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const { id, isRead, updatedAt } = action.payload;
        const index = state.alerts.findIndex((alert) => alert.id === id);
        if (index !== -1) {
          const wasUnread = !state.alerts[index].isRead;
          state.alerts[index].isRead = isRead;
          state.alerts[index].updatedAt = updatedAt;
          if (wasUnread && isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      .addCase(markAlertAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark all as read
      .addCase(markAllAlertsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAlertsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.alerts = state.alerts.map((alert) => ({
          ...alert,
          isRead: true,
          updatedAt: new Date().toISOString(),
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAlertsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Resolve alert
      .addCase(resolveAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        state.loading = false;
        const { id, isResolved, updatedAt } = action.payload;
        const index = state.alerts.findIndex((alert) => alert.id === id);
        if (index !== -1) {
          state.alerts[index].isResolved = isResolved;
          state.alerts[index].updatedAt = updatedAt;
        }
      })
      .addCase(resolveAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete alert
      .addCase(deleteAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.loading = false;
        const deletedAlert = state.alerts.find(
          (alert) => alert.id === action.payload
        );
        state.alerts = state.alerts.filter(
          (alert) => alert.id !== action.payload
        );
        if (deletedAlert && !deletedAlert.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addAlert,
  setTypeFilter,
  setSeverityFilter,
  setCategoryFilter,
  setIsReadFilter,
  setIsResolvedFilter,
  clearFilters,
  clearAlertError,
} = alertSlice.actions;
export const alertReducer = alertSlice.reducer;

// Mock data for development
const mockAlerts: Alert[] = [
  {
    id: "alert_001",
    title: "Quality Threshold Exceeded",
    description:
      "Freshness score for Organic Tomatoes has fallen below acceptable threshold.",
    type: "warning",
    severity: "high",
    category: "quality",
    isRead: false,
    isResolved: false,
    relatedEntityId: "mat_001",
    relatedEntityType: "material",
    createdAt: "2023-06-15T09:30:00Z",
    updatedAt: "2023-06-15T09:30:00Z",
  },
  {
    id: "alert_002",
    title: "New Supplier Added",
    description:
      'A new supplier "Organic Farms Co." has been added to the system.',
    type: "info",
    severity: "low",
    category: "supplier",
    isRead: true,
    isResolved: true,
    relatedEntityId: "sup_004",
    relatedEntityType: "supplier",
    createdAt: "2023-06-14T14:45:00Z",
    updatedAt: "2023-06-14T15:20:00Z",
  },
  {
    id: "alert_003",
    title: "Carbon Footprint Reduction",
    description:
      "Monthly carbon footprint has decreased by 12% compared to previous month.",
    type: "success",
    severity: "medium",
    category: "environmental",
    isRead: false,
    isResolved: false,
    relatedEntityId: "env_001",
    relatedEntityType: "environmental_metric",
    createdAt: "2023-06-13T11:15:00Z",
    updatedAt: "2023-06-13T11:15:00Z",
  },
  {
    id: "alert_004",
    title: "System Maintenance",
    description:
      "Scheduled system maintenance will occur on June 20th at 02:00 UTC.",
    type: "info",
    severity: "medium",
    category: "system",
    isRead: true,
    isResolved: false,
    createdAt: "2023-06-12T08:30:00Z",
    updatedAt: "2023-06-12T10:45:00Z",
  },
  {
    id: "alert_005",
    title: "Supplier Delivery Delay",
    description:
      "Fresh Harvest Co. has reported a 2-day delay in upcoming deliveries.",
    type: "warning",
    severity: "medium",
    category: "supplier",
    isRead: false,
    isResolved: false,
    relatedEntityId: "sup_002",
    relatedEntityType: "supplier",
    createdAt: "2023-06-11T16:20:00Z",
    updatedAt: "2023-06-11T16:20:00Z",
  },
];
