"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { RawMaterialForm } from "../forms/RawMaterialForm";
import { StepProgress } from "../StepProgress";

interface RawMaterialStepProps {
  onNext: () => void;
  onReset: () => void;
  isSubmitting: boolean;
}

export function RawMaterialStep({
  onNext,
  onReset,
  isSubmitting,
}: RawMaterialStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
              1
            </span>
            Raw Material Information
          </CardTitle>
          <CardDescription>
            Enter details about the raw material used in your supply chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RawMaterialForm />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      <div className="space-y-6">
        <StepProgress currentStep={1} />
        {/* Additional cards for recent materials and help can be added here */}
      </div>
    </div>
  );
}
