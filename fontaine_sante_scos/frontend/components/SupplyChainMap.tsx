"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  RawMaterial,
  Supplier as DataSupplier,
  Warehouse as DataWarehouse,
} from "@/lib/data-collection-utils-browser";
import { Supplier, Warehouse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Ship, Plane, Train, Package, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Transport mode definitions
const TRANSPORT_MODES = {
  road: {
    color: "#3b82f6",
    name: "Road",
    icon: Truck,
  },
  rail: {
    color: "#10b981",
    name: "Rail",
    icon: Train,
  },
  sea: {
    color: "#6366f1",
    name: "Sea",
    icon: Ship,
  },
  air: {
    color: "#f59e0b",
    name: "Air",
    icon: Plane,
  },
  multimodal: {
    color: "#8b5cf6",
    name: "Multimodal",
    icon: Package,
  },
};

// Helper function to parse transport modes
const parseTransportModes = (transportMode: string | undefined): string[] => {
  if (!transportMode) return ["road"];
  return transportMode.toLowerCase().split(/,\s*/).filter(Boolean);
};

// Helper function to get transport mode details
const getTransportModeDetails = (mode: string) => {
  const normalizedMode = mode.toLowerCase().trim();
  return (
    TRANSPORT_MODES[normalizedMode as keyof typeof TRANSPORT_MODES] ||
    TRANSPORT_MODES.road
  );
};

// Custom node components
const SupplierNode = ({ data }: { data: any }) => {
  const transportModes = parseTransportModes(data.transportMode);

  return (
    <div className="px-4 py-2 shadow-lg rounded-md border bg-white min-w-[180px]">
      <Handle type="source" position={Position.Right} />
      <div className="font-semibold">{data.label}</div>
      <div className="text-xs text-muted-foreground mb-1">{data.location}</div>

      {/* Transport modes */}
      {transportModes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {transportModes.map((mode) => {
            const modeDetails = getTransportModeDetails(mode);
            const Icon = modeDetails.icon;
            return (
              <Badge
                key={mode}
                variant="outline"
                className="text-[10px] py-0 px-1 flex items-center gap-1"
                style={{ borderColor: modeDetails.color }}
              >
                <Icon
                  className="h-2 w-2"
                  style={{ color: modeDetails.color }}
                />
                <span>{modeDetails.name}</span>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Materials */}
      {data.materials && data.materials.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {data.materials.map((material: any) => (
            <Badge
              key={material.id}
              variant="secondary"
              className="text-[10px] py-0 px-1"
            >
              {material.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

const MaterialNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-md border bg-primary/10 min-w-[180px]">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div className="font-semibold">{data.label}</div>
    <div className="text-xs text-muted-foreground">
      {data.quantity} {data.unit}
    </div>
    {data.suppliers && data.suppliers.length > 0 && (
      <div className="text-xs mt-1">
        <span className="text-muted-foreground">Suppliers: </span>
        <span>{data.suppliers.length}</span>
      </div>
    )}
  </div>
);

const WarehouseNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-md border bg-secondary/10 min-w-[180px]">
    <Handle type="target" position={Position.Left} />
    <div className="font-semibold">{data.label}</div>
    <div className="text-xs text-muted-foreground">
      {data.utilization} / {data.capacity} {data.unit}
    </div>
    {data.type && (
      <div className="text-xs mt-1">
        <span className="text-muted-foreground">Type: </span>
        <span className="capitalize">{data.type}</span>
      </div>
    )}
    {data.materials && data.materials.length > 0 && (
      <div className="text-xs mt-1">
        <span className="text-muted-foreground">Materials: </span>
        <span>{data.materials.length}</span>
      </div>
    )}
  </div>
);

const nodeTypes: NodeTypes = {
  supplier: SupplierNode,
  material: MaterialNode,
  warehouse: WarehouseNode,
};

// Edge styles based on transport mode
const getEdgeStyle = (transportMode: string) => {
  const modeDetails = getTransportModeDetails(transportMode);
  return {
    stroke: modeDetails.color,
    strokeWidth: 2,
  };
};

interface SupplyChainMapProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
  warehouses: Warehouse[];
}

// Inner component that uses the ReactFlow hooks
function SupplyChainMapInner({
  suppliers,
  materials,
  warehouses,
}: SupplyChainMapProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [layoutType, setLayoutType] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  const reactFlowInstance = useReactFlow();

  // Convert suppliers to the format expected by the component
  const convertedSuppliers = suppliers.map(
    (supplier) =>
      ({
        id: supplier.id,
        name: supplier.name,
        location: supplier.location,
        materials: supplier.materials || [],
        transportMode: supplier.transportMode,
        certifications: supplier.certifications || [],
        contactInfo: supplier.contactInfo,
        coordinates: supplier.coordinates,
      } as DataSupplier)
  );

  // Convert warehouses to the format expected by the component
  const convertedWarehouses = warehouses.map(
    (warehouse) =>
      ({
        id: warehouse.id,
        name: warehouse.name,
        type: warehouse.type,
        location: warehouse.location,
        capacity: warehouse.capacity,
        suppliers: warehouse.suppliers || [],
        materials: warehouse.materials || [],
      } as DataWarehouse)
  );

  // Create nodes and edges whenever the props change or layout changes
  useEffect(() => {
    // Calculate positions based on layout type
    const getNodePositions = (
      index: number,
      type: "supplier" | "material" | "warehouse"
    ) => {
      if (layoutType === "horizontal") {
        const columnX =
          type === "supplier" ? 0 : type === "material" ? 300 : 600;
        return { x: columnX, y: index * 150 };
      } else {
        const rowY = type === "supplier" ? 0 : type === "material" ? 300 : 600;
        return { x: index * 250, y: rowY };
      }
    };

    // Create nodes for suppliers, materials, and warehouses
    const newNodes: Node[] = [
      // Supplier nodes
      ...convertedSuppliers.map((supplier, index) => {
        // Find materials associated with this supplier
        const supplierMaterials = materials.filter((m) =>
          m.suppliers.includes(supplier.id)
        );

        return {
          id: `supplier-${supplier.id}`,
          type: "supplier",
          data: {
            label: supplier.name,
            location: supplier.address,
            transportMode: supplier.transportMode,
            materials: supplierMaterials,
            certifications: supplier.certifications,
          },
          position: getNodePositions(index, "supplier"),
        };
      }),

      // Material nodes
      ...materials.map((material, index) => ({
        id: `material-${material.id}`,
        type: "material",
        data: {
          label: material.name,
          quantity: material.quantity,
          unit: material.unit,
          suppliers: material.suppliers,
        },
        position: getNodePositions(index, "material"),
      })),

      // Warehouse nodes
      ...convertedWarehouses.map((warehouse, index) => ({
        id: `warehouse-${warehouse.id}`,
        type: "warehouse",
        data: {
          label: warehouse.name,
          utilization: warehouse.capacity.currentUtilization,
          capacity: warehouse.capacity.maxCapacity,
          unit: warehouse.capacity.unit,
          type: warehouse.type,
          materials: warehouse.materials,
        },
        position: getNodePositions(index, "warehouse"),
      })),
    ];

    // Create edges between nodes
    let newEdges: Edge[] = [];

    // Connect suppliers to materials based on material.suppliers
    materials.forEach((material) => {
      material.suppliers.forEach((supplierId) => {
        // Find the supplier to get its transport mode
        const supplier = convertedSuppliers.find((s) => s.id === supplierId);
        const transportMode = supplier?.transportMode || "road";

        newEdges.push({
          id: `${supplierId}-${material.id}`,
          source: `supplier-${supplierId}`,
          target: `material-${material.id}`,
          animated: true,
          style: getEdgeStyle(transportMode),
          data: { transportMode },
        });
      });
    });

    // If we have a warehouse, connect all materials to it
    if (convertedWarehouses.length > 0) {
      const warehouse = convertedWarehouses[0];

      // Connect all materials to the warehouse
      materials.forEach((material) => {
        newEdges.push({
          id: `${material.id}-${warehouse.id}`,
          source: `material-${material.id}`,
          target: `warehouse-${warehouse.id}`,
          animated: true,
          style: { stroke: "#64748b" }, // Default color for material-warehouse connections
        });
      });

      // Also connect suppliers directly to warehouse if they're in the warehouse.suppliers array
      convertedSuppliers.forEach((supplier) => {
        if (warehouse.suppliers.includes(supplier.id)) {
          newEdges.push({
            id: `direct-${supplier.id}-${warehouse.id}`,
            source: `supplier-${supplier.id}`,
            target: `warehouse-${warehouse.id}`,
            animated: true,
            style: { stroke: "#64748b", strokeDasharray: "5,5" },
          });
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    suppliers,
    materials,
    warehouses,
    convertedSuppliers,
    convertedWarehouses,
    layoutType,
  ]);

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  // Handle node click to show details
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Extract the type and id from the node id (e.g., "supplier-123" -> { type: "supplier", id: "123" })
      const [type, id] = node.id.split("-");

      let detailData;
      if (type === "supplier") {
        detailData = suppliers.find((s) => s.id === id);
      } else if (type === "material") {
        detailData = materials.find((m) => m.id === id);
      } else if (type === "warehouse") {
        detailData = warehouses.find((w) => w.id === id);
      }

      setSelectedElement({
        type,
        data: detailData,
      });
    },
    [suppliers, materials, warehouses]
  );

  // Toggle layout between horizontal and vertical
  const toggleLayout = () => {
    setLayoutType((prev) =>
      prev === "horizontal" ? "vertical" : "horizontal"
    );
  };

  // Auto layout the nodes
  const autoLayout = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleLayout}>
            {layoutType === "horizontal"
              ? "Vertical Layout"
              : "Horizontal Layout"}
          </Button>
          <Button variant="outline" size="sm" onClick={autoLayout}>
            Fit View
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(TRANSPORT_MODES).map(([key, mode]) => {
            const Icon = mode.icon;
            return (
              <div key={key} className="flex items-center gap-1">
                <div
                  className="w-3 h-1"
                  style={{ backgroundColor: mode.color }}
                ></div>
                <Icon className="h-3 w-3" />
                <span>{mode.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1">
        <div className={`${selectedElement ? "w-3/4" : "w-full"} h-full`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {selectedElement && (
          <div className="w-1/4 border-l p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium capitalize">
                {selectedElement.type} Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedElement(null)}
              >
                ×
              </Button>
            </div>

            {selectedElement.type === "supplier" && selectedElement.data && (
              <SupplierDetails
                supplier={selectedElement.data}
                materials={materials}
              />
            )}

            {selectedElement.type === "material" && selectedElement.data && (
              <MaterialDetails
                material={selectedElement.data}
                suppliers={suppliers}
              />
            )}

            {selectedElement.type === "warehouse" && selectedElement.data && (
              <WarehouseDetails
                warehouse={selectedElement.data}
                materials={materials}
                suppliers={suppliers}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component that provides the ReactFlow context
export function SupplyChainMap(props: SupplyChainMapProps) {
  return (
    <ReactFlowProvider>
      <SupplyChainMapInner {...props} />
    </ReactFlowProvider>
  );
}

// Detail components
const SupplierDetails = ({
  supplier,
  materials,
}: {
  supplier: Supplier;
  materials: RawMaterial[];
}) => {
  const supplierMaterials = materials.filter((m) =>
    m.suppliers.includes(supplier.id)
  );

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">{supplier.name}</h4>
        <p className="text-xs text-muted-foreground">{supplier.address}</p>
      </div>

      <Tabs defaultValue="materials">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-2">
          {supplierMaterials.length > 0 ? (
            supplierMaterials.map((material) => (
              <Card key={material.id}>
                <CardContent className="p-3">
                  <div className="text-sm font-medium">{material.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {material.quantity} {material.unit}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No materials assigned
            </p>
          )}
        </TabsContent>

        <TabsContent value="transport">
          {supplier.transportMode ? (
            <div className="space-y-2">
              {parseTransportModes(supplier.transportMode).map((mode) => {
                const modeDetails = getTransportModeDetails(mode);
                const Icon = modeDetails.icon;
                return (
                  <div key={mode} className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4"
                      style={{ color: modeDetails.color }}
                    />
                    <span className="text-sm">{modeDetails.name}</span>
                  </div>
                );
              })}
              {supplier.distance && (
                <div className="text-xs text-muted-foreground">
                  Distance: {supplier.distance} km
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No transport information
            </p>
          )}
        </TabsContent>

        <TabsContent value="info">
          {supplier.certifications && supplier.certifications.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium mb-1">Certifications:</div>
              <div className="flex flex-wrap gap-1">
                {supplier.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {supplier.contactInfo && (
            <div className="text-xs space-y-1">
              <div className="font-medium">Contact:</div>
              {supplier.contactInfo.name && (
                <div>{supplier.contactInfo.name}</div>
              )}
              {supplier.contactInfo.email && (
                <div>{supplier.contactInfo.email}</div>
              )}
              {supplier.contactInfo.phone && (
                <div>{supplier.contactInfo.phone}</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MaterialDetails = ({
  material,
  suppliers,
}: {
  material: RawMaterial;
  suppliers: Supplier[];
}) => {
  const materialSuppliers = suppliers.filter((s) =>
    material.suppliers.includes(s.id)
  );

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">{material.name}</h4>
        <p className="text-xs text-muted-foreground">{material.type}</p>
        <div className="text-xs mt-1">
          Quantity: {material.quantity} {material.unit}
        </div>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-2">
          {materialSuppliers.length > 0 ? (
            materialSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-3">
                  <div className="text-sm font-medium">{supplier.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {supplier.address}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No suppliers assigned
            </p>
          )}
        </TabsContent>

        <TabsContent value="quality">
          {material.quality ? (
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium">Quality Score: </span>
                <span>{material.quality.score}</span>
              </div>
              <div className="text-xs">
                <span className="font-medium">Defect Rate: </span>
                <span>{material.quality.defectRate}%</span>
              </div>
              <div className="text-xs">
                <span className="font-medium">Consistency: </span>
                <span>{material.quality.consistencyScore}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No quality information
            </p>
          )}
        </TabsContent>

        <TabsContent value="environmental">
          {material.environmentalData ? (
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium">Carbon Footprint: </span>
                <span>
                  {material.environmentalData.carbonFootprint} kg CO2e
                </span>
              </div>
              <div className="text-xs">
                <span className="font-medium">Water Usage: </span>
                <span>{material.environmentalData.waterUsage} L</span>
              </div>
              <div className="text-xs">
                <span className="font-medium">Land Use: </span>
                <span>{material.environmentalData.landUse} ha</span>
              </div>
              {material.environmentalData.biodiversityImpact && (
                <div className="text-xs">
                  <span className="font-medium">Biodiversity Impact: </span>
                  <span>{material.environmentalData.biodiversityImpact}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No environmental information
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const WarehouseDetails = ({
  warehouse,
  materials,
  suppliers,
}: {
  warehouse: Warehouse;
  materials: RawMaterial[];
  suppliers: Supplier[];
}) => {
  const warehouseMaterials = materials.filter((m) =>
    warehouse.materials.includes(m.id)
  );
  const warehouseSuppliers = suppliers.filter((s) =>
    warehouse.suppliers.includes(s.id)
  );

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">{warehouse.name}</h4>
        <p className="text-xs text-muted-foreground capitalize">
          {warehouse.type}
        </p>
        <div className="text-xs mt-1">
          Location: {warehouse.location.address}
        </div>
      </div>

      <Tabs defaultValue="capacity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="capacity">
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-medium">Current Utilization: </span>
              <span>
                {warehouse.capacity.currentUtilization}{" "}
                {warehouse.capacity.unit}
              </span>
            </div>
            <div className="text-xs">
              <span className="font-medium">Maximum Capacity: </span>
              <span>
                {warehouse.capacity.maxCapacity} {warehouse.capacity.unit}
              </span>
            </div>
            <div className="text-xs">
              <span className="font-medium">Utilization Rate: </span>
              <span>
                {Math.round(
                  (warehouse.capacity.currentUtilization /
                    warehouse.capacity.maxCapacity) *
                    100
                )}
                %
              </span>
            </div>
            {warehouse.operationalCost && (
              <div className="text-xs">
                <span className="font-medium">Operational Cost: </span>
                <span>${warehouse.operationalCost.toLocaleString()}</span>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-2">
          {warehouseMaterials.length > 0 ? (
            warehouseMaterials.map((material) => (
              <Card key={material.id}>
                <CardContent className="p-3">
                  <div className="text-sm font-medium">{material.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {material.quantity} {material.unit}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No materials assigned
            </p>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-2">
          {warehouseSuppliers.length > 0 ? (
            warehouseSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-3">
                  <div className="text-sm font-medium">{supplier.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {supplier.address}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No direct suppliers</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
