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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import SupplierLocationMap from "@/components/SupplierLocationMap";

// Add a style tag to fix positioning issues
const SupplierPageStyles = () => (
  <style jsx global>{`
    /* Ensure the supplier page is properly positioned */
    main {
      position: relative !important;
      z-index: 10 !important;
      background-color: var(--background) !important;
    }

    /* Fix any potential overflow issues */
    .container {
      position: relative !important;
      z-index: 10 !important;
      background-color: var(--background) !important;
      width: 100% !important;
      max-width: 1200px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }

    /* Ensure dialogs appear above everything */
    [role="dialog"] {
      z-index: 50 !important;
      position: fixed !important;
    }

    /* Fix for the sidebar */
    [role="navigation"] {
      z-index: 5 !important;
    }

    /* Ensure links are clickable */
    a,
    button {
      position: relative !important;
      z-index: 15 !important;
    }

    /* Fix for breadcrumbs */
    nav[aria-label="breadcrumb"] {
      position: relative !important;
      z-index: 15 !important;
    }
  `}</style>
);

// Add TypeScript declaration for the global navigation function
declare global {
  interface Window {
    __navigateToSuppliers: () => void;
  }
}

// Add a global navigation handler at the top of the file
// This will be used as a last resort if other navigation methods fail
if (typeof window !== "undefined") {
  // Only run in browser environment
  window.__navigateToSuppliers = function () {
    window.location.href = "/dashboard/suppliers";
  };
}

function NavigationLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Try multiple navigation methods
    try {
      // Method 1: Next.js router
      router.push(href);

      // Method 2: After a short delay, try direct navigation if router fails
      setTimeout(() => {
        window.location.href = href;
      }, 100);
    } catch (error) {
      console.error("Navigation error:", error);
      // Method 3: Fallback to direct navigation
      window.location.href = href;
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`text-primary hover:underline ${className}`}
    >
      {children}
    </a>
  );
}

// Create a button that looks like the original but uses multiple navigation methods
function BackButton() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Try all navigation methods in sequence
    try {
      // Method 1: Next.js router
      router.push("/dashboard/suppliers");

      // Method 2: After a short delay, try direct navigation
      setTimeout(() => {
        try {
          // Method 3: Use history API
          window.history.pushState({}, "", "/dashboard/suppliers");
          window.history.go(0); // Refresh the page
        } catch (historyError) {
          console.error("History navigation failed:", historyError);

          // Method 4: Direct location change
          window.location.href = "/dashboard/suppliers";
        }
      }, 100);
    } catch (error) {
      console.error("Navigation error:", error);
      // Method 5: Global navigation function
      if (typeof window !== "undefined" && window.__navigateToSuppliers) {
        window.__navigateToSuppliers();
      } else {
        // Method 6: Last resort
        window.location.replace("/dashboard/suppliers");
      }
    }
  };

  return (
    <Button variant="ghost" onClick={handleClick}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Suppliers
    </Button>
  );
}

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;
  const { getSupplierById, deleteSupplier, loading } = useSuppliers();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fix for main content area positioning
  useEffect(() => {
    // Fix the main content area positioning
    const fixMainContentPosition = () => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        // Apply styles to ensure content is visible
        mainContent.style.position = "relative";
        mainContent.style.zIndex = "10";
        mainContent.style.backgroundColor = "var(--background)";

        // Ensure the content isn't hidden behind the sidebar
        const sidebar = document.querySelector('[role="navigation"]');
        if (sidebar) {
          const sidebarWidth = sidebar.getBoundingClientRect().width;
          if (sidebarWidth > 0) {
            // Only adjust if sidebar is visible
            mainContent.style.marginLeft = `${sidebarWidth}px`;
            mainContent.style.width = `calc(100% - ${sidebarWidth}px)`;
          }
        }
      }
    };

    // Apply the fix immediately
    fixMainContentPosition();

    // Also apply on resize to handle sidebar collapsing/expanding
    window.addEventListener("resize", fixMainContentPosition);

    // Clean up
    return () => {
      window.removeEventListener("resize", fixMainContentPosition);
      const mainContent = document.querySelector("main");
      if (mainContent) {
        mainContent.style.position = "";
        mainContent.style.zIndex = "";
        mainContent.style.backgroundColor = "";
        mainContent.style.marginLeft = "";
        mainContent.style.width = "";
      }
    };
  }, []);

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
      navigateTo("/dashboard/suppliers");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, getSupplierById]);

  const handleDeleteSupplier = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteSupplier(supplierId);
      if (success) {
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
        navigateTo("/dashboard/suppliers");
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

  // Add a helper function for navigation
  const navigateTo = (path: string) => {
    // Use direct navigation to avoid routing issues
    // Add a small delay to ensure any pending state updates are completed
    setTimeout(() => {
      window.location.href = path;
    }, 50);
  };

  const goToSuppliers = () => {
    // Use direct navigation to avoid routing issues
    setTimeout(() => {
      window.location.href = "/dashboard/suppliers";
    }, 50);
  };

  const goToEdit = () => {
    // Use direct navigation to avoid routing issues
    setTimeout(() => {
      window.location.href = `/dashboard/suppliers/${supplierId}/edit`;
    }, 50);
  };

  if (loading) {
    return <SupplierDetailSkeleton />;
  }

  if (!supplier) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6 relative z-10 bg-background">
      <SupplierPageStyles />
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <a
              href="/dashboard"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/dashboard");
              }}
            >
              Dashboard
            </a>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <a
              href="/dashboard/suppliers"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/dashboard/suppliers");
              }}
            >
              Suppliers
            </a>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">{supplier.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <a
          href="/dashboard/suppliers"
          className="inline-flex items-center text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault();
            navigateTo("/dashboard/suppliers");
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </a>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              goToEdit();
            }}
          >
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
            <AlertDialogContent className="z-50">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Name
                </h3>
                <p className="text-lg font-medium">{supplier.name}</p>
              </div>
              {supplier.contactInfo && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Contact
                    </h3>
                    <p>{supplier.contactInfo.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Email
                    </h3>
                    <p>{supplier.contactInfo.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Phone
                    </h3>
                    <p>{supplier.contactInfo.phone}</p>
                  </div>
                </>
              )}
              {supplier.location && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Address
                  </h3>
                  <p>{supplier.location.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {supplier.materials &&
                  supplier.materials.map((material, index) => (
                    <Badge
                      key={`material-${supplier.id}-${index}`}
                      variant="outline"
                    >
                      {material}
                    </Badge>
                  ))}
                {(!supplier.materials || supplier.materials.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No materials available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {supplier.economicData && (
            <Card>
              <CardHeader>
                <CardTitle>Economic Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Founded Year
                  </h3>
                  <p>{supplier.economicData.foundedYear || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Annual Revenue
                  </h3>
                  <p>
                    $
                    {supplier.economicData.annualRevenue?.toLocaleString() ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Employee Count
                  </h3>
                  <p>
                    {supplier.economicData.employeeCount?.toLocaleString() ||
                      "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {supplier.certifications &&
                  supplier.certifications.map((cert, index) => (
                    <Badge
                      key={`cert-${supplier.id}-${index}`}
                      variant="outline"
                    >
                      {cert}
                    </Badge>
                  ))}
                {(!supplier.certifications ||
                  supplier.certifications.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No certifications available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {supplier.quality && typeof supplier.quality === "object" && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Progress value={supplier.quality.score} className="h-2" />
                  <span className="text-sm font-medium">
                    {supplier.quality.score}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {supplier.environmentalData && (
            <Card>
              <CardHeader>
                <CardTitle>Environmental Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Carbon Footprint
                  </h3>
                  <p>{supplier.environmentalData.carbonFootprint} kg CO2e</p>
                </div>
                {supplier.environmentalData.wasteManagement && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Waste Management
                    </h3>
                    <p>{supplier.environmentalData.wasteManagement}</p>
                  </div>
                )}
                {supplier.environmentalData.energyEfficiency && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Energy Efficiency
                    </h3>
                    <p>{supplier.environmentalData.energyEfficiency}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] rounded-md border">
                {supplier.location && supplier.location.coordinates ? (
                  <SupplierLocationMap
                    coordinates={supplier.location.coordinates}
                    name={supplier.name}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No location data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SupplierDetailSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6 relative z-10 bg-background">
      <SupplierPageStyles />
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
