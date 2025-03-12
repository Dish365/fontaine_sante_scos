"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { RawMaterial, Supplier, Warehouse } from "@/types/types";

// Create custom icons using divIcons with inline SVG
const createCustomIcons = () => {
  // Warehouse icon
  const warehouseIcon = L.divIcon({
    html: `<div style="background-color: white; border: 2px solid #3b82f6; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </div>`,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Supplier icon
  const supplierIcon = L.divIcon({
    html: `<div style="background-color: white; border: 2px solid #64748b; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
    </div>`,
    className: "custom-div-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

  return { warehouseIcon, supplierIcon };
};

interface LeafletMapProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
  warehouses: Warehouse[];
}

export default function LeafletMap({
  suppliers,
  materials,
  warehouses,
}: LeafletMapProps) {
  // Set default center if no warehouses
  const defaultCenter = [41.8781, -87.6298]; // Chicago as default
  const warehouse = warehouses.length > 0 ? warehouses[0] : null;
  const center = warehouse
    ? [warehouse.location.lat, warehouse.location.lng]
    : defaultCenter;

  // Create custom icons
  const { warehouseIcon, supplierIcon } = createCustomIcons();

  return (
    <div className="h-[600px] w-full">
      <MapContainer
        center={center as [number, number]}
        zoom={4}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render warehouse markers */}
        {warehouses.map((warehouse) => (
          <Marker
            key={warehouse.id}
            position={[warehouse.location.lat, warehouse.location.lng]}
            icon={warehouseIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{warehouse.name}</h3>
                <p>{warehouse.location.address}</p>
                <p>
                  Capacity: {warehouse.capacity.currentUtilization} /{" "}
                  {warehouse.capacity.maxCapacity} {warehouse.capacity.unit}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render supplier markers */}
        {suppliers.map((supplier) => (
          <Marker
            key={supplier.id}
            position={[supplier.coordinates.lat, supplier.coordinates.lng]}
            icon={supplierIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{supplier.name}</h3>
                <p>{supplier.address}</p>
                {supplier.materials && supplier.materials.length > 0 && (
                  <p>Materials: {supplier.materials.length}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
