"use client";

import React, { useState } from "react";
import { Supplier } from "@/lib/data-collection-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Award,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  Trash2,
  AlertCircle,
  Eye,
  Truck,
  Factory,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { useRouter } from "next/navigation";

interface SupplierListProps {
  suppliers: Supplier[];
  view: "grid" | "table";
}

export function SupplierList({
  suppliers = [],
  view = "grid",
}: SupplierListProps) {
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSupplierToDelete(supplierId);
    setIsDeleteDialogOpen(true);
  };

  // Check if a supplier was recently added (for demo purposes, using ID comparison)
  // In a real app, you would use creation timestamps
  const isRecentlyAdded = (supplier: Supplier) => {
    // Sort suppliers by ID (assuming higher IDs are more recent)
    const sortedSuppliers = [...suppliers].sort((a, b) =>
      b.id.localeCompare(a.id)
    );
    // Get the top 3 most recent suppliers
    const recentSuppliers = sortedSuppliers.slice(0, 3);
    // Check if the current supplier is in the recent list
    return recentSuppliers.some((s) => s.id === supplier.id);
  };

  const onView = (supplierId: string) => {
    console.log(`Viewing supplier: ${supplierId}`);
    router.push(`/dashboard/suppliers/${supplierId}`);
  };

  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No suppliers found.
          </div>
        ) : (
          suppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="cursor-pointer hover:bg-accent/5"
            >
              <CardHeader>
                <CardTitle>{supplier.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {supplier.location.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Factory className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Materials</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {supplier.materials
                          .slice(0, 3)
                          .map((material, index) => (
                            <Badge key={index} variant="secondary">
                              {material}
                            </Badge>
                          ))}
                        {supplier.materials.length > 3 && (
                          <Badge variant="secondary">
                            +{supplier.materials.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Truck className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Transportation</h3>
                      <p className="text-sm text-muted-foreground">
                        {supplier.transportationDetails}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Production Capacity</h3>
                      <p className="text-sm text-muted-foreground">
                        {supplier.productionCapacity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Award className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Certifications</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {supplier.certifications
                          .slice(0, 2)
                          .map((cert, index) => (
                            <Badge key={index} variant="outline">
                              {cert}
                            </Badge>
                          ))}
                        {supplier.certifications.length > 2 && (
                          <Badge variant="outline">
                            +{supplier.certifications.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => onView(supplier.id)}
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this supplier? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // Handle deletion logic here
                  console.log("Deleting supplier:", supplierToDelete);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Table view
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>Transportation</TableHead>
              <TableHead>Production Capacity</TableHead>
              <TableHead>Certifications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No suppliers found.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.location.address}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {supplier.materials.slice(0, 2).map((material, index) => (
                        <Badge key={index} variant="secondary">
                          {material}
                        </Badge>
                      ))}
                      {supplier.materials.length > 2 && (
                        <Badge variant="secondary">
                          +{supplier.materials.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{supplier.transportationDetails}</TableCell>
                  <TableCell>{supplier.productionCapacity}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {supplier.certifications
                        .slice(0, 2)
                        .map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      {supplier.certifications.length > 2 && (
                        <Badge variant="outline">
                          +{supplier.certifications.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => onView(supplier.id)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface SupplierCardProps {
  supplier: Supplier;
  onView: () => void;
  onDelete: () => void;
  isNew?: boolean;
}

function SupplierCard({
  supplier,
  onView,
  onDelete,
  isNew = false,
}: SupplierCardProps) {
  // Calculate a simple score based on certifications and materials
  const score = Math.min(
    100,
    Math.round(
      (supplier.certifications.length * 15 + supplier.materials.length * 10) / 2
    )
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {supplier.name}
              {isNew && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  New
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              {supplier.location.address}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onView}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div>
            <div className="text-sm font-medium mb-1">Materials</div>
            <div className="flex flex-wrap gap-1">
              {supplier.materials.map((material, idx) => (
                <Badge key={idx} variant="secondary">
                  {material}
                </Badge>
              ))}
            </div>
          </div>
          {supplier.certifications.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">Certifications</div>
              <div className="flex flex-wrap gap-1">
                {supplier.certifications.map((cert, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium mb-1">Supplier Score</div>
            <div className="flex items-center gap-2">
              <Progress value={score} className="h-2" />
              <span className={`text-xs font-medium ${getScoreColor(score)}`}>
                {score}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full" onClick={onView}>
          View Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}
