"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[] | undefined; // Update type to handle undefined
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value = [], // Add default empty array
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (valueToRemove: string) => {
    onChange((value || []).filter((v) => v !== valueToRemove));
  };

  const selectedLabels = (value || []).map(
    (val) => options.find((option) => option.value === val)?.label || val
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedLabels.length === 0 && placeholder}
            {selectedLabels.map((label) => (
              <Badge
                variant="secondary"
                key={label}
                className="mr-1 mb-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnselect(
                    options.find((option) => option.label === label)?.value ||
                      ""
                  );
                }}
              >
                {label}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}`} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(
                    (value || []).includes(option.value)
                      ? (value || []).filter((v) => v !== option.value)
                      : [...(value || []), option.value]
                  );
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    (value || []).includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
