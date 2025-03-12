import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define types for environmental data
export interface EnvironmentalMetric {
  id: string;
  name: string;
  category: "carbon" | "water" | "land" | "waste" | "energy" | "toxicity";
  description: string;
  unit: string;
  value: number;
  baseline: number;
  target: number;
  trend: "increasing" | "decreasing" | "stable";
  impactLevel: "high" | "medium" | "low";
  relatedMaterials: string[]; // IDs of related materials
  relatedSuppliers: string[]; // IDs of related suppliers
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface EnvironmentalState {
  metrics: EnvironmentalMetric[];
  selectedMetric: EnvironmentalMetric | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    impactLevel: string | null;
    timeRange: {
      start: string | null;
      end: string | null;
    };
  };
}

const initialState: EnvironmentalState = {
  metrics: [],
  selectedMetric: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    impactLevel: null,
    timeRange: {
      start: null,
      end: null,
    },
  },
};

// Async thunks for API calls
export const fetchEnvironmentalMetrics = createAsyncThunk(
  "environmental/fetchMetrics",
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get('/environmental-metrics');
      // return response.data;

      // Mock data for now
      return mockEnvironmentalMetrics;
    } catch (error) {
      return rejectWithValue("Failed to fetch environmental metrics");
    }
  }
);

export const fetchEnvironmentalMetricById = createAsyncThunk(
  "environmental/fetchMetricById",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get(`/environmental-metrics/${id}`);
      // return response.data;

      // Mock data for now
      return mockEnvironmentalMetrics.find((metric) => metric.id === id);
    } catch (error) {
      return rejectWithValue(
        `Failed to fetch environmental metric with ID: ${id}`
      );
    }
  }
);

export const createEnvironmentalMetric = createAsyncThunk(
  "environmental/createMetric",
  async (
    metricData: Omit<EnvironmentalMetric, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.post('/environmental-metrics', metricData);
      // return response.data;

      // Mock data for now
      const newMetric: EnvironmentalMetric = {
        ...metricData,
        id: `env_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newMetric;
    } catch (error) {
      return rejectWithValue("Failed to create environmental metric");
    }
  }
);

export const updateEnvironmentalMetric = createAsyncThunk(
  "environmental/updateMetric",
  async (
    { id, data }: { id: string; data: Partial<EnvironmentalMetric> },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put(`/environmental-metrics/${id}`, data);
      // return response.data;

      // Mock update for now
      return { id, ...data, updatedAt: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(
        `Failed to update environmental metric with ID: ${id}`
      );
    }
  }
);

export const deleteEnvironmentalMetric = createAsyncThunk(
  "environmental/deleteMetric",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // await api.delete(`/environmental-metrics/${id}`);
      // return id;

      // Mock delete for now
      return id;
    } catch (error) {
      return rejectWithValue(
        `Failed to delete environmental metric with ID: ${id}`
      );
    }
  }
);

const environmentalSlice = createSlice({
  name: "environmental",
  initialState,
  reducers: {
    setSelectedMetric: (
      state,
      action: PayloadAction<EnvironmentalMetric | null>
    ) => {
      state.selectedMetric = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setImpactLevelFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.impactLevel = action.payload;
    },
    setTimeRangeFilter: (
      state,
      action: PayloadAction<{ start: string | null; end: string | null }>
    ) => {
      state.filters.timeRange = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearEnvironmentalError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all metrics
      .addCase(fetchEnvironmentalMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnvironmentalMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchEnvironmentalMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch metric by ID
      .addCase(fetchEnvironmentalMetricById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnvironmentalMetricById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMetric = action.payload as EnvironmentalMetric;
      })
      .addCase(fetchEnvironmentalMetricById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create metric
      .addCase(createEnvironmentalMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnvironmentalMetric.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics.push(action.payload);
      })
      .addCase(createEnvironmentalMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update metric
      .addCase(updateEnvironmentalMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnvironmentalMetric.fulfilled, (state, action) => {
        state.loading = false;
        const { id, ...updatedData } = action.payload;
        const index = state.metrics.findIndex((metric) => metric.id === id);
        if (index !== -1) {
          state.metrics[index] = { ...state.metrics[index], ...updatedData };
          if (state.selectedMetric?.id === id) {
            state.selectedMetric = { ...state.selectedMetric, ...updatedData };
          }
        }
      })
      .addCase(updateEnvironmentalMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete metric
      .addCase(deleteEnvironmentalMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEnvironmentalMetric.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = state.metrics.filter(
          (metric) => metric.id !== action.payload
        );
        if (state.selectedMetric?.id === action.payload) {
          state.selectedMetric = null;
        }
      })
      .addCase(deleteEnvironmentalMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedMetric,
  setCategoryFilter,
  setImpactLevelFilter,
  setTimeRangeFilter,
  clearFilters,
  clearEnvironmentalError,
} = environmentalSlice.actions;
export const environmentalReducer = environmentalSlice.reducer;

// Mock data for development
const mockEnvironmentalMetrics: EnvironmentalMetric[] = [
  {
    id: "env_001",
    name: "Carbon Footprint",
    category: "carbon",
    description: "Total greenhouse gas emissions measured in CO2 equivalent",
    unit: "kg CO2e",
    value: 1250,
    baseline: 1500,
    target: 1000,
    trend: "decreasing",
    impactLevel: "high",
    relatedMaterials: ["mat_001", "mat_002", "mat_003"],
    relatedSuppliers: ["sup_001", "sup_002", "sup_003"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-15T09:30:00Z",
    updatedAt: "2023-06-15T14:45:00Z",
  },
  {
    id: "env_002",
    name: "Water Usage",
    category: "water",
    description: "Total water consumption across the supply chain",
    unit: "kiloliters",
    value: 3200,
    baseline: 3500,
    target: 2800,
    trend: "decreasing",
    impactLevel: "medium",
    relatedMaterials: ["mat_001", "mat_002"],
    relatedSuppliers: ["sup_001", "sup_003"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-16T10:15:00Z",
    updatedAt: "2023-06-16T11:30:00Z",
  },
  {
    id: "env_003",
    name: "Land Use",
    category: "land",
    description: "Total land area used for production",
    unit: "hectares",
    value: 45,
    baseline: 50,
    target: 40,
    trend: "stable",
    impactLevel: "medium",
    relatedMaterials: ["mat_001", "mat_003"],
    relatedSuppliers: ["sup_002"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-17T08:45:00Z",
    updatedAt: "2023-06-17T15:20:00Z",
  },
  {
    id: "env_004",
    name: "Waste Generation",
    category: "waste",
    description: "Total waste produced in the supply chain",
    unit: "metric tons",
    value: 18.5,
    baseline: 25,
    target: 15,
    trend: "decreasing",
    impactLevel: "medium",
    relatedMaterials: ["mat_001", "mat_002", "mat_003"],
    relatedSuppliers: ["sup_001", "sup_002", "sup_003"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-18T11:30:00Z",
    updatedAt: "2023-06-18T09:15:00Z",
  },
  {
    id: "env_005",
    name: "Energy Consumption",
    category: "energy",
    description: "Total energy used across the supply chain",
    unit: "MWh",
    value: 850,
    baseline: 900,
    target: 750,
    trend: "decreasing",
    impactLevel: "high",
    relatedMaterials: ["mat_002", "mat_003"],
    relatedSuppliers: ["sup_001", "sup_003"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-19T14:20:00Z",
    updatedAt: "2023-06-19T10:45:00Z",
  },
];
