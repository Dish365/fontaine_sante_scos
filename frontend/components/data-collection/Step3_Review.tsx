import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Check, ClipboardList } from "lucide-react";
import { RawMaterial, Supplier } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface Step3ReviewProps {
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  currentMaterial: RawMaterial | null;
  selectedSupplierIds: string[];
  onSwitchToSummary: () => void;
}

export function Step3Review({
  rawMaterials,
  suppliers,
  currentMaterial,
  selectedSupplierIds,
  onSwitchToSummary,
}: Step3ReviewProps) {
  // Filter suppliers based on selectedSupplierIds
  const selectedSuppliers = suppliers.filter((supplier) =>
    selectedSupplierIds.includes(supplier.id)
  );

  // Helper function to format transport modes nicely
  const formatTransportModes = (transportMode: any): React.ReactNode => {
    // Add debugging to see what we're getting
    console.log("Transport mode type:", typeof transportMode);
    console.log("Transport mode value:", transportMode);

    if (!transportMode) return "N/A";

    let modes: string[] = [];

    try {
      // Handle different types of transportMode
      if (typeof transportMode === "string") {
        // If it's a string, split by comma
        modes = transportMode.split(",").map((mode) => mode.trim());
      } else if (Array.isArray(transportMode)) {
        // If it's already an array, use it directly
        modes = transportMode.map((mode) =>
          typeof mode === "string" ? mode : String(mode)
        );
      } else {
        // If it's neither string nor array, convert to string
        return String(transportMode);
      }
    } catch (error) {
      console.error("Error processing transport modes:", error);
      console.error("Value that caused error:", transportMode);
      return "Error processing transport modes";
    }

    // If we have no modes after processing, return N/A
    if (modes.length === 0) return "N/A";

    return (
      <div className="flex flex-wrap gap-1">
        {modes.map((mode, index) => (
          <Badge key={index} variant="outline" className="capitalize">
            {typeof mode === "string" ? mode.toLowerCase() : String(mode)}
          </Badge>
        ))}
      </div>
    );
  };

  // Helper function to format certifications nicely
  const formatCertifications = (certifications: any): React.ReactNode => {
    // Add debugging
    console.log("Certifications type:", typeof certifications);
    console.log("Certifications value:", certifications);

    if (!certifications) return "N/A";

    let certs: string[] = [];

    try {
      if (Array.isArray(certifications)) {
        certs = certifications.map((cert) =>
          typeof cert === "string" ? cert : String(cert)
        );
      } else if (
        typeof certifications === "object" &&
        certifications.certifications
      ) {
        // Handle nested certifications object (from suppliers.json)
        certs = Array.isArray(certifications.certifications)
          ? certifications.certifications
          : [String(certifications.certifications)];
      } else if (typeof certifications === "string") {
        certs = [certifications];
      }
    } catch (error) {
      console.error("Error processing certifications:", error);
      return "Error processing certifications";
    }

    if (certs.length === 0) return "N/A";

    return (
      <div className="flex flex-wrap gap-1">
        {certs.map((cert, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {cert}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Review & Confirm</CardTitle>
          <CardDescription>
            Review all collected information before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-[600px] pr-4">
            {/* Material Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Raw Material Details</h3>
              <Card>
                <CardContent className="pt-6">
                  {currentMaterial && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Name
                        </p>
                        <p className="text-lg">{currentMaterial.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Type
                        </p>
                        <p className="text-lg">{currentMaterial.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Origin
                        </p>
                        <p className="text-lg">{currentMaterial.origin}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Unit
                        </p>
                        <p className="text-lg">{currentMaterial.unit}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Description
                        </p>
                        <p className="text-lg">
                          {currentMaterial.description || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {/* Suppliers Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Associated Suppliers ({selectedSuppliers.length})
              </h3>
              <div className="grid gap-4">
                {selectedSuppliers.map((supplier) => {
                  // Debug the supplier object
                  console.log("Supplier:", supplier);

                  return (
                    <Card key={supplier.id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Name
                            </p>
                            <p className="text-lg">{supplier.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Location
                            </p>
                            <p className="text-lg">
                              {supplier.location.address}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Transport Modes
                            </p>
                            <div className="text-lg">
                              {formatTransportModes(supplier.transportMode)}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Certifications
                            </p>
                            <div className="text-lg">
                              {supplier.quality &&
                              supplier.quality.certifications
                                ? formatCertifications(
                                    supplier.quality.certifications
                                  )
                                : formatCertifications(supplier.certifications)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onSwitchToSummary}
              className="gap-2 mt-4"
            >
              <ClipboardList className="h-4 w-4" /> Data Entry Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
