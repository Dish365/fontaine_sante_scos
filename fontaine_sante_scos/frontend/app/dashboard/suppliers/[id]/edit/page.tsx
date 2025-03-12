"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDataCollection } from "@/hooks/useDataCollection";
import { Supplier } from "@/lib/data-collection-utils-browser";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  ArrowLeft,
  Save,
  Plus,
  X,
  MapPin,
  Factory,
  Award,
  TrendingUp,
  BarChart,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { SupplierEditSkeleton } from "@/components/supplier-loading";

// Extended supplier type with additional fields
interface ExtendedSupplier extends Supplier {
  contact?: {
    email?: string;
    phone?: string;
    contactPerson?: string;
  };
  metrics?: {
    qualityScore?: number;
    deliveryScore?: number;
    responseTime?: number;
  };
  sustainability?: {
    carbonFootprint?: number;
    wasteReduction?: number;
    renewableEnergy?: number;
  };
}

// Simple loading spinner component
function LoadingSpinner({
  size = "sm",
  text = "",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="ml-2">{text}</span>}
    </div>
  );
}

export default function EditSupplierPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { suppliers, updateSupplier, fetchSuppliers } = useDataCollection();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<ExtendedSupplier>>({
    name: "",
    location: {
      address: "",
      coordinates: { lat: 0, lng: 0 },
    },
    materials: [],
    certifications: [],
    contact: {
      email: "",
      phone: "",
      contactPerson: "",
    },
    metrics: {
      qualityScore: 0,
      deliveryScore: 0,
      responseTime: 0,
    },
    sustainability: {
      carbonFootprint: 0,
      wasteReduction: 0,
      renewableEnergy: 0,
    },
  });

  const [newMaterial, setNewMaterial] = useState("");
  const [newCertification, setNewCertification] = useState("");

  useEffect(() => {
    loadSupplier();
  }, [params.id]);

  // Load supplier data
  const loadSupplier = async () => {
    setIsLoading(true);
    try {
      await fetchSuppliers();
      const supplier = suppliers.find((s) => s.id === params.id);
      if (supplier) {
        // Ensure all required properties exist
        setFormData({
          ...supplier,
          contact: supplier.contactInfo
            ? {
                email: supplier.contactInfo.email || "",
                phone: supplier.contactInfo.phone || "",
                contactPerson: supplier.contactInfo.name || "",
              }
            : {
                email: "",
                phone: "",
                contactPerson: "",
              },
          metrics: {
            qualityScore: supplier.quality || 0,
            deliveryScore: 0,
            responseTime: 0,
          },
          sustainability: {
            carbonFootprint: supplier.environmentalData?.carbonFootprint || 0,
            wasteReduction: 0,
            renewableEnergy:
              supplier.environmentalData?.renewableEnergyUse || 0,
          },
        });
      } else {
        toast({
          title: "Error",
          description: "Supplier not found",
          variant: "destructive",
        });
        router.push("/dashboard/suppliers");
      }
    } catch (error) {
      console.error("Error loading supplier:", error);
      toast({
        title: "Error",
        description: "Failed to load supplier data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      const parentKey = parent as keyof ExtendedSupplier;
      const parentValue = formData[parentKey] || {};

      setFormData({
        ...formData,
        [parent]: {
          ...parentValue,
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle number input changes
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    parent?: string,
    child?: string
  ) => {
    const value = parseFloat(e.target.value) || 0;

    if (parent && child) {
      const parentKey = parent as keyof ExtendedSupplier;
      const parentValue = formData[parentKey] || {};

      setFormData({
        ...formData,
        [parent]: {
          ...parentValue,
          [child]: value,
        },
      });
    } else {
      const { name } = e.target;
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add a certification
  const handleAddCertification = () => {
    if (newCertification.trim() && formData.certifications) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  // Remove a certification
  const handleRemoveCertification = (index: number) => {
    if (formData.certifications) {
      setFormData({
        ...formData,
        certifications: formData.certifications.filter((_, i) => i !== index),
      });
    }
  };

  // Add a material
  const handleAddMaterial = () => {
    if (newMaterial.trim() && formData.materials) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial.trim()],
      });
      setNewMaterial("");
    }
  };

  // Remove a material
  const handleRemoveMaterial = (index: number) => {
    if (formData.materials) {
      setFormData({
        ...formData,
        materials: formData.materials.filter((_, i) => i !== index),
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert the extended supplier back to the standard supplier format
      const supplierData: Partial<Supplier> = {
        ...formData,
        quality: formData.metrics?.qualityScore,
        contactInfo: formData.contact
          ? {
              name: formData.contact.contactPerson || "",
              email: formData.contact.email || "",
              phone: formData.contact.phone || "",
            }
          : undefined,
        environmentalData: formData.sustainability
          ? {
              carbonFootprint: formData.sustainability.carbonFootprint || 0,
              waterUsage: 0,
              wasteGenerated: 0,
              renewableEnergyUse: formData.sustainability.renewableEnergy || 0,
            }
          : undefined,
      };

      // Remove extended properties before sending to API
      const finalData = { ...supplierData };
      // Use type assertion to avoid TypeScript errors
      delete (finalData as Record<string, unknown>).metrics;
      delete (finalData as Record<string, unknown>).sustainability;
      delete (finalData as Record<string, unknown>).contact;

      await updateSupplier(params.id, finalData);
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
      router.push(`/dashboard/suppliers/${params.id}`);
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <SupplierEditSkeleton />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          heading={`Edit ${formData.name}`}
          subheading="Update supplier information"
        />
        <Link href={`/dashboard/suppliers/${params.id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Supplier
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Basic Information */}
          <Card className="shadow-sm">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-3">
              <div className="grid gap-3 sm:grid-cols-1">
                <div className="space-y-1">
                  <Label htmlFor="name">Company Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="shadow-sm">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-3">
              <div className="space-y-1">
                <Label htmlFor="location.address">Address*</Label>
                <Textarea
                  id="location.address"
                  name="location.address"
                  value={formData.location?.address || ""}
                  onChange={handleInputChange}
                  required
                  className="h-20"
                />
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="location.coordinates.lat">Latitude</Label>
                  <Input
                    id="location.coordinates.lat"
                    type="number"
                    step="0.000001"
                    value={formData.location?.coordinates?.lat || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location!,
                          coordinates: {
                            ...formData.location!.coordinates,
                            lat: parseFloat(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location.coordinates.lng">Longitude</Label>
                  <Input
                    id="location.coordinates.lng"
                    type="number"
                    step="0.000001"
                    value={formData.location?.coordinates?.lng || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location!,
                          coordinates: {
                            ...formData.location!.coordinates,
                            lng: parseFloat(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Materials */}
          <Card className="shadow-sm">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center">
                <Factory className="mr-2 h-4 w-4" />
                Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.materials?.map((material, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-2 py-1 text-xs"
                  >
                    {material}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveMaterial(index)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add material..."
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMaterial}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="shadow-sm">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.certifications?.map((cert, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-2 py-1 text-xs"
                  >
                    {cert}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveCertification(index)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add certification..."
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCertification}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="shadow-sm">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-3">
              <div className="grid gap-3 grid-cols-1">
                <div className="space-y-1">
                  <Label htmlFor="metrics.qualityScore">
                    Quality Score (0-100)
                  </Label>
                  <Input
                    id="metrics.qualityScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.metrics?.qualityScore || 0}
                    onChange={(e) =>
                      handleNumberChange(e, "metrics", "qualityScore")
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="metrics.deliveryScore">
                    Delivery Score (0-100)
                  </Label>
                  <Input
                    id="metrics.deliveryScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.metrics?.deliveryScore || 0}
                    onChange={(e) =>
                      handleNumberChange(e, "metrics", "deliveryScore")
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="metrics.responseTime">
                    Response Time (hrs)
                  </Label>
                  <Input
                    id="metrics.responseTime"
                    type="number"
                    min="0"
                    value={formData.metrics?.responseTime || 0}
                    onChange={(e) =>
                      handleNumberChange(e, "metrics", "responseTime")
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sustainability */}
          <Card className="shadow-sm">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                Sustainability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-3">
              <div className="grid gap-3 grid-cols-1">
                <div className="space-y-1">
                  <Label htmlFor="sustainability.carbonFootprint">
                    Carbon Footprint (tons)
                  </Label>
                  <Input
                    id="sustainability.carbonFootprint"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sustainability?.carbonFootprint || 0}
                    onChange={(e) =>
                      handleNumberChange(e, "sustainability", "carbonFootprint")
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sustainability.wasteReduction">
                    Waste Reduction (%)
                  </Label>
                  <Input
                    id="sustainability.wasteReduction"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sustainability?.wasteReduction || 0}
                    onChange={(e) =>
                      handleNumberChange(e, "sustainability", "wasteReduction")
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sustainability.renewableEnergy">
                    Renewable Energy (%)
                  </Label>
                  <Input
                    id="sustainability.renewableEnergy"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sustainability?.renewableEnergy || 0}
                    onChange={(e) =>
                      handleNumberChange(e, "sustainability", "renewableEnergy")
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-lg flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 pb-3">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="contact.email">Email</Label>
                <Input
                  id="contact.email"
                  name="contact.email"
                  type="email"
                  value={formData.contact?.email || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact.phone">Phone</Label>
                <Input
                  id="contact.phone"
                  name="contact.phone"
                  value={formData.contact?.phone || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact.contactPerson">Contact Person</Label>
                <Input
                  id="contact.contactPerson"
                  name="contact.contactPerson"
                  value={formData.contact?.contactPerson || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" text="" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
