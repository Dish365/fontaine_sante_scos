"use client";

import React from "react";
import type {
  RawMaterial,
  Supplier as DataSupplier,
  Warehouse as DataWarehouse,
} from "@/lib/data-collection-utils-browser";
import { SupplyChainMap } from "@/components/SupplyChainMap";
import { Supplier, Warehouse } from "@/lib/types";

interface EnhancedMapComponentProps {
  suppliers: DataSupplier[];
  materials: RawMaterial[];
  warehouses: DataWarehouse[];
}

export default function EnhancedMapComponent({
  suppliers,
  materials,
  warehouses,
}: EnhancedMapComponentProps) {
  // If there's no data, show a simplified view
  if (suppliers.length === 0 || warehouses.length === 0) {
    return (
      <div className="h-[600px] w-full rounded-md bg-muted p-4">
        <h3 className="text-lg font-medium mb-4">Supply Chain Map</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-2">Suppliers ({suppliers.length})</h4>
            <ul className="text-sm space-y-1">
              {suppliers.slice(0, 5).map((supplier) => (
                <li key={supplier.id}>{supplier.name}</li>
              ))}
              {suppliers.length > 5 && (
                <li>...and {suppliers.length - 5} more</li>
              )}
            </ul>
          </div>
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-2">Materials ({materials.length})</h4>
            <ul className="text-sm space-y-1">
              {materials.slice(0, 5).map((material) => (
                <li key={material.id}>{material.name}</li>
              ))}
              {materials.length > 5 && (
                <li>...and {materials.length - 5} more</li>
              )}
            </ul>
          </div>
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-2">
              Warehouses ({warehouses.length})
            </h4>
            <ul className="text-sm space-y-1">
              {warehouses.slice(0, 5).map((warehouse) => (
                <li key={warehouse.id}>{warehouse.name}</li>
              ))}
              {warehouses.length > 5 && (
                <li>...and {warehouses.length - 5} more</li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Please add suppliers and warehouses to visualize your supply chain
            network.
          </p>
        </div>
      </div>
    );
  }

  // Convert suppliers to the format expected by SupplyChainMap
  const convertedSuppliers: Supplier[] = suppliers.map((supplier) => {
    // Convert contactInfo to the expected format
    const contactInfo = supplier.contactInfo
      ? {
          name: supplier.contactInfo.name || "",
          email: supplier.contactInfo.email || "",
          phone: supplier.contactInfo.phone || "",
        }
      : undefined;

    return {
      id: supplier.id,
      name: supplier.name,
      address: supplier.location.address,
      coordinates: {
        lat: supplier.location.coordinates.lat,
        lng: supplier.location.coordinates.lng,
      },
      materials: supplier.materials || [],
      transportMode: supplier.transportMode,
      distance: supplier.distance,
      certifications: supplier.certifications || [],
      contactInfo,
      createdAt: supplier.createdAt ? new Date(supplier.createdAt) : new Date(),
      updatedAt: supplier.updatedAt ? new Date(supplier.updatedAt) : new Date(),
    };
  });

  // Convert warehouses to the format expected by SupplyChainMap
  const convertedWarehouses: Warehouse[] = warehouses.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    type: warehouse.type,
    location: {
      address: warehouse.location.address,
      lat: warehouse.location.lat,
      lng: warehouse.location.lng,
    },
    capacity: warehouse.capacity,
    suppliers: warehouse.suppliers || [],
    materials: warehouse.materials || [],
    transitTimes: warehouse.transitTimes,
    operationalCost: warehouse.operationalCost,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Use the existing SupplyChainMap component that's already working
  return (
    <SupplyChainMap
      suppliers={convertedSuppliers}
      materials={materials}
      warehouses={convertedWarehouses}
    />
  );
}
