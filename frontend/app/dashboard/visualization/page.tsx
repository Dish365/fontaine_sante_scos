import React, { useEffect } from "react";

// Auto-map all suppliers and materials to the warehouse on first load
useEffect(() => {
  if (
    !loadingSuppliers &&
    !loadingRawMaterials &&
    !loadingWarehouses &&
    warehouses.length > 0 &&
    suppliers.length > 0
  ) {
    // Check if the warehouse already has all suppliers and materials
    const warehouse = warehouses[0];
    const allSupplierIds = suppliers.map((s) => s.id);
    const allMaterialIds = rawMaterials.map((m) => m.id);

    const needsUpdate =
      !allSupplierIds.every((id) => warehouse.suppliers.includes(id)) ||
      !allMaterialIds.every((id) => warehouse.materials.includes(id));

    if (needsUpdate) {
      mapAllToWarehouse();
    }
  }
}, [
  loadingSuppliers,
  loadingRawMaterials,
  loadingWarehouses,
  warehouses,
  suppliers,
  rawMaterials,
]);
