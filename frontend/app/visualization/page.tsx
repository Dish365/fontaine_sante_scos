"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function VisualizationPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Supply Chain Visualization
          </h1>
          <p className="text-muted-foreground">
            View your supply chain network
          </p>
        </div>
        <Button onClick={() => router.push("/data-collection")}>
          Back to Data Collection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-md">
            <p className="text-muted-foreground">
              Supply chain visualization will be displayed here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 