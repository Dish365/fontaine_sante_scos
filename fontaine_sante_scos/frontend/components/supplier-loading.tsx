"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupplierEditSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 pb-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 pb-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="py-3">
              <CardTitle>
                <Skeleton className="h-6 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function SupplierDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SupplierListSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
