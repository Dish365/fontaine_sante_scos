"use client";

import React, { Suspense } from "react";
import { DataCollectionContainer } from "@/components/data-collection/DataCollectionContainer";

function DataCollectionContent() {
  return (
    <main className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <DataCollectionContainer />
      </div>
    </main>
  );
}

export default function DataCollectionPage() {
  return (
    <Suspense fallback={<div>Loading data collection...</div>}>
      <DataCollectionContent />
    </Suspense>
  );
}
