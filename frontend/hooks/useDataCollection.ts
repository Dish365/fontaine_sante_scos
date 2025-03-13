import { useRawMaterials } from "./useRawMaterials";
import { useSuppliers } from "./useSuppliers";
import { useRoutes } from "./useRoutes";
import { useState, useEffect } from "react";

/**
 * A hook that combines raw materials, suppliers, and routes
 * Provides a single interface for working with the supply chain database
 */
export function useDataCollection() {
  // Get the individual hooks
  const rawMaterialsHook = useRawMaterials();
  const suppliersHook = useSuppliers();
  const routesHook = useRoutes();

  // Combine error states
  const [error, setError] = useState<string | null>(null);

  // Update error state if any hook has an error
  useEffect(() => {
    if (rawMaterialsHook.error) {
      setError(rawMaterialsHook.error);
    } else if (suppliersHook.error) {
      setError(suppliersHook.error);
    } else if (routesHook.error) {
      setError(routesHook.error);
    } else {
      setError(null);
    }
  }, [rawMaterialsHook.error, suppliersHook.error, routesHook.error]);

  // Return combined hooks
  return {
    // Raw Materials
    rawMaterials: rawMaterialsHook.rawMaterials,
    loadingRawMaterials: rawMaterialsHook.loading,
    addRawMaterial: rawMaterialsHook.addRawMaterial,
    updateRawMaterial: rawMaterialsHook.updateRawMaterial,
    associateSuppliersWithMaterial:
      rawMaterialsHook.associateSuppliersWithMaterial,
    getMaterialsBySupplier: rawMaterialsHook.getMaterialsBySupplier,

    // Suppliers
    suppliers: suppliersHook.suppliers,
    loadingSuppliers: suppliersHook.loading,
    loadSuppliers: suppliersHook.loadSuppliers,
    addSupplier: suppliersHook.addSupplier,
    getSupplierById: suppliersHook.getSupplierById,
    updateSupplier: suppliersHook.updateSupplier,
    deleteSupplier: suppliersHook.deleteSupplier,
    getSuppliersByMaterial: suppliersHook.getSuppliersByMaterial,
    getSuppliersByCertification: suppliersHook.getSuppliersByCertification,
    getSuppliersByTransportMode: suppliersHook.getSuppliersByTransportMode,
    associateSupplierWithMaterials:
      suppliersHook.associateSupplierWithMaterials,
    disassociateSupplierFromMaterial:
      suppliersHook.disassociateSupplierFromMaterial,
    exportSuppliersToJson: suppliersHook.exportSuppliersToJson,

    // Routes
    routes: routesHook.routes,
    loadingRoutes: routesHook.loading,
    addRoute: routesHook.addRoute,
    updateRoute: routesHook.updateRoute,
    getRoutesByWarehouse: routesHook.getRoutesByWarehouse,
    getRoutesBySupplier: routesHook.getRoutesBySupplier,
    getRoutesByTransportMode: routesHook.getRoutesByTransportMode,
    calculateTotalEnvironmentalImpact:
      routesHook.calculateTotalEnvironmentalImpact,
    calculateAverageTransportCost: routesHook.calculateAverageTransportCost,

    // Combined
    loading:
      rawMaterialsHook.loading || suppliersHook.loading || routesHook.loading,
    error,
  };
}
