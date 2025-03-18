import { useState, useEffect } from "react";
import suppliersData from "@/data/suppliers.json";
import materialsData from "@/data/materials.json";
import routesData from "@/data/routes.json";
import warehousesData from "@/data/warehouses.json";
import economicMetricsData from "@/data/economic-metrics.json";
import supplierMaterialPricingData from "@/data/supplier-material-pricing.json";
import type { Supplier, RawMaterial, Route, Warehouse } from "@/types/types";
import {
  JsonSupplier,
  JsonRawMaterial,
  JsonRoute,
  JsonWarehouse,
  convertJsonToSupplier,
  convertJsonToRawMaterial,
  convertJsonToRoute,
  convertJsonToWarehouse,
  convertSupplierToJson,
  convertRawMaterialToJson,
} from "@/types/json-types";

// Types for economic metrics
interface Cost {
  month: string;
  amount: number;
}

interface EconomicMetrics {
  materialCosts: Cost[];
  transportationCosts: Cost[];
  storageCosts: Cost[];
}

// Types for supplier material pricing
interface MaterialPricing {
  supplierId: string;
  materialId: string;
  unitPrice: number;
  volume: number;
}

/**
 * Hook that loads and manages data directly from JSON files
 */
export function useLocalData() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [economicMetrics, setEconomicMetrics] =
    useState<EconomicMetrics | null>(null);
  const [supplierMaterialPricing, setSupplierMaterialPricing] = useState<
    MaterialPricing[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Function to load all data
  const loadData = async () => {
    try {
      setLoading(true);

      // Convert JSON data to app types
      const jsonSuppliers = suppliersData as unknown as JsonSupplier[];
      const jsonMaterials = materialsData as unknown as JsonRawMaterial[];
      const jsonRoutes = routesData as unknown as JsonRoute[];
      const jsonWarehouses = warehousesData as unknown as JsonWarehouse[];

      // Convert the data
      const convertedSuppliers = jsonSuppliers.map(convertJsonToSupplier);
      const convertedMaterials = jsonMaterials.map(convertJsonToRawMaterial);
      const convertedRoutes = jsonRoutes.map(convertJsonToRoute);
      const convertedWarehouses = jsonWarehouses.map(convertJsonToWarehouse);

      // Set the state
      setSuppliers(convertedSuppliers);
      setRawMaterials(convertedMaterials);
      setRoutes(convertedRoutes);
      setWarehouses(convertedWarehouses);
      setEconomicMetrics(economicMetricsData as EconomicMetrics);
      setSupplierMaterialPricing(
        supplierMaterialPricingData as MaterialPricing[]
      );

      console.log("Loaded data directly from JSON files");
    } catch (err) {
      console.error("Error loading data from JSON:", err);
      setError("Failed to load data from JSON files");
    } finally {
      setLoading(false);
    }
  };

  // Function to update a supplier
  const updateSupplier = async (updatedSupplier: Supplier) => {
    try {
      setLoading(true);
      // Update the suppliers array
      const updatedSuppliers = suppliers.map((s) =>
        s.id === updatedSupplier.id ? updatedSupplier : s
      );
      setSuppliers(updatedSuppliers);

      // Here you would typically save to the JSON file
      // For now, we'll just update the state
      console.log("Updated supplier:", updatedSupplier);

      return updatedSupplier;
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to update a material
  const updateMaterial = async (updatedMaterial: RawMaterial) => {
    try {
      setLoading(true);
      // Update the materials array
      const updatedMaterials = rawMaterials.map((m) =>
        m.id === updatedMaterial.id ? updatedMaterial : m
      );
      setRawMaterials(updatedMaterials);

      // Here you would typically save to the JSON file
      // For now, we'll just update the state
      console.log("Updated material:", updatedMaterial);

      return updatedMaterial;
    } catch (error) {
      console.error("Error updating material:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    suppliers,
    rawMaterials,
    routes,
    warehouses,
    economicMetrics,
    supplierMaterialPricing,
    loading,
    error,
    updateSupplier,
    updateMaterial,
  };
}
