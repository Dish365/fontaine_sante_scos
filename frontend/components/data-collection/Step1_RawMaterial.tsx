import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, ArrowRight, Loader2, Search } from "lucide-react";
import { RawMaterial } from "@/types/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Step1Props {
  materialName: string;
  materialType: string;
  materialDescription: string;
  isAddingNewMaterial: boolean;
  selectedExistingMaterialId: string;
  submitSuccess: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  rawMaterials: RawMaterial[];
  loadingRawMaterials: boolean;
  onMaterialNameChange: (value: string) => void;
  onMaterialTypeChange: (value: string) => void;
  onMaterialDescriptionChange: (value: string) => void;
  onAddingNewMaterialChange: (value: boolean) => void;
  onExistingMaterialSelect: (value: string) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function Step1RawMaterial({
  materialName,
  materialType,
  materialDescription,
  isAddingNewMaterial,
  selectedExistingMaterialId,
  submitSuccess,
  isSubmitting,
  errors,
  rawMaterials,
  onMaterialNameChange,
  onMaterialTypeChange,
  onMaterialDescriptionChange,
  onAddingNewMaterialChange,
  onExistingMaterialSelect,
  onSubmit,
}: Step1Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMaterials = rawMaterials.filter((material) =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
              1
            </span>
            Raw Material Details
          </CardTitle>
          <CardDescription>
            Add or select a raw material to begin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={isAddingNewMaterial ? "new" : "existing"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="new"
                onClick={() => onAddingNewMaterialChange(true)}
              >
                Add New
              </TabsTrigger>
              <TabsTrigger
                value="existing"
                onClick={() => onAddingNewMaterialChange(false)}
              >
                Select Existing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <form onSubmit={onSubmit} className="space-y-4 mt-4">
                {/* Material Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={materialName}
                    onChange={(e) => onMaterialNameChange(e.target.value)}
                    placeholder="Enter material name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name}</p>
                  )}
                </div>

                {/* Material Type */}
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Type
                  </label>
                  <Select
                    value={materialType}
                    onValueChange={onMaterialTypeChange}
                  >
                    <SelectTrigger
                      className={errors.type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Legume">Legume</SelectItem>
                      <SelectItem value="Spice">Spice</SelectItem>
                      <SelectItem value="Grain">Grain</SelectItem>
                      <SelectItem value="Vegetable">Vegetable</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-xs">{errors.type}</p>
                  )}
                </div>

                {/* Material Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={materialDescription}
                    onChange={(e) =>
                      onMaterialDescriptionChange(e.target.value)
                    }
                    placeholder="Enter material description"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Processing
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="existing">
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select an existing material
                  </label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedExistingMaterialId
                          ? rawMaterials.find(
                              (material) =>
                                material.id === selectedExistingMaterialId
                            )?.name
                          : "Select a material..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search materials..."
                          onValueChange={setSearchQuery}
                        />
                        <CommandEmpty className="py-6 text-center text-sm">
                          No materials found.
                        </CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-72">
                            {filteredMaterials.map((material) => (
                              <CommandItem
                                key={material.id}
                                value={material.id}
                                onSelect={() => {
                                  onExistingMaterialSelect(material.id);
                                  setOpen(false);
                                }}
                                className="flex items-start gap-2 p-2"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{material.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="secondary">
                                      {material.type}
                                    </Badge>
                                    {material.quantity && material.unit && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          {material.quantity} {material.unit}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {material.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                      {material.description}
                                    </p>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedExistingMaterialId && (
                  <div className="p-4 border rounded-md bg-muted/50 mt-4">
                    <h3 className="font-medium mb-2">Selected Material</h3>
                    {(() => {
                      const material = rawMaterials.find(
                        (m) => m.id === selectedExistingMaterialId
                      );
                      if (!material) return null;
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Name:</span>
                            <span>{material.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Type:</span>
                            <span>{material.type}</span>
                          </div>
                          {material.quantity && material.unit && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                Quantity:
                              </span>
                              <span>
                                {material.quantity} {material.unit}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <Button
                  onClick={onSubmit}
                  disabled={!selectedExistingMaterialId || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Processing
                    </>
                  ) : (
                    <>
                      Continue with Selected Material{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {submitSuccess && (
        <Alert className="fixed bottom-4 right-4 w-auto bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Material has been {isAddingNewMaterial ? "added" : "selected"}{" "}
            successfully.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
