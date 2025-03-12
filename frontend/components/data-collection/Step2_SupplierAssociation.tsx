import React from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2 } from "lucide-react";
import { RawMaterial } from "@/lib/data-collection-utils";
import { Supplier } from "@/types/types";

interface Step2Props {
  currentMaterial: RawMaterial | null;
  isAddingNewSupplier: boolean;
  newSupplierName: string;
  newSupplierAddress: string;
  newSupplierTransportModes: string[];
  newSupplierTransportation: string;
  newSupplierCapacity: string;
  newSupplierCapacityUnit: string;
  newSupplierCertifications: string;
  newSupplierCertificationsList: string[];
  newSupplierPerformance: string;
  selectedExistingSupplierIds: string[];
  isSubmitting: boolean;
  isGeocodingAddress: boolean;
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  onBack: () => void;
  onAddSupplier: () => Promise<void>; // Update type to match async function
  onAssociateSuppliers: () => void;
  onNewSupplierNameChange: (value: string) => void;
  onNewSupplierAddressChange: (value: string) => void;
  onNewSupplierTransportModesChange: (modes: string[]) => void;
  onNewSupplierTransportationChange: (value: string) => void;
  onNewSupplierCapacityChange: (value: string) => void;
  onNewSupplierCapacityUnitChange: (value: string) => void;
  onNewSupplierCertificationsChange: (value: string) => void;
  onNewSupplierCertificationsListChange: (certs: string[]) => void;
  onNewSupplierPerformanceChange: (value: string) => void;
  onSelectedSuppliersChange: (ids: string[]) => void;
  onGeocodeAddress: () => void;
  onTabChange: (tab: string) => void; // Add this prop
  defaultTab?: string; // Add default tab prop with default value
}

export function Step2SupplierAssociation({
  currentMaterial,
  newSupplierName,
  newSupplierAddress,
  newSupplierTransportModes,
  newSupplierCapacity,
  newSupplierCapacityUnit,
  newSupplierCertificationsList,
  selectedExistingSupplierIds,
  isSubmitting,
  isGeocodingAddress,
  suppliers,
  onBack,
  onAddSupplier,
  onAssociateSuppliers,
  onNewSupplierNameChange,
  onNewSupplierAddressChange,
  onNewSupplierTransportModesChange,
  onNewSupplierCapacityChange,
  onNewSupplierCapacityUnitChange,
  onNewSupplierCertificationsListChange,
  onSelectedSuppliersChange,
  onGeocodeAddress,
  onTabChange,
  defaultTab = "new", // Add default tab prop with default value
}: Step2Props) {
  const [newSupplierError, setNewSupplierError] = React.useState("");
  const [currentTab, setCurrentTab] = React.useState(defaultTab);

  // If there are already selected suppliers, default to the existing tab
  React.useEffect(() => {
    if (selectedExistingSupplierIds.length > 0 && currentTab === "new") {
      setCurrentTab("existing");
      onTabChange("existing");
    }
  }, [selectedExistingSupplierIds, currentTab, onTabChange]);

  const handleNewSupplierSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!newSupplierName.trim()) {
      setNewSupplierError("Supplier name is required");
      return;
    }
    if (!newSupplierAddress.trim()) {
      setNewSupplierError("Supplier address is required");
      return;
    }
    setNewSupplierError("");

    try {
      // Call the parent component's onAddSupplier function
      await onAddSupplier();
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      onTabChange("existing"); // Switch to existing suppliers tab after successful addition
    } catch (error) {
      console.error("Error in handleNewSupplierSubmit:", error);
      setNewSupplierError("Failed to add supplier. Please try again.");
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
              2
            </span>
            Supplier Association
          </CardTitle>
          <CardDescription>
            Associate suppliers with {currentMaterial?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={currentTab}
            className="w-full"
            value={currentTab}
            onValueChange={(value) => {
              setCurrentTab(value);
              onTabChange(value);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">Add New Supplier</TabsTrigger>
              <TabsTrigger value="existing">Select Existing</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="supplierName" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="supplierName"
                    value={newSupplierName}
                    onChange={(e) => onNewSupplierNameChange(e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="supplierAddress"
                    className="text-sm font-medium"
                  >
                    Address
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="supplierAddress"
                      value={newSupplierAddress}
                      onChange={(e) =>
                        onNewSupplierAddressChange(e.target.value)
                      }
                      placeholder="Enter supplier address"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onGeocodeAddress}
                      disabled={isGeocodingAddress}
                    >
                      {isGeocodingAddress ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport Modes</label>
                  <MultiSelect
                    options={[
                      { label: "Truck", value: "truck" },
                      { label: "Train", value: "train" },
                      { label: "Ship", value: "ship" },
                      { label: "Airplane", value: "airplane" },
                    ]}
                    value={newSupplierTransportModes}
                    onChange={onNewSupplierTransportModesChange}
                    placeholder="Select transport modes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Capacity</label>
                    <Input
                      type="number"
                      value={newSupplierCapacity}
                      onChange={(e) =>
                        onNewSupplierCapacityChange(e.target.value)
                      }
                      placeholder="Enter capacity"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Select
                      value={newSupplierCapacityUnit}
                      onValueChange={onNewSupplierCapacityUnitChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="tonnes">Tonnes</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Certifications</label>
                  <MultiSelect
                    options={[
                      { label: "ISO 9001", value: "ISO 9001" },
                      { label: "ISO 14001", value: "ISO 14001" },
                      { label: "FSSC 22000", value: "FSSC 22000" },
                      { label: "Other", value: "Other" },
                    ]}
                    value={newSupplierCertificationsList}
                    onChange={onNewSupplierCertificationsListChange}
                    placeholder="Select certifications"
                  />
                </div>

                {newSupplierError && (
                  <p className="text-red-500 text-sm">{newSupplierError}</p>
                )}
                <Button
                  onClick={handleNewSupplierSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Add Supplier"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="existing" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select suppliers for {currentMaterial?.name}
                  </label>
                  <MultiSelect
                    options={suppliers.map((supplier) => ({
                      label: `${supplier.name} (${supplier.location.address})`,
                      value: supplier.id,
                    }))}
                    value={selectedExistingSupplierIds}
                    onChange={onSelectedSuppliersChange}
                    placeholder="Search and select suppliers..."
                  />
                </div>

                {selectedExistingSupplierIds.length > 0 && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium mb-2">
                      Selected Suppliers ({selectedExistingSupplierIds.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedExistingSupplierIds.map((id) => {
                        const supplier = suppliers.find((s) => s.id === id);
                        return supplier ? (
                          <div
                            key={id}
                            className="flex items-center justify-between"
                          >
                            <span>{supplier.name}</span>
                            <Badge variant="outline">
                              {supplier.location.address}
                            </Badge>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <Button
                  onClick={onAssociateSuppliers}
                  disabled={
                    isSubmitting || selectedExistingSupplierIds.length === 0
                  }
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Associate Selected Suppliers"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
