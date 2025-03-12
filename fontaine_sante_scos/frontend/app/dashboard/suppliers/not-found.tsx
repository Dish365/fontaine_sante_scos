"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function SuppliersNotFound() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/suppliers">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Not Found</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier Not Found</CardTitle>
          <CardDescription>
            The requested supplier could not be found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The supplier you're looking for may have been deleted or you may
            have followed an invalid link.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/suppliers">
            <Button>Return to Suppliers</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
