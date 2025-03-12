"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

// Define the Supplier interface
interface Supplier {
  id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  materials: string[];
  certifications: string[];
  transportMode: string | null;
  distance: number | null;
  transportationDetails: string | null;
  productionCapacity: string | null;
  performanceHistory: string | null;
  environmentalImpact: string | null;
  riskScore: string | null;
  quality: number | null;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  economicData: {
    foundedYear: number;
    annualRevenue: number;
    employeeCount: number;
  };
  environmentalData: {
    carbonFootprint: number;
    wasteManagement: string;
    energyEfficiency: string;
  };
  quality?: {
    score: number;
    certifications: string[];
    lastAudit: string;
  };
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch suppliers data
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        // Update the API endpoint path
        const response = await fetch("/api/suppliers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched suppliers:", data); // Add this for debugging
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast({
          title: "Error",
          description: "Failed to load suppliers",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSuppliers(suppliers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(query) ||
          supplier.location?.address?.toLowerCase().includes(query) ||
          supplier.contactInfo?.name?.toLowerCase().includes(query) ||
          supplier.contactInfo?.email?.toLowerCase().includes(query) ||
          supplier.contactInfo?.phone?.toLowerCase().includes(query) ||
          supplier.materials?.some((material) =>
            material.toLowerCase().includes(query)
          ) ||
          supplier.certifications?.some((cert) =>
            cert.toLowerCase().includes(query)
          )
      );
      setFilteredSuppliers(filtered);
    }
  }, [searchQuery, suppliers]);

  // Navigate to supplier details
  const handleSupplierClick = (supplierId: string) => {
    console.log(`Navigating to supplier details: ${supplierId}`);
    router.push(`/dashboard/suppliers/${supplierId}`);
  };

  // Navigate to add new supplier
  const handleAddSupplier = () => {
    router.push("/dashboard/suppliers/new");
  };

  // Get performance badge color
  const getPerformanceBadgeColor = (
    performance: string | number | null | undefined
  ) => {
    if (!performance) return "secondary";

    const performanceStr = String(performance).toLowerCase();

    // Handle numeric risk scores
    if (!isNaN(Number(performance))) {
      const riskScore = Number(performance);
      if (riskScore <= 0.2) return "outline"; // low risk
      if (riskScore <= 0.4) return "secondary"; // medium risk
      return "destructive"; // high risk
    }

    // Handle string performance values
    switch (performanceStr) {
      case "excellent":
      case "low":
        return "outline";
      case "good":
      case "medium":
        return "secondary";
      case "average":
        return "default";
      case "poor":
      case "high":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Button onClick={handleAddSupplier}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Performance</DropdownMenuItem>
            <DropdownMenuItem>Materials</DropdownMenuItem>
            <DropdownMenuItem>Location</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-6 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No suppliers found. Try adjusting your search or add a new supplier.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSupplierClick(supplier.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{supplier.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {supplier.location?.address || "No address provided"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/dashboard/suppliers/${supplier.id}/edit`
                          );
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          // Implement delete functionality
                          toast({
                            title: "Not Implemented",
                            description:
                              "Delete functionality is not yet implemented",
                          });
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Quality Score
                    </p>
                    <p className="text-sm font-medium">
                      {supplier.quality?.score || "N/A"}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Production</p>
                    <p className="text-sm font-medium">
                      {supplier.productionCapacity || "N/A"} kg
                    </p>
                  </div>
                </div>
                {supplier.contactInfo?.name && (
                  <p className="text-sm">
                    Contact: {supplier.contactInfo.name}
                  </p>
                )}
                {supplier.contactInfo?.phone && (
                  <p className="text-sm flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    {supplier.contactInfo.phone}
                  </p>
                )}
                {supplier.contactInfo?.email && (
                  <p className="text-sm flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    {supplier.contactInfo.email}
                  </p>
                )}
                {supplier.materials && supplier.materials.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {supplier.materials.slice(0, 3).map((material, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                    {supplier.materials.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{supplier.materials.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                {supplier.certifications &&
                  supplier.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {supplier.certifications
                        .slice(0, 2)
                        .map((cert, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {cert}
                          </Badge>
                        ))}
                      {supplier.certifications.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{supplier.certifications.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Badge variant={getPerformanceBadgeColor(supplier.riskScore)}>
                  Risk: {supplier.riskScore || "N/A"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {supplier.transportMode || "No transport info"}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
