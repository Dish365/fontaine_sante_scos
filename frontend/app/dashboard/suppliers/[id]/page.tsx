"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Building,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Supplier } from "@/types/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;
  const { getSupplierById, deleteSupplier, loading } = useSuppliers();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Get supplier details
    const supplierData = getSupplierById(supplierId);
    if (supplierData) {
      setSupplier(supplierData);
    } else {
      toast({
        title: "Error",
        description: "Supplier not found",
        variant: "destructive",
      });
      router.push("/dashboard/suppliers");
    }
  }, [supplierId, getSupplierById, router]);

  const handleDeleteSupplier = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteSupplier(supplierId);
      if (success) {
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
        router.push("/dashboard/suppliers");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSupplier = () => {
    router.push(`/dashboard/suppliers/${supplierId}/edit`);
  };

  if (loading) {
    return <SupplierDetailSkeleton />;
  }

  if (!supplier) {
    return null;
  }

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditSupplier}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the supplier "{supplier.name}".
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSupplier}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{supplier.name}</CardTitle>
          {supplier.location?.address && (
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {supplier.location.address}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              {supplier.contactInfo?.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {supplier.contactInfo.phone}
                </p>
              )}
              {supplier.contactInfo?.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {supplier.contactInfo.email}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Company Information</h3>
              <p className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {supplier.economicData?.employeeCount || "N/A"} employees
              </p>
              {supplier.productionCapacity && (
                <p>Production Capacity: {supplier.productionCapacity}</p>
              )}
              {supplier.transportMode && (
                <p>Transport Mode: {supplier.transportMode}</p>
              )}
            </div>
          </div>

          {supplier.materials && supplier.materials.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Materials</h3>
              <div className="flex flex-wrap gap-2">
                {supplier.materials.map((material, index) => (
                  <Badge key={index} variant="secondary">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {supplier.certifications && supplier.certifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {supplier.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {supplier.quality && (
            <div className="space-y-2">
              <h3 className="font-semibold">Quality Information</h3>
              <p>Quality Score: {supplier.quality.score}/100</p>
              <p>
                Last Audit:{" "}
                {new Date(supplier.quality.lastAudit).toLocaleDateString()}
              </p>
            </div>
          )}

          {supplier.environmentalData && (
            <div className="space-y-2">
              <h3 className="font-semibold">Environmental Data</h3>
              <p>
                Carbon Footprint: {supplier.environmentalData.carbonFootprint}{" "}
                kg CO2e
              </p>
              {supplier.environmentalData.wasteManagement && (
                <p>
                  Waste Management: {supplier.environmentalData.wasteManagement}
                </p>
              )}
              {supplier.environmentalData.energyEfficiency && (
                <p>
                  Energy Efficiency:{" "}
                  {supplier.environmentalData.energyEfficiency}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SupplierDetailSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
