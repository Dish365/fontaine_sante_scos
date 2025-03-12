"use client";

import dynamic from "next/dynamic";
import type {
  RawMaterial,
  Supplier,
  Warehouse,
} from "@/lib/data-collection-utils";

interface ClientMapProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
  warehouses: Warehouse[];
}

const ClientMapComponent = dynamic(() => import("./ClientMapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-md bg-muted flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function ClientMap(props: ClientMapProps) {
  return <ClientMapComponent {...props} />;
}
