import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Supplier } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { MultiSelect } from "@/components/ui/multi-select";

interface SupplierFormProps {
  supplierId?: string;
  isEditing?: boolean;
}

export function SupplierForm({
  supplierId,
  isEditing = false,
}: SupplierFormProps) {
  const router = useRouter();
  const { addSupplier, updateSupplier, getSupplierById } = useSuppliers();
  const { rawMaterials } = useRawMaterials();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [productionCapacity, setProductionCapacity] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [employeeCount, setEmployeeCount] = useState("");
  const [carbonFootprint, setCarbonFootprint] = useState("");
  const [wasteManagement, setWasteManagement] = useState("");
  const [energyEfficiency, setEnergyEfficiency] = useState("");

  // Load supplier data if editing
  useEffect(() => {
    if (isEditing && supplierId) {
      const supplier = getSupplierById(supplierId);
      if (supplier) {
        setName(supplier.name || "");
        setAddress(supplier.location?.address || "");
        setContactName(supplier.contactInfo?.name || "");
        setContactEmail(supplier.contactInfo?.email || "");
        setContactPhone(supplier.contactInfo?.phone || "");
        setTransportMode(supplier.transportMode || "");
        setProductionCapacity(supplier.productionCapacity || "");
        setCertifications(supplier.certifications || []);
        setSelectedMaterialIds(supplier.materials || []);
        setEmployeeCount(
          supplier.economicData?.employeeCount?.toString() || ""
        );
        setCarbonFootprint(
          supplier.environmentalData?.carbonFootprint?.toString() || ""
        );
        setWasteManagement(supplier.environmentalData?.wasteManagement || "");
        setEnergyEfficiency(supplier.environmentalData?.energyEfficiency || "");
      } else {
        toast({
          title: "Error",
          description: "Supplier not found",
          variant: "destructive",
        });
        router.push("/dashboard/suppliers");
      }
    }
  }, [isEditing, supplierId, getSupplierById, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Supplier name is required";
    }

    if (!address.trim()) {
      errors.address = "Address is required";
    }

    if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) {
      errors.email = "Invalid email format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supplierData: Omit<Supplier, "id"> = {
        name,
        location: {
          address,
          coordinates: { lat: 0, lng: 0 }, // Would be set by geocoding in a real app
        },
        materials: selectedMaterialIds,
        certifications,
        transportMode,
        productionCapacity,
        distance: null,
        transportationDetails: "",
        performanceHistory: "",
        riskScore: 0,
        contactInfo: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
        economicData: {
          foundedYear: new Date().getFullYear(),
          annualRevenue: 0,
          employeeCount: parseInt(employeeCount) || 0,
        },
        environmentalData: {
          carbonFootprint: parseFloat(carbonFootprint) || 0,
          wasteManagement,
          energyEfficiency,
        },
        quality: {
          score: 0,
          certifications,
          lastAudit: new Date().toISOString(),
        },
      };

      if (isEditing && supplierId) {
        await updateSupplier(supplierId, supplierData);
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
      } else {
        await addSupplier(supplierData);
        toast({
          title: "Success",
          description: "Supplier added successfully",
        });
      }

      router.push("/dashboard/suppliers");
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update supplier"
          : "Failed to add supplier",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/suppliers")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Supplier" : "Add New Supplier"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the supplier&apos;s basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Supplier Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter supplier name"
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
                {formErrors.address && (
                  <p className="text-sm text-destructive">
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transportMode">Transport Mode</Label>
                <Select value={transportMode} onValueChange={setTransportMode}>
                  <SelectTrigger id="transportMode">
                    <SelectValue placeholder="Select transport mode" />
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
                <Label htmlFor="productionCapacity">Production Capacity</Label>
                <Input
                  id="productionCapacity"
                  value={productionCapacity}
                  onChange={(e) => setProductionCapacity(e.target.value)}
                  placeholder="e.g., 10000 units/month"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Enter the supplier&apos;s contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Enter contact person's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Number of Employees</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  placeholder="Enter number of employees"
                />
              </div>
            </CardContent>
          </Card>

          {/* Materials & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Materials & Certifications</CardTitle>
              <CardDescription>
                Select materials and certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="materials">Materials</Label>
                <MultiSelect
                  options={rawMaterials.map((material) => ({
                    label: material.name,
                    value: material.id,
                  }))}
                  selected={selectedMaterialIds}
                  onChange={setSelectedMaterialIds}
                  placeholder="Select materials"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <MultiSelect
                  options={[
                    { label: "ISO 9001", value: "ISO 9001" },
                    { label: "ISO 14001", value: "ISO 14001" },
                    { label: "ISO 22000", value: "ISO 22000" },
                    { label: "HACCP", value: "HACCP" },
                    { label: "FSSC 22000", value: "FSSC 22000" },
                    { label: "Organic", value: "Organic" },
                    { label: "Fair Trade", value: "Fair Trade" },
                    { label: "Non-GMO", value: "Non-GMO" },
                  ]}
                  selected={certifications}
                  onChange={setCertifications}
                  placeholder="Select certifications"
                />
              </div>
            </CardContent>
          </Card>

          {/* Environmental Data */}
          <Card>
            <CardHeader>
              <CardTitle>Environmental Data</CardTitle>
              <CardDescription>
                Enter environmental impact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="carbonFootprint">
                  Carbon Footprint (kg CO2e)
                </Label>
                <Input
                  id="carbonFootprint"
                  type="number"
                  value={carbonFootprint}
                  onChange={(e) => setCarbonFootprint(e.target.value)}
                  placeholder="Enter carbon footprint"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wasteManagement">Waste Management</Label>
                <Textarea
                  id="wasteManagement"
                  value={wasteManagement}
                  onChange={(e) => setWasteManagement(e.target.value)}
                  placeholder="Describe waste management practices"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="energyEfficiency">Energy Efficiency</Label>
                <Textarea
                  id="energyEfficiency"
                  value={energyEfficiency}
                  onChange={(e) => setEnergyEfficiency(e.target.value)}
                  placeholder="Describe energy efficiency measures"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/suppliers")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Supplier"}
          </Button>
        </div>
      </form>
    </div>
  );
}
