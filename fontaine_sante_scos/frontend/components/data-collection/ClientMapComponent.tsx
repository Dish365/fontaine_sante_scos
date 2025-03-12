"use client";

import React, { Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  RawMaterial,
  Supplier,
  Warehouse,
} from "@/lib/data-collection-utils";
import { getTransportModeColor } from "./utils";

interface ClientMapComponentProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
  warehouses: Warehouse[];
}

export default function ClientMapComponent({
  suppliers,
  materials,
  warehouses,
}: ClientMapComponentProps) {
  const warehouse = warehouses[0];
  const center = warehouse
    ? [warehouse.location.lat, warehouse.location.lng]
    : [41.8781, -87.6298];

  const warehouseIcon = L.divIcon({
    html: `<div class="bg-white border-2 border-blue-500 rounded-full p-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <path d="M9 21V9"/>
              </svg>
           </div>`,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  const supplierIcon = L.divIcon({
    html: `<div class="bg-white border-2 border-gray-500 rounded-full p-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
                <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-7H4a2 2 0 0 0-2 2v17z"/>
                <path d="M16 8V1"/>
                <path d="M8 12h8"/>
                <path d="M8 16h8"/>
              </svg>
           </div>`,
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={4}
      className="h-[600px] w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {warehouse && (
        <Marker
          position={[warehouse.location.lat, warehouse.location.lng]}
          icon={warehouseIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{warehouse.name}</h3>
              <p className="text-sm text-muted-foreground">
                {warehouse.location.address}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
      {suppliers.map((supplier) => (
        <Fragment key={supplier.id}>
          <Marker
            position={[
              supplier.location.coordinates.lat,
              supplier.location.coordinates.lng,
            ]}
            icon={supplierIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{supplier.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {supplier.location.address}
                </p>
              </div>
            </Popup>
          </Marker>
          {warehouse && (
            <Polyline
              positions={[
                [
                  supplier.location.coordinates.lat,
                  supplier.location.coordinates.lng,
                ],
                [warehouse.location.lat, warehouse.location.lng],
              ]}
              color={getTransportModeColor(supplier.transportMode || "road")}
              weight={3}
              opacity={0.8}
            />
          )}
        </Fragment>
      ))}
    </MapContainer>
  );
}
