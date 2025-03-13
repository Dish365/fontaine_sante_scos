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
  Trash2,
  Edit,
  RefreshCw,
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
import { useSuppliers } from "@/hooks/useSuppliers";
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
import { Supplier } from "@/types/types";

export default function SuppliersPage() {
  const router = useRouter();
  const {
    suppliers,
    loading,
    error,
    loadSuppliers,
    deleteSupplier,
    getSuppliersByCertification,
    getSuppliersByTransportMode,
  } = useSuppliers();

  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Apply filters and search
  useEffect(() => {
    let result = [...suppliers];

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
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
    }

    // Apply filters
    if (filterType && filterValue) {
      switch (filterType) {
        case "certification":
          result = getSuppliersByCertification(filterValue);
          break;
        case "transportMode":
          result = getSuppliersByTransportMode(filterValue);
          break;
      }
    }

    setFilteredSuppliers(result);
  }, [
    searchQuery,
    suppliers,
    filterType,
    filterValue,
    getSuppliersByCertification,
    getSuppliersByTransportMode,
  ]);

  // Navigate to supplier details
  const handleSupplierClick = (supplierId: string) => {
    router.push(`/dashboard/suppliers/${supplierId}`);
  };

  // Navigate to add new supplier
  const handleAddSupplier = () => {
    router.push("/dashboard/suppliers/new");
  };

  // Navigate to edit supplier
  const handleEditSupplier = (e: React.MouseEvent, supplierId: string) => {
    e.stopPropagation();
    router.push(`/dashboard/suppliers/${supplierId}/edit`);
  };

  // Handle supplier deletion
  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteSupplier(supplierToDelete);
      if (success) {
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
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
      setSupplierToDelete(null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadSuppliers();
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

  // Show error message if there's an error
  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading suppliers: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleAddSupplier}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
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
            <DropdownMenuItem
              onClick={() => {
                setFilterType("certification");
                setFilterValue("ISO");
              }}
            >
              ISO Certification
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setFilterType("certification");
                setFilterValue("HACCP");
              }}
            >
              HACCP Certification
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setFilterType("transportMode");
                setFilterValue("ship");
              }}
            >
              Ship Transport
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setFilterType("transportMode");
                setFilterValue("train");
              }}
            >
              Train Transport
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setFilterType(null);
                setFilterValue("");
              }}
            >
              Clear Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
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
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No suppliers found</p>
          </CardContent>
        </Card>
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
                    {supplier.location?.address && (
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {supplier.location.address}
                      </CardDescription>
                    )}
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
                        onClick={(e) => handleEditSupplier(e, supplier.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              setSupplierToDelete(supplier.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the supplier "
                              {supplier.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setSupplierToDelete(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-2">
                <div className="space-y-2">
                  {supplier.contactInfo?.phone && (
                    <p className="text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {supplier.contactInfo.phone}
                    </p>
                  )}
                  {supplier.contactInfo?.email && (
                    <p className="text-sm flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {supplier.contactInfo.email}
                    </p>
                  )}
                </div>

                {supplier.materials && supplier.materials.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      Materials ({supplier.materials.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.materials.slice(0, 3).map((material, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {material}
                        </Badge>
                      ))}
                      {supplier.materials.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.materials.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-1">
                    {supplier.certifications?.slice(0, 2).map((cert, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {cert}
                      </Badge>
                    ))}
                    {supplier.certifications?.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{supplier.certifications.length - 2}
                      </Badge>
                    )}
                  </div>
                  {supplier.riskScore && (
                    <Badge
                      variant={
                        getPerformanceBadgeColor(supplier.riskScore) as any
                      }
                      className="text-xs"
                    >
                      Risk: {supplier.riskScore}
                    </Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
