import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define types for supplier data
export interface Supplier {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contactInfo: {
    email: string;
    phone: string;
    contactPerson: string;
  };
  certifications: string[];
  materials: string[]; // IDs of materials supplied
  performanceMetrics: {
    qualityScore: number;
    deliveryScore: number;
    sustainabilityScore: number;
    riskScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface SupplierState {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  selectedSupplier: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchSuppliers = createAsyncThunk(
  "supplier/fetchSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get('/suppliers');
      // return response.data;

      // Mock data for now
      return mockSuppliers;
    } catch (error) {
      return rejectWithValue("Failed to fetch suppliers");
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  "supplier/fetchSupplierById",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.get(`/suppliers/${id}`);
      // return response.data;

      // Mock data for now
      return mockSuppliers.find((supplier) => supplier.id === id);
    } catch (error) {
      return rejectWithValue(`Failed to fetch supplier with ID: ${id}`);
    }
  }
);

export const createSupplier = createAsyncThunk(
  "supplier/createSupplier",
  async (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.post('/suppliers', supplierData);
      // return response.data;

      // Mock data for now
      const newSupplier: Supplier = {
        ...supplierData,
        id: `sup_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newSupplier;
    } catch (error) {
      return rejectWithValue("Failed to create supplier");
    }
  }
);

export const updateSupplier = createAsyncThunk(
  "supplier/updateSupplier",
  async (
    { id, data }: { id: string; data: Partial<Supplier> },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with an actual API call
      // const response = await api.put(`/suppliers/${id}`, data);
      // return response.data;

      // Mock update for now
      return { id, ...data, updatedAt: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(`Failed to update supplier with ID: ${id}`);
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "supplier/deleteSupplier",
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      // await api.delete(`/suppliers/${id}`);
      // return id;

      // Mock delete for now
      return id;
    } catch (error) {
      return rejectWithValue(`Failed to delete supplier with ID: ${id}`);
    }
  }
);

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload;
    },
    clearSupplierError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch supplier by ID
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSupplier = action.payload as Supplier;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const { id, ...updatedData } = action.payload;
        const index = state.suppliers.findIndex(
          (supplier) => supplier.id === id
        );
        if (index !== -1) {
          state.suppliers[index] = {
            ...state.suppliers[index],
            ...updatedData,
          };
          if (state.selectedSupplier?.id === id) {
            state.selectedSupplier = {
              ...state.selectedSupplier,
              ...updatedData,
            };
          }
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(
          (supplier) => supplier.id !== action.payload
        );
        if (state.selectedSupplier?.id === action.payload) {
          state.selectedSupplier = null;
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedSupplier, clearSupplierError } =
  supplierSlice.actions;
export const supplierReducer = supplierSlice.reducer;

// Mock data for development
const mockSuppliers: Supplier[] = [
  {
    id: "sup_001",
    name: "EcoFarm Produce",
    location: {
      address: "123 Green Valley Road",
      city: "Montreal",
      country: "Canada",
      coordinates: {
        lat: 45.5017,
        lng: -73.5673,
      },
    },
    contactInfo: {
      email: "contact@ecofarm.com",
      phone: "+1-514-555-1234",
      contactPerson: "Jean Tremblay",
    },
    certifications: ["Organic", "Non-GMO", "Fair Trade"],
    materials: ["mat_001", "mat_002"],
    performanceMetrics: {
      qualityScore: 92,
      deliveryScore: 88,
      sustainabilityScore: 95,
      riskScore: 15,
    },
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-06-22T14:45:00Z",
  },
  {
    id: "sup_002",
    name: "Fresh Harvest Co.",
    location: {
      address: "456 Farm Road",
      city: "Quebec City",
      country: "Canada",
      coordinates: {
        lat: 46.8139,
        lng: -71.2082,
      },
    },
    contactInfo: {
      email: "info@freshharvest.com",
      phone: "+1-418-555-6789",
      contactPerson: "Marie Dubois",
    },
    certifications: ["Organic", "Local Sourced"],
    materials: ["mat_003", "mat_004"],
    performanceMetrics: {
      qualityScore: 87,
      deliveryScore: 92,
      sustainabilityScore: 82,
      riskScore: 22,
    },
    createdAt: "2023-02-10T10:15:00Z",
    updatedAt: "2023-07-05T09:30:00Z",
  },
  {
    id: "sup_003",
    name: "Green Fields Suppliers",
    location: {
      address: "789 Nature Blvd",
      city: "Toronto",
      country: "Canada",
      coordinates: {
        lat: 43.6532,
        lng: -79.3832,
      },
    },
    contactInfo: {
      email: "support@greenfields.com",
      phone: "+1-416-555-9012",
      contactPerson: "David Smith",
    },
    certifications: ["Sustainable Farming", "Carbon Neutral"],
    materials: ["mat_002", "mat_005"],
    performanceMetrics: {
      qualityScore: 90,
      deliveryScore: 85,
      sustainabilityScore: 93,
      riskScore: 18,
    },
    createdAt: "2023-03-05T11:45:00Z",
    updatedAt: "2023-08-12T16:20:00Z",
  },
];
