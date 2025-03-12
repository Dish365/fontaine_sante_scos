import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

export function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        heading="Settings"
        subheading="Configure your sustainability framework dashboard and preferences"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="metrics">Metrics & Indicators</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Data Integrations</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Interface Preferences</CardTitle>
                <CardDescription>
                  Customize how the dashboard looks and functions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="dmy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dashboard Layout</CardTitle>
                <CardDescription>
                  Configure your sustainability dashboard display options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more condensed dashboard layout
                    </p>
                  </div>
                  <Switch id="compact-view" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="default-view">Default Dashboard View</Label>
                  <Select defaultValue="overview">
                    <SelectTrigger id="default-view">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="environmental">
                        Environmental Impact
                      </SelectItem>
                      <SelectItem value="economic">
                        Economic Analysis
                      </SelectItem>
                      <SelectItem value="quality">
                        Quality Assessment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Refresh Rate</Label>
                  <div className="space-y-4">
                    <Slider defaultValue={[30]} max={60} min={5} step={5} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5m</span>
                      <span>30m</span>
                      <span>60m</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics & Indicators Settings */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Metrics Configuration</CardTitle>
              <CardDescription>
                Customize which indicators appear in your dashboard and their
                relative importance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Environmental Metrics</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { id: "carbon", name: "Carbon Footprint", value: 5 },
                    { id: "water", name: "Water Footprint", value: 4 },
                    { id: "land", name: "Land Use Impact", value: 3 },
                    { id: "energy", name: "Energy Usage", value: 4 },
                    { id: "waste", name: "Waste Generation", value: 3 },
                    { id: "toxicity", name: "Toxicity Impact", value: 5 },
                  ].map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={metric.id}>{metric.name}</Label>
                        <Switch id={metric.id} defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Weight
                          </span>
                          <span className="text-sm font-medium">
                            {metric.value}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[metric.value]}
                          max={5}
                          min={1}
                          step={1}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Economic Metrics</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      id: "direct-costs",
                      name: "Direct Material Costs",
                      value: 5,
                    },
                    {
                      id: "transportation",
                      name: "Transportation & Logistics",
                      value: 4,
                    },
                    { id: "storage", name: "Storage Costs", value: 3 },
                    {
                      id: "quality-costs",
                      name: "Quality-Related Costs",
                      value: 4,
                    },
                    {
                      id: "regulatory",
                      name: "Regulatory Compliance Costs",
                      value: 3,
                    },
                  ].map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={metric.id}>{metric.name}</Label>
                        <Switch id={metric.id} defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Weight
                          </span>
                          <span className="text-sm font-medium">
                            {metric.value}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[metric.value]}
                          max={5}
                          min={1}
                          step={1}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quality Metrics</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      id: "quality-param",
                      name: "Quality Parameters",
                      value: 5,
                    },
                    {
                      id: "historical",
                      name: "Historical Performance",
                      value: 4,
                    },
                    {
                      id: "quality-variations",
                      name: "Quality Variations Impact",
                      value: 3,
                    },
                  ].map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={metric.id}>{metric.name}</Label>
                        <Switch id={metric.id} defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Weight
                          </span>
                          <span className="text-sm font-medium">
                            {metric.value}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[metric.value]}
                          max={5}
                          min={1}
                          step={1}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Alert & Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive updates about your
                sustainability indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Methods</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { id: "email", name: "Email Notifications" },
                    { id: "dashboard", name: "Dashboard Alerts" },
                    { id: "browser", name: "Browser Notifications" },
                    { id: "mobile", name: "Mobile App Notifications" },
                  ].map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Label htmlFor={method.id}>{method.name}</Label>
                      </div>
                      <Switch
                        id={method.id}
                        defaultChecked={method.id !== "mobile"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alert Thresholds</h3>
                <p className="text-sm text-muted-foreground">
                  Set thresholds for when you should be notified about metric
                  changes
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="environmental-threshold">
                      Environmental Impact Threshold
                    </Label>
                    <Select defaultValue="10">
                      <SelectTrigger id="environmental-threshold">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5% deviation</SelectItem>
                        <SelectItem value="10">10% deviation</SelectItem>
                        <SelectItem value="15">15% deviation</SelectItem>
                        <SelectItem value="20">20% deviation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="economic-threshold">
                      Economic Impact Threshold
                    </Label>
                    <Select defaultValue="10">
                      <SelectTrigger id="economic-threshold">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5% deviation</SelectItem>
                        <SelectItem value="10">10% deviation</SelectItem>
                        <SelectItem value="15">15% deviation</SelectItem>
                        <SelectItem value="20">20% deviation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality-threshold">
                      Quality Impact Threshold
                    </Label>
                    <Select defaultValue="5">
                      <SelectTrigger id="quality-threshold">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5% deviation</SelectItem>
                        <SelectItem value="10">10% deviation</SelectItem>
                        <SelectItem value="15">15% deviation</SelectItem>
                        <SelectItem value="20">20% deviation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="risk-threshold">
                      Risk Assessment Threshold
                    </Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="risk-threshold">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low risk only</SelectItem>
                        <SelectItem value="medium">
                          Medium risk and above
                        </SelectItem>
                        <SelectItem value="high">High risk only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Notification Frequency
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="notification-frequency">
                    Summary Report Frequency
                  </Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger id="notification-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Integrations Settings */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Data Integration Settings</CardTitle>
              <CardDescription>
                Configure connections to external data sources and APIs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Integrations</h3>
                <div className="space-y-4">
                  {[
                    { id: "erp", name: "ERP System", connected: true },
                    { id: "crm", name: "CRM Platform", connected: true },
                    {
                      id: "supplier-portal",
                      name: "Supplier Portal",
                      connected: true,
                    },
                    {
                      id: "quality-management",
                      name: "Quality Management System",
                      connected: false,
                    },
                    {
                      id: "transport-tracking",
                      name: "Transportation Tracking",
                      connected: false,
                    },
                  ].map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between border p-4 rounded-md"
                    >
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.connected
                            ? "Connected"
                            : "Not connected"}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={
                            integration.connected ? "outline" : "default"
                          }
                        >
                          {integration.connected ? "Configure" : "Connect"}
                        </Button>
                        {integration.connected && (
                          <Button size="sm" variant="destructive">
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Synchronization Schedule
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">
                    Data Synchronization Frequency
                  </Label>
                  <Select defaultValue="4">
                    <SelectTrigger id="sync-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every hour</SelectItem>
                      <SelectItem value="4">Every 4 hours</SelectItem>
                      <SelectItem value="12">Every 12 hours</SelectItem>
                      <SelectItem value="24">Every 24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Add New Integration</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="integration-type">Integration Type</Label>
                    <Select defaultValue="">
                      <SelectTrigger id="integration-type">
                        <SelectValue placeholder="Select integration type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api">REST API</SelectItem>
                        <SelectItem value="database">
                          Database Connection
                        </SelectItem>
                        <SelectItem value="file">File Import</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="integration-name">Integration Name</Label>
                    <Input
                      id="integration-name"
                      placeholder="Enter a name for this integration"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="integration-url">Connection URL</Label>
                    <Input
                      id="integration-url"
                      placeholder="https://api.example.com/v1/"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button>Add Integration</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    placeholder="Sustainability Manager"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select defaultValue="sustainability">
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sustainability">
                        Sustainability
                      </SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="procurement">Procurement</SelectItem>
                      <SelectItem value="quality">Quality Control</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-2">
                  <Button>Update Profile</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="2fa" />
                  <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
                </div>
                <div className="pt-2">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
