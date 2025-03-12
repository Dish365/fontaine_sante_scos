"use client";

import ClientMap from "./ClientMap";
import type {
  RawMaterial,
  Supplier,
  Warehouse,
} from "@/lib/data-collection-utils";

interface MapProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
  warehouses: Warehouse[];
}

export default function Map(props: MapProps) {
  return <ClientMap {...props} />;
}

// Helper functions at bottom of file
function getTransportModeColor(mode: string) {
  const colors: Record<string, string> = {
    road: "#3b82f6",
    rail: "#10b981",
    sea: "#6366f1",
    air: "#f59e0b",
    multimodal: "#8b5cf6",
  };
  return colors[mode.toLowerCase()] || colors.road;
}
