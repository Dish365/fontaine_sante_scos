"use client";

import { Grid2X2, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewToggleProps {
  view: "grid" | "table";
  onViewChange: (view: "grid" | "table") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(value) =>
          value && onViewChange(value as "grid" | "table")
        }
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid2X2 className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Grid view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Table view</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
