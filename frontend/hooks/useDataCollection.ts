import { useRawMaterials } from './useRawMaterials';
import { useSuppliers } from './useSuppliers';
import { useState, useEffect } from 'react';

/**
 * A hook that combines raw materials and suppliers
 * Provides a single interface for working with the supply chain database
 */
export function useDataCollection() {
  // Get the individual hooks
  const rawMaterialsHook = useRawMaterials();
  const suppliersHook = useSuppliers();
  
  // Combine error states
  const [error, setError] = useState<string | null>(null);

  // Update error state if either hook has an error
  useEffect(() => {
    if (rawMaterialsHook.error) {
      setError(rawMaterialsHook.error);
    } else if (suppliersHook.error) {
      setError(suppliersHook.error);
    } else {
      setError(null);
    }
  }, [rawMaterialsHook.error, suppliersHook.error]);
  
  // Return combined hooks
  return {
    // Raw Materials
    rawMaterials: rawMaterialsHook.rawMaterials,
    loadingRawMaterials: rawMaterialsHook.loading,
    addRawMaterial: rawMaterialsHook.addRawMaterial,
    updateRawMaterial: rawMaterialsHook.updateRawMaterial,
    associateSuppliersWithMaterial: rawMaterialsHook.associateSuppliersWithMaterial,
    getMaterialsBySupplier: rawMaterialsHook.getMaterialsBySupplier,
    
    // Suppliers
    suppliers: suppliersHook.suppliers,
    loadingSuppliers: suppliersHook.loading,
    addSupplier: suppliersHook.addSupplier,
    updateSupplier: suppliersHook.updateSupplier,
    getSuppliersByMaterial: suppliersHook.getSuppliersByMaterial,
    
    // Combined
    loading: rawMaterialsHook.loading || suppliersHook.loading,
    error,
  };
}
