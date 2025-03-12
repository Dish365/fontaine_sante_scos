"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

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
            The requested supplier could not be found. It may have been deleted
            or you may have followed an invalid link.
          </p>
          <div className="flex justify-center mt-4">
            <Button asChild>
              <Link href="/dashboard/suppliers">Return to Suppliers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
