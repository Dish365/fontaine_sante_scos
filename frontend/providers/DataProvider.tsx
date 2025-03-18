"use client";

import React, { createContext, useContext } from "react";
import type { Supplier, RawMaterial, Route, Warehouse } from "@/types/types";
import { useLocalData } from "@/hooks/useLocalData";

// Define the context shape
type DataContextType = {
  suppliers: Supplier[];
  rawMaterials: RawMaterial[];
  routes: Route[];
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
};

// Create context with default values
const DataContext = createContext<DataContextType>({
  suppliers: [],
  rawMaterials: [],
  routes: [],
  warehouses: [],
  isLoading: false,
  error: null,
});

// Hook to use the data context
export const useGlobalData = () => useContext(DataContext);

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  // Use the useLocalData hook to load data directly from JSON files
  const {
    suppliers,
    rawMaterials,
    routes,
    warehouses,
    loading: isLoading,
    error,
  } = useLocalData();

  // Context value
  const value = {
    suppliers,
    rawMaterials,
    routes,
    warehouses,
    isLoading,
    error,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
