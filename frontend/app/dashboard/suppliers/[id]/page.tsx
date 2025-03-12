"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Building } from "lucide-react";
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

interface Supplier {
  id: string;
  name: string;
  location: any;
  materials: string[];
  certifications: string[];
  contactInfo: {
    phone: string;
    email?: string;
  };
  economicData: {
    employeeCount: number;
  };
  environmentalData: any;
}

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/suppliers/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "Supplier not found",
            variant: "destructive",
          });
          router.push("/dashboard/suppliers");
          return;
        }
        throw new Error("Failed to fetch supplier");
      }

      const data = await response.json();
      setSupplier(data);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      toast({
        title: "Error",
        description: "Failed to load supplier details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SupplierDetailSkeleton />;
  }

  if (!supplier) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/suppliers")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
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
