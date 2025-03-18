"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "@/components/ui/use-toast";
import { useLocalData } from "@/hooks/useLocalData";
import type { Supplier } from "@/types/types";

export default function SupplierDetail({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const { suppliers, loading } = useLocalData();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && suppliers.length > 0) {
      const foundSupplier = suppliers.find((s) => s.id === id);
      if (foundSupplier) {
        setSupplier(foundSupplier);
      } else {
        console.log(`Supplier with ID ${id} not found`);
      }
    }
  }, [id, suppliers, loading]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // In a real app, we would call the API to delete the supplier
      // For now, we'll just simulate a successful deletion

      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });

      router.push("/dashboard/suppliers");
      router.refresh();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get performance badge color
  const getPerformanceBadgeColor = (performance?: string) => {
    if (!performance) return "secondary";

    switch (performance.toLowerCase()) {
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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Supplier Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              The requested supplier could not be found. It may have been
              deleted or you may have followed an invalid link.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push("/dashboard/suppliers")}>
                Return to Suppliers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
          {supplier.performance && (
            <Badge
              variant={getPerformanceBadgeColor(supplier.performance)}
              className="ml-2"
            >
              {supplier.performance}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/suppliers/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  supplier and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
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
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">
                    {supplier.location?.address || "No address provided"}
                  </p>
                </div>
              </div>

              {supplier.contactInfo?.name && (
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-medium">Contact Person</p>
                    <p className="text-muted-foreground">
                      {supplier.contactInfo.name}
                    </p>
                  </div>
                </div>
              )}

              {supplier.contactInfo?.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">
                      {supplier.contactInfo.phone}
                    </p>
                  </div>
                </div>
              )}

              {supplier.contactInfo?.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">
                      {supplier.contactInfo.email}
                    </p>
                  </div>
                </div>
              )}

              {supplier.createdAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Added On</p>
                    <p className="text-muted-foreground">
                      {formatDate(supplier.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {supplier.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Notes</p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {supplier.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="materials">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="materials" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Materials</CardTitle>
                  <CardDescription>
                    Materials supplied by this supplier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {supplier.materials && supplier.materials.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {supplier.materials.map((material, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          <Tag className="h-3.5 w-3.5 mr-1.5" />
                          {material}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No materials associated with this supplier.
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/materials?supplier=${id}`)
                    }
                  >
                    View All Materials
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>
                    Purchase orders with this supplier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No orders found for this supplier.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/orders/new?supplier=${id}`)
                    }
                  >
                    Create New Order
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Rating</p>
                  <Badge variant={getPerformanceBadgeColor(supplier.riskScore)}>
                    Risk: {supplier.riskScore || "Not Rated"}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium mb-1">On-Time Delivery</p>
                  <p className="text-muted-foreground">No data available</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Quality Score</p>
                  <p className="text-muted-foreground">No data available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                Add to Category
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
