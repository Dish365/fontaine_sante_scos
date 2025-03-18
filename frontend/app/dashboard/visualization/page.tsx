"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import RouteVisualization from "@/components/RouteVisualization";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function VisualizationPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-fit"
            onClick={() => router.push("/dashboard/data-collection")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Data Collection
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Supply Chain Route Visualization
              </h1>
              <p className="text-muted-foreground">
                View and analyze routes between suppliers and warehouses
              </p>
            </div>
          </div>

          <Card className="w-full">
            <div className="p-0 sm:p-0">
              <RouteVisualization />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
