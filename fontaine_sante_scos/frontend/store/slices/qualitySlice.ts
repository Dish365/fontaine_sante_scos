import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define types for quality data
export interface QualityMetric {
  id: string;
  name: string;
  category: "physical" | "chemical" | "microbiological" | "sensory" | "other";
  description: string;
  unit: string;
  value: number;
  acceptableRange: {
    min: number;
    max: number;
  };
  target: number;
  trend: "improving" | "declining" | "stable";
  criticalityLevel: "critical" | "major" | "minor";
  relatedMaterials: string[]; // IDs of related materials
  relatedSuppliers: string[]; // IDs of related suppliers
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface QualityState {
  metrics: QualityMetric[];
  selectedMetric: QualityMetric | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    criticalityLevel: string | null;
    timeRange: {
      start: string | null;
      end: string | null;
    };
  };
}

const initialState: QualityState = {
  metrics: [],
  selectedMetric: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    criticalityLevel: null,
    timeRange: {
      start: null,
      end: null,
    },
  },
};

// Async thunks for API calls
export const fetchQualityMetrics = createAsyncThunk(
  "quality/fetchMetrics",
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get('/quality-metrics');
      // return response.data;

      // Mock data for now
      return mockQualityMetrics;
    } catch (error) {
      return rejectWithValue("Failed to fetch quality metrics");
    }
  }
);

export const fetchQualityMetricById = createAsyncThunk(
  "quality/fetchMetricById",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get(`/quality-metrics/${id}`);
      // return response.data;

      // Mock data for now
      return mockQualityMetrics.find((metric) => metric.id === id);
    } catch (error) {
      return rejectWithValue(`Failed to fetch quality metric with ID: ${id}`);
    }
  }
);

export const createQualityMetric = createAsyncThunk(
  "quality/createMetric",
  async (
    metricData: Omit<QualityMetric, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.post('/quality-metrics', metricData);
      // return response.data;

      // Mock data for now
      const newMetric: QualityMetric = {
        ...metricData,
        id: `qual_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newMetric;
    } catch (error) {
      return rejectWithValue("Failed to create quality metric");
    }
  }
);

export const updateQualityMetric = createAsyncThunk(
  "quality/updateMetric",
  async (
    { id, data }: { id: string; data: Partial<QualityMetric> },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put(`/quality-metrics/${id}`, data);
      // return response.data;

      // Mock update for now
      return { id, ...data, updatedAt: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(`Failed to update quality metric with ID: ${id}`);
    }
  }
);

export const deleteQualityMetric = createAsyncThunk(
  "quality/deleteMetric",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // await api.delete(`/quality-metrics/${id}`);
      // return id;

      // Mock delete for now
      return id;
    } catch (error) {
      return rejectWithValue(`Failed to delete quality metric with ID: ${id}`);
    }
  }
);

const qualitySlice = createSlice({
  name: "quality",
  initialState,
  reducers: {
    setSelectedMetric: (state, action: PayloadAction<QualityMetric | null>) => {
      state.selectedMetric = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setCriticalityLevelFilter: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.filters.criticalityLevel = action.payload;
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
    clearQualityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all metrics
      .addCase(fetchQualityMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQualityMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchQualityMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch metric by ID
      .addCase(fetchQualityMetricById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQualityMetricById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMetric = action.payload as QualityMetric;
      })
      .addCase(fetchQualityMetricById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create metric
      .addCase(createQualityMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQualityMetric.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics.push(action.payload);
      })
      .addCase(createQualityMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update metric
      .addCase(updateQualityMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQualityMetric.fulfilled, (state, action) => {
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
      .addCase(updateQualityMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete metric
      .addCase(deleteQualityMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQualityMetric.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = state.metrics.filter(
          (metric) => metric.id !== action.payload
        );
        if (state.selectedMetric?.id === action.payload) {
          state.selectedMetric = null;
        }
      })
      .addCase(deleteQualityMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedMetric,
  setCategoryFilter,
  setCriticalityLevelFilter,
  setTimeRangeFilter,
  clearFilters,
  clearQualityError,
} = qualitySlice.actions;
export const qualityReducer = qualitySlice.reducer;

// Mock data for development
const mockQualityMetrics: QualityMetric[] = [
  {
    id: "qual_001",
    name: "Freshness Score",
    category: "physical",
    description: "Overall freshness assessment of produce",
    unit: "score",
    value: 92,
    acceptableRange: {
      min: 85,
      max: 100,
    },
    target: 95,
    trend: "improving",
    criticalityLevel: "critical",
    relatedMaterials: ["mat_001", "mat_002", "mat_003"],
    relatedSuppliers: ["sup_001", "sup_002"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-20T09:15:00Z",
    updatedAt: "2023-06-20T14:30:00Z",
  },
  {
    id: "qual_002",
    name: "Color Consistency",
    category: "sensory",
    description: "Consistency of color across produce batch",
    unit: "score",
    value: 88,
    acceptableRange: {
      min: 80,
      max: 100,
    },
    target: 90,
    trend: "stable",
    criticalityLevel: "major",
    relatedMaterials: ["mat_001", "mat_003"],
    relatedSuppliers: ["sup_001", "sup_003"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-21T10:45:00Z",
    updatedAt: "2023-06-21T11:20:00Z",
  },
  {
    id: "qual_003",
    name: "Pesticide Residue",
    category: "chemical",
    description: "Level of pesticide residue detected",
    unit: "ppm",
    value: 0.05,
    acceptableRange: {
      min: 0,
      max: 0.1,
    },
    target: 0.03,
    trend: "declining",
    criticalityLevel: "critical",
    relatedMaterials: ["mat_001", "mat_002"],
    relatedSuppliers: ["sup_002", "sup_003"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-22T08:30:00Z",
    updatedAt: "2023-06-22T15:45:00Z",
  },
  {
    id: "qual_004",
    name: "Bacterial Count",
    category: "microbiological",
    description: "Total bacterial count in sample",
    unit: "CFU/g",
    value: 1500,
    acceptableRange: {
      min: 0,
      max: 5000,
    },
    target: 1000,
    trend: "stable",
    criticalityLevel: "critical",
    relatedMaterials: ["mat_002", "mat_003"],
    relatedSuppliers: ["sup_001", "sup_002"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-23T11:15:00Z",
    updatedAt: "2023-06-23T09:30:00Z",
  },
  {
    id: "qual_005",
    name: "Size Uniformity",
    category: "physical",
    description: "Consistency of size across produce batch",
    unit: "score",
    value: 85,
    acceptableRange: {
      min: 75,
      max: 100,
    },
    target: 90,
    trend: "improving",
    criticalityLevel: "minor",
    relatedMaterials: ["mat_001", "mat_003"],
    relatedSuppliers: ["sup_001", "sup_003"],
    timestamp: "2023-06-01T00:00:00Z",
    createdAt: "2023-01-24T14:45:00Z",
    updatedAt: "2023-06-24T10:15:00Z",
  },
];
