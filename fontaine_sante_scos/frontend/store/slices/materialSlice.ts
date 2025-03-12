import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define types for material data
export interface Material {
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: {
    [key: string]: string | number;
  };
  suppliers: string[]; // IDs of suppliers providing this material
  sustainabilityMetrics: {
    carbonFootprint: number; // kg CO2e per unit
    waterUsage: number; // liters per unit
    landUse: number; // m² per unit
    wasteGeneration: number; // kg per unit
  };
  qualityMetrics: {
    acceptableRange: {
      min: number;
      max: number;
    };
    currentAverage: number;
    unitOfMeasure: string;
  };
  economicData: {
    costPerUnit: number;
    currency: string;
    annualVolume: number;
    volumeUnit: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MaterialState {
  materials: Material[];
  selectedMaterial: Material | null;
  loading: boolean;
  error: string | null;
}

const initialState: MaterialState = {
  materials: [],
  selectedMaterial: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchMaterials = createAsyncThunk(
  "material/fetchMaterials",
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get('/materials');
      // return response.data;

      // Mock data for now
      return mockMaterials;
    } catch (error) {
      return rejectWithValue("Failed to fetch materials");
    }
  }
);

export const fetchMaterialById = createAsyncThunk(
  "material/fetchMaterialById",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get(`/materials/${id}`);
      // return response.data;

      // Mock data for now
      return mockMaterials.find((material) => material.id === id);
    } catch (error) {
      return rejectWithValue(`Failed to fetch material with ID: ${id}`);
    }
  }
);

export const createMaterial = createAsyncThunk(
  "material/createMaterial",
  async (
    materialData: Omit<Material, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.post('/materials', materialData);
      // return response.data;

      // Mock data for now
      const newMaterial: Material = {
        ...materialData,
        id: `mat_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newMaterial;
    } catch (error) {
      return rejectWithValue("Failed to create material");
    }
  }
);

export const updateMaterial = createAsyncThunk(
  "material/updateMaterial",
  async (
    { id, data }: { id: string; data: Partial<Material> },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put(`/materials/${id}`, data);
      // return response.data;

      // Mock update for now
      return { id, ...data, updatedAt: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(`Failed to update material with ID: ${id}`);
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  "material/deleteMaterial",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // await api.delete(`/materials/${id}`);
      // return id;

      // Mock delete for now
      return id;
    } catch (error) {
      return rejectWithValue(`Failed to delete material with ID: ${id}`);
    }
  }
);

const materialSlice = createSlice({
  name: "material",
  initialState,
  reducers: {
    setSelectedMaterial: (state, action: PayloadAction<Material | null>) => {
      state.selectedMaterial = action.payload;
    },
    clearMaterialError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all materials
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch material by ID
      .addCase(fetchMaterialById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMaterial = action.payload as Material;
      })
      .addCase(fetchMaterialById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create material
      .addCase(createMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials.push(action.payload);
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update material
      .addCase(updateMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const { id, ...updatedData } = action.payload;
        const index = state.materials.findIndex(
          (material) => material.id === id
        );
        if (index !== -1) {
          state.materials[index] = {
            ...state.materials[index],
            ...updatedData,
          };
          if (state.selectedMaterial?.id === id) {
            state.selectedMaterial = {
              ...state.selectedMaterial,
              ...updatedData,
            };
          }
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete material
      .addCase(deleteMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = state.materials.filter(
          (material) => material.id !== action.payload
        );
        if (state.selectedMaterial?.id === action.payload) {
          state.selectedMaterial = null;
        }
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedMaterial, clearMaterialError } =
  materialSlice.actions;
export const materialReducer = materialSlice.reducer;

// Mock data for development
const mockMaterials: Material[] = [
  {
    id: "mat_001",
    name: "Organic Tomatoes",
    category: "Vegetables",
    description: "Fresh organic tomatoes grown without pesticides",
    specifications: {
      size: "Medium",
      color: "Red",
      ripeness: "Fully ripe",
      variety: "Roma",
    },
    suppliers: ["sup_001", "sup_003"],
    sustainabilityMetrics: {
      carbonFootprint: 0.45, // kg CO2e per kg
      waterUsage: 214, // liters per kg
      landUse: 0.3, // m² per kg
      wasteGeneration: 0.05, // kg per kg
    },
    qualityMetrics: {
      acceptableRange: {
        min: 85,
        max: 100,
      },
      currentAverage: 92,
      unitOfMeasure: "Quality Score",
    },
    economicData: {
      costPerUnit: 2.45,
      currency: "CAD",
      annualVolume: 25000,
      volumeUnit: "kg",
    },
    createdAt: "2023-01-10T09:30:00Z",
    updatedAt: "2023-06-15T11:20:00Z",
  },
  {
    id: "mat_002",
    name: "Organic Spinach",
    category: "Leafy Greens",
    description: "Fresh organic spinach leaves",
    specifications: {
      size: "Standard",
      color: "Dark Green",
      freshness: "Harvested within 24 hours",
      variety: "Baby Spinach",
    },
    suppliers: ["sup_001", "sup_003"],
    sustainabilityMetrics: {
      carbonFootprint: 0.3, // kg CO2e per kg
      waterUsage: 158, // liters per kg
      landUse: 0.2, // m² per kg
      wasteGeneration: 0.03, // kg per kg
    },
    qualityMetrics: {
      acceptableRange: {
        min: 90,
        max: 100,
      },
      currentAverage: 95,
      unitOfMeasure: "Quality Score",
    },
    economicData: {
      costPerUnit: 3.75,
      currency: "CAD",
      annualVolume: 18000,
      volumeUnit: "kg",
    },
    createdAt: "2023-01-12T10:45:00Z",
    updatedAt: "2023-06-18T14:30:00Z",
  },
  {
    id: "mat_003",
    name: "Organic Carrots",
    category: "Root Vegetables",
    description: "Fresh organic carrots",
    specifications: {
      size: "Medium to Large",
      color: "Orange",
      freshness: "Harvested within 48 hours",
      variety: "Nantes",
    },
    suppliers: ["sup_002"],
    sustainabilityMetrics: {
      carbonFootprint: 0.2, // kg CO2e per kg
      waterUsage: 195, // liters per kg
      landUse: 0.25, // m² per kg
      wasteGeneration: 0.04, // kg per kg
    },
    qualityMetrics: {
      acceptableRange: {
        min: 85,
        max: 100,
      },
      currentAverage: 90,
      unitOfMeasure: "Quality Score",
    },
    economicData: {
      costPerUnit: 1.95,
      currency: "CAD",
      annualVolume: 30000,
      volumeUnit: "kg",
    },
    createdAt: "2023-01-15T08:15:00Z",
    updatedAt: "2023-06-20T09:45:00Z",
  },
];
