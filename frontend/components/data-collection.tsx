"use client";

import React, { useState } from "react";
import {
  Filter,
  PlusCircle,
  Download,
  Database,
  CheckCircle2,
  Save,
  ArrowRight,
  X,
  Plus,
  Trash2,
  Check,
  MapPin,
  Truck,
  Factory,
  Award,
  TrendingUp,
  BarChart,
  RefreshCw,
  BarChart4,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useLocalData } from "@/hooks/useLocalData";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useRoutes } from "@/hooks/useRoutes";
import { v4 as uuidv4 } from "uuid";
import { Supplier, RawMaterial, Warehouse, Route } from "@/types/types";

export function DataCollection() {
  // Use the local data hook with update functions
  const {
    suppliers: allSuppliers,
    rawMaterials: allMaterials,
    warehouses: allWarehouses,
    routes: allRoutes,
    loading,
    updateSupplier,
    updateMaterial,
  } = useLocalData();

  // State for the current step
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // State for the form data
  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({
    name: "",
    type: "",
    description: "",
    category: "",
    unit: "kg",
  });

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    location: {
      address: "",
      coordinates: { lat: 0, lng: 0 },
    },
    materials: [],
    transportMode: "",
    certifications: [],
    productionCapacity: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // State for supplier-material association
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  // Function to handle form submission for a new material
  const handleSubmitRawMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a new material with the useRawMaterials hook
      const result = await addRawMaterial({
        ...newMaterial,
        id: `material-${uuidv4()}`,
      } as RawMaterial);

      toast({
        title: "Success",
        description: "Raw material added successfully",
      });

      // Reset form and move to next step
      setNewMaterial({
        name: "",
        type: "",
        description: "",
        category: "",
        unit: "kg",
      });
      setCurrentStep(2);
    } catch (error) {
      console.error("Error adding raw material:", error);
      toast({
        title: "Error",
        description: "Failed to add raw material",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle form submission for a new supplier
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a new supplier with the useSuppliers hook
      const result = await addSupplier({
        ...newSupplier,
        id: `supplier-${uuidv4()}`,
      } as Supplier);

      toast({
        title: "Success",
        description: "Supplier added successfully",
      });

      // Reset form
      setNewSupplier({
        name: "",
        location: {
          address: "",
          coordinates: { lat: 0, lng: 0 },
        },
        materials: [],
        certifications: [],
        transportMode: "",
      });
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle supplier selection
  const toggleSupplierSelection = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  // Function to associate suppliers with a material
  const handleSupplierAssociationComplete = async () => {
    if (!selectedMaterial || selectedSuppliers.length === 0) {
      toast({
        title: "Warning",
        description: "Please select a material and at least one supplier",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update the material with the selected suppliers
      const material = allMaterials?.find((m) => m.id === selectedMaterial);
      if (material) {
        const updatedMaterial = {
          ...material,
          suppliers: Array.from(
            new Set([...material.suppliers, ...selectedSuppliers])
          ),
        };
        await updateMaterial(updatedMaterial);
      }

      // Update each selected supplier with the material
      for (const supplierId of selectedSuppliers) {
        const supplier = allSuppliers?.find((s) => s.id === supplierId);
        if (supplier) {
          const updatedSupplier = {
            ...supplier,
            materials: Array.from(
              new Set([...supplier.materials, selectedMaterial])
            ),
          };
          await updateSupplier(updatedSupplier);
        }
      }

      toast({
        title: "Success",
        description: "Suppliers associated with material successfully",
      });

      // Reset selection and move to next step
      setSelectedSuppliers([]);
      setSelectedMaterial("");
      setCurrentStep(3);
    } catch (error) {
      console.error("Error associating suppliers with material:", error);
      toast({
        title: "Error",
        description: "Failed to associate suppliers with material",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setNewMaterial({
      name: "",
      type: "",
      description: "",
      category: "",
      unit: "kg",
    });
    setNewSupplier({
      name: "",
      location: {
        address: "",
        coordinates: { lat: 0, lng: 0 },
      },
      materials: [],
      certifications: [],
      transportMode: "",
    });
    setSelectedSuppliers([]);
    setSelectedMaterial("");
    setCurrentStep(1);
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Add Raw Material</CardTitle>
              <CardDescription>
                Enter the details of the raw material.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="material" className="text-sm font-medium">
                    Select Material
                  </label>
                  <Select
                    value={selectedMaterial}
                    onValueChange={setSelectedMaterial}
                  >
                    <SelectTrigger id="material">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {allMaterials?.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Available Suppliers
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(2.5)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Supplier
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : allSuppliers?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No suppliers available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allSuppliers?.map((supplier) => (
                        <div
                          key={supplier.id}
                          className="flex items-center space-x-2"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSupplierSelection(supplier.id)}
                          >
                            {selectedSuppliers.includes(supplier.id) ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                            )}
                          </Button>
                          <span>{supplier.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Associate Suppliers</CardTitle>
              <CardDescription>
                Select suppliers that provide the raw material.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="material" className="text-sm font-medium">
                    Select Material
                  </label>
                  <Select
                    value={selectedMaterial}
                    onValueChange={setSelectedMaterial}
                  >
                    <SelectTrigger id="material">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {allMaterials?.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Available Suppliers
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(2.5)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Supplier
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : allSuppliers?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No suppliers available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allSuppliers?.map((supplier) => (
                        <div
                          key={supplier.id}
                          className="flex items-center space-x-2"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSupplierSelection(supplier.id)}
                          >
                            {selectedSuppliers.includes(supplier.id) ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                            )}
                          </Button>
                          <span>{supplier.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={handleSupplierAssociationComplete}
                    disabled={
                      isLoading ||
                      !selectedMaterial ||
                      selectedSuppliers.length === 0
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Associate Suppliers
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2.5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Add New Supplier</CardTitle>
              <CardDescription>
                Enter details about a new supplier for your supply chain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="supplierName" className="text-sm font-medium">
                    Supplier Name
                  </label>
                  <Input
                    id="supplierName"
                    placeholder="e.g., Organic Farms Co."
                    value={newSupplier.name}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    placeholder="Full address"
                    value={newSupplier.location?.address}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        location: {
                          ...newSupplier.location!,
                          address: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="transportMode"
                      className="text-sm font-medium"
                    >
                      Transport Mode
                    </label>
                    <Select
                      value={newSupplier.transportMode || ""}
                      onValueChange={(value) =>
                        setNewSupplier({ ...newSupplier, transportMode: value })
                      }
                    >
                      <SelectTrigger id="transportMode">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="road">Road</SelectItem>
                        <SelectItem value="rail">Rail</SelectItem>
                        <SelectItem value="sea">Sea</SelectItem>
                        <SelectItem value="air">Air</SelectItem>
                        <SelectItem value="multimodal">Multimodal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="certifications"
                      className="text-sm font-medium"
                    >
                      Certifications
                    </label>
                    <Input
                      id="certifications"
                      placeholder="e.g., Organic, Fair Trade (comma separated)"
                      value={newSupplier.certifications?.join(", ") || ""}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          certifications: e.target.value
                            .split(",")
                            .map((cert) => cert.trim())
                            .filter((cert) => cert !== ""),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Supplier
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Data Collection Complete</CardTitle>
              <CardDescription>
                You have successfully added new data to your supply chain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your supply chain data has been updated successfully.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Add More Data
                </Button>
                <Button onClick={() => (window.location.href = "/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Add a function to render the data summary
  const renderDataSummary = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Data Summary</CardTitle>
          <CardDescription>Overview of your supply chain data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Raw Materials Summary */}
            <div className="space-y-2">
              <h3 className="font-medium">Raw Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Materials
                        </p>
                        <p className="text-2xl font-bold">
                          {allMaterials?.length || 0}
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Associated Suppliers
                        </p>
                        <p className="text-2xl font-bold">
                          {allSuppliers?.length || 0}
                        </p>
                      </div>
                      <Factory className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Materials */}
            <div className="space-y-2">
              <h3 className="font-medium">Recent Materials</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Suppliers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allMaterials?.slice(0, 5).map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>{material.name}</TableCell>
                        <TableCell>{material.type}</TableCell>
                        <TableCell>
                          {material.suppliers?.length || 0} supplier(s)
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!allMaterials || allMaterials.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          No materials available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Recent Suppliers */}
            <div className="space-y-2">
              <h3 className="font-medium">Recent Suppliers</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Materials</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSuppliers?.slice(0, 5).map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>{supplier.name}</TableCell>
                        <TableCell>{supplier.location?.address}</TableCell>
                        <TableCell>
                          {supplier.materials?.length || 0} material(s)
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!allSuppliers || allSuppliers.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          No suppliers available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Collection</h1>
        <p className="text-muted-foreground">
          Add and manage your supply chain data
        </p>
      </div>

      <Tabs defaultValue="raw-materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="summary">Data Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="raw-materials" className="space-y-4">
          {renderStepContent()}
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {renderDataSummary()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
