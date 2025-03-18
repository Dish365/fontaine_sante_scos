"use client";

import { useState } from "react";
import {
  Building2,
  Warehouse,
  Route,
  Package,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  Settings as SettingsIcon,
  Database,
  Bell,
  Mail,
  Globe,
  Lock,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Mock data for demonstration
const mockSuppliers = [
  {
    id: 1,
    name: "Heartland Organic Farms",
    location: "Iowa, USA",
    contact: "John Doe",
    status: "Active",
  },
  {
    id: 2,
    name: "Global Organics Limited",
    location: "Saskatchewan, Canada",
    contact: "Jane Smith",
    status: "Active",
  },
];

const mockWarehouses = [
  {
    id: 1,
    name: "Central Distribution Center",
    location: "Montreal, QC",
    capacity: "50,000 sq ft",
    status: "Active",
  },
  {
    id: 2,
    name: "Eastern Warehouse",
    location: "Quebec City, QC",
    capacity: "35,000 sq ft",
    status: "Active",
  },
];

const mockRoutes = [
  {
    id: 1,
    origin: "Montreal, QC",
    destination: "Quebec City, QC",
    distance: "250",
    status: "Active",
  },
  {
    id: 2,
    origin: "Iowa, USA",
    destination: "Montreal, QC",
    distance: "1,500",
    status: "Active",
  },
];

const mockMaterials = [
  {
    id: 1,
    name: "Organic Quinoa",
    category: "Grains",
    unit: "kg",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Chia Seeds",
    category: "Seeds",
    unit: "kg",
    status: "Low Stock",
  },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-fit"
            asChild
          >
            <a href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-8"
        >
          <div className="flex justify-center w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger
                value="general"
                className="flex items-center gap-2 flex-1"
              >
                <SettingsIcon className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="flex items-center gap-2 flex-1"
              >
                <Database className="h-4 w-4" />
                Data Management
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-8">
            {/* Application Settings */}
            <div className="grid gap-8">
              <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                  <CardDescription>
                    Configure general application preferences and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Theme Preference</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred color theme
                        </p>
                      </div>
                      <Select defaultValue="system">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                  </div>

                  {/* Language Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Label>Language</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred language
                        </p>
                      </div>
                      <Select defaultValue="en">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <Label>Notifications</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Manage notification preferences
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">
                          Email Notifications
                        </Label>
                        <Switch id="email-notifications" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">
                          Push Notifications
                        </Label>
                        <Switch id="push-notifications" />
                      </div>
                    </div>
                    <Separator />
                  </div>

                  {/* Security */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <Label>Security</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Configure security settings
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="two-factor">
                          Two-Factor Authentication
                        </Label>
                        <Switch id="two-factor" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="session-timeout">Session Timeout</Label>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select timeout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>

              {/* System Information */}
              <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>
                    View details about the system and application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Version
                      </Label>
                      <p>1.0.0</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Last Updated
                      </Label>
                      <p>March 16, 2024</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Environment
                      </Label>
                      <p>Production</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Status
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <p>Operational</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-8">
            <div className="flex justify-end gap-2 px-4 max-w-4xl mx-auto">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            </div>

            <Tabs defaultValue="suppliers" className="w-full space-y-6">
              <div className="flex justify-center w-full">
                <TabsList className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger
                    value="suppliers"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Suppliers
                  </TabsTrigger>
                  <TabsTrigger
                    value="warehouses"
                    className="flex items-center gap-2"
                  >
                    <Warehouse className="h-4 w-4" />
                    Warehouses
                  </TabsTrigger>
                  <TabsTrigger
                    value="routes"
                    className="flex items-center gap-2"
                  >
                    <Route className="h-4 w-4" />
                    Routes
                  </TabsTrigger>
                  <TabsTrigger
                    value="materials"
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Materials
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Suppliers Tab */}
              <TabsContent value="suppliers" className="space-y-4">
                <Card className="w-full max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Supplier Management</CardTitle>
                        <CardDescription>
                          Manage your supplier information and details
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supplier
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Supplier</DialogTitle>
                            <DialogDescription>
                              Enter the details for the new supplier
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Supplier Name</Label>
                              <Input
                                id="name"
                                placeholder="Enter supplier name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                placeholder="Enter location"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="contact">
                                Contact Information
                              </Label>
                              <Input
                                id="contact"
                                placeholder="Enter contact details"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Supplier</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockSuppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                              <TableCell>{supplier.name}</TableCell>
                              <TableCell>{supplier.location}</TableCell>
                              <TableCell>{supplier.contact}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {supplier.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Warehouses Tab */}
              <TabsContent value="warehouses" className="space-y-4">
                <Card className="w-full max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Warehouse Management</CardTitle>
                        <CardDescription>
                          Manage your warehouse locations and capacity
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Warehouse
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Warehouse</DialogTitle>
                            <DialogDescription>
                              Enter the details for the new warehouse
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Warehouse Name</Label>
                              <Input
                                id="name"
                                placeholder="Enter warehouse name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                placeholder="Enter location"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="capacity">Capacity</Label>
                              <Input
                                id="capacity"
                                type="number"
                                placeholder="Enter capacity"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Warehouse</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockWarehouses.map((warehouse) => (
                            <TableRow key={warehouse.id}>
                              <TableCell>{warehouse.name}</TableCell>
                              <TableCell>{warehouse.location}</TableCell>
                              <TableCell>{warehouse.capacity}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {warehouse.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Routes Tab */}
              <TabsContent value="routes" className="space-y-4">
                <Card className="w-full max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Route Management</CardTitle>
                        <CardDescription>
                          Manage transportation routes between locations
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Route
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Route</DialogTitle>
                            <DialogDescription>
                              Enter the details for the new route
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="origin">Origin</Label>
                              <Input
                                id="origin"
                                placeholder="Select origin location"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="destination">Destination</Label>
                              <Input
                                id="destination"
                                placeholder="Select destination location"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="distance">Distance (km)</Label>
                              <Input
                                id="distance"
                                type="number"
                                placeholder="Enter distance"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Route</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Origin</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Distance (km)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockRoutes.map((route) => (
                            <TableRow key={route.id}>
                              <TableCell>{route.origin}</TableCell>
                              <TableCell>{route.destination}</TableCell>
                              <TableCell>{route.distance}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{route.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Materials Tab */}
              <TabsContent value="materials" className="space-y-4">
                <Card className="w-full max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Material Management</CardTitle>
                        <CardDescription>
                          Manage raw materials and their specifications
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Material
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Material</DialogTitle>
                            <DialogDescription>
                              Enter the details for the new material
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Material Name</Label>
                              <Input
                                id="name"
                                placeholder="Enter material name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="category">Category</Label>
                              <Input
                                id="category"
                                placeholder="Enter category"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="unit">Unit of Measurement</Label>
                              <Input id="unit" placeholder="Enter unit" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Material</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockMaterials.map((material) => (
                            <TableRow key={material.id}>
                              <TableCell>{material.name}</TableCell>
                              <TableCell>{material.category}</TableCell>
                              <TableCell>{material.unit}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {material.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
