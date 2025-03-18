"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  ChevronDown,
  Filter,
  RefreshCw,
  Save,
  Sliders,
  BarChart,
  LineChart,
  PieChart,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

// Updated TradeoffPageStyles component with better responsive styles
const TradeoffPageStyles = () => (
  <style jsx global>{`
    /* Ensure the trade-off page is properly positioned */
    main {
      position: relative !important;
      z-index: 10 !important;
      background-color: var(--background) !important;
      min-height: 100vh !important;
    }

    /* Fix any potential overflow issues */
    .container {
      position: relative !important;
      z-index: 10 !important;
      background-color: var(--background) !important;
      width: 100% !important;
      max-width: 1200px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding: 1rem !important;
    }

    /* Ensure dialogs appear above everything */
    [role="dialog"] {
      z-index: 50 !important;
      position: fixed !important;
    }

    /* Fix for the sidebar */
    [role="navigation"] {
      z-index: 5 !important;
    }

    /* Ensure interactive elements are clickable */
    a,
    button,
    [role="button"],
    .slider,
    .checkbox {
      position: relative !important;
      z-index: 15 !important;
    }

    /* Responsive grid layout */
    .trade-off-grid {
      display: grid !important;
      gap: 1.5rem !important;
      grid-template-columns: 1fr !important;
    }

    @media (min-width: 1024px) {
      .trade-off-grid {
        grid-template-columns: 1fr 1fr 1fr !important;
      }
    }

    /* Responsive supplier cards */
    .supplier-card-grid {
      display: grid !important;
      gap: 1rem !important;
      grid-template-columns: 1fr !important;
    }

    @media (min-width: 640px) {
      .supplier-card-grid {
        grid-template-columns: 1fr 1fr !important;
      }
    }

    @media (min-width: 1024px) {
      .supplier-card-grid {
        grid-template-columns: 1fr 1fr 1fr 1fr !important;
      }
    }

    /* Responsive comparison grid */
    .comparison-grid {
      display: grid !important;
      gap: 1.5rem !important;
      grid-template-columns: 1fr !important;
    }

    @media (min-width: 1024px) {
      .comparison-grid {
        grid-template-columns: 1fr 1fr !important;
      }
    }
  `}</style>
);

// Add new types for engine results
type EngineResults = {
  economic: {
    cost: number;
    leadTime: number;
    reliability: number;
    score: number;
  };
  quality: {
    defectRate: number;
    durability: number;
    consistency: number;
    score: number;
  };
  environmental: {
    carbonFootprint: number;
    waterUsage: number;
    wasteProduction: number;
    score: number;
  };
};

type SupplierWithEngineResults = {
  id: string;
  name: string;
  location: string;
  engineResults: EngineResults;
};

// Add optimization functions
const calculateWeightedScore = (
  supplier: SupplierWithEngineResults,
  preferences: typeof defaultPreferences
): number => {
  const economicWeight =
    (preferences.economic.cost +
      preferences.economic.leadTime +
      preferences.economic.reliability) /
    300;
  const qualityWeight =
    (preferences.quality.defectRate +
      preferences.quality.durability +
      preferences.quality.consistency) /
    300;
  const environmentalWeight =
    (preferences.environmental.carbonFootprint +
      preferences.environmental.waterUsage +
      preferences.environmental.wasteProduction) /
    300;

  return (
    supplier.engineResults.economic.score * economicWeight +
    supplier.engineResults.quality.score * qualityWeight +
    supplier.engineResults.environmental.score * environmentalWeight
  );
};

const optimizeSupplierSelection = (
  suppliers: SupplierWithEngineResults[],
  preferences: typeof defaultPreferences,
  constraints: {
    minEconomicScore?: number;
    minQualityScore?: number;
    minEnvironmentalScore?: number;
  } = {}
): SupplierWithEngineResults[] => {
  return suppliers
    .filter((supplier) => {
      if (
        constraints.minEconomicScore &&
        supplier.engineResults.economic.score < constraints.minEconomicScore
      ) {
        return false;
      }
      if (
        constraints.minQualityScore &&
        supplier.engineResults.quality.score < constraints.minQualityScore
      ) {
        return false;
      }
      if (
        constraints.minEnvironmentalScore &&
        supplier.engineResults.environmental.score <
          constraints.minEnvironmentalScore
      ) {
        return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        calculateWeightedScore(b, preferences) -
        calculateWeightedScore(a, preferences)
    );
};

// Default preferences
const defaultPreferences = {
  economic: {
    cost: 50,
    leadTime: 50,
    reliability: 50,
  },
  quality: {
    defectRate: 50,
    durability: 50,
    consistency: 50,
  },
  environmental: {
    carbonFootprint: 50,
    waterUsage: 50,
    wasteProduction: 50,
  },
};

// Mock engine results (replace with actual API calls)
const mockEngineResults: SupplierWithEngineResults[] = [
  {
    id: "supplier-1",
    name: "Heartland Organic Farms",
    location: "Iowa, USA",
    engineResults: {
      economic: {
        cost: 85,
        leadTime: 75,
        reliability: 80,
        score: 78,
      },
      quality: {
        defectRate: 90,
        durability: 85,
        consistency: 88,
        score: 85,
      },
      environmental: {
        carbonFootprint: 95,
        waterUsage: 90,
        wasteProduction: 92,
        score: 92,
      },
    },
  },
  {
    id: "supplier-2",
    name: "Global Organics Limited",
    location: "Saskatchewan, Canada",
    engineResults: {
      economic: {
        cost: 82,
        leadTime: 88,
        reliability: 85,
        score: 82,
      },
      quality: {
        defectRate: 78,
        durability: 82,
        consistency: 80,
        score: 79,
      },
      environmental: {
        carbonFootprint: 88,
        waterUsage: 85,
        wasteProduction: 90,
        score: 88,
      },
    },
  },
  {
    id: "supplier-3",
    name: "EcoHarvest Suppliers",
    location: "Oregon, USA",
    engineResults: {
      economic: {
        cost: 72,
        leadTime: 78,
        reliability: 75,
        score: 75,
      },
      quality: {
        defectRate: 92,
        durability: 95,
        consistency: 90,
        score: 92,
      },
      environmental: {
        carbonFootprint: 85,
        waterUsage: 88,
        wasteProduction: 82,
        score: 85,
      },
    },
  },
  {
    id: "supplier-4",
    name: "Sustainable Foods Co.",
    location: "California, USA",
    engineResults: {
      economic: {
        cost: 90,
        leadTime: 85,
        reliability: 88,
        score: 90,
      },
      quality: {
        defectRate: 75,
        durability: 78,
        consistency: 72,
        score: 76,
      },
      environmental: {
        carbonFootprint: 70,
        waterUsage: 75,
        wasteProduction: 72,
        score: 72,
      },
    },
  },
  {
    id: "supplier-5",
    name: "Pure Harvest Organics",
    location: "Vermont, USA",
    engineResults: {
      economic: {
        cost: 68,
        leadTime: 72,
        reliability: 70,
        score: 70,
      },
      quality: {
        defectRate: 88,
        durability: 85,
        consistency: 87,
        score: 87,
      },
      environmental: {
        carbonFootprint: 92,
        waterUsage: 95,
        wasteProduction: 90,
        score: 93,
      },
    },
  },
  {
    id: "supplier-6",
    name: "Nature's Best Supply",
    location: "British Columbia, Canada",
    engineResults: {
      economic: {
        cost: 78,
        leadTime: 82,
        reliability: 85,
        score: 81,
      },
      quality: {
        defectRate: 85,
        durability: 88,
        consistency: 82,
        score: 85,
      },
      environmental: {
        carbonFootprint: 82,
        waterUsage: 85,
        wasteProduction: 80,
        score: 82,
      },
    },
  },
];

export default function TradeoffPage() {
  const router = useRouter();
  // State for preferences
  const [preferences, setPreferences] = useState({
    economic: {
      cost: 50,
      leadTime: 50,
      reliability: 50,
    },
    quality: {
      defectRate: 50,
      durability: 50,
      consistency: 50,
    },
    environmental: {
      carbonFootprint: 50,
      waterUsage: 50,
      wasteProduction: 50,
    },
  });

  // State for selected suppliers
  const [selectedSuppliers, setSelectedSuppliers] = useState([
    "supplier-1",
    "supplier-2",
    "supplier-3",
  ]);

  // State for active tab
  const [activeTab, setActiveTab] = useState("preferences");

  const [constraints, setConstraints] = useState({
    minEconomicScore: 70,
    minQualityScore: 70,
    minEnvironmentalScore: 70,
  });

  // Calculate optimized results
  const optimizedResults = useMemo(() => {
    return optimizeSupplierSelection(
      mockEngineResults,
      preferences,
      constraints
    );
  }, [preferences, constraints]);

  // Handle preference change
  const handlePreferenceChange = (
    category: "economic" | "quality" | "environmental",
    factor: string,
    value: number
  ) => {
    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category],
        [factor]: value,
      },
    });
  };

  // Handle supplier selection
  const handleSupplierSelection = (supplierId: string) => {
    if (selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers(selectedSuppliers.filter((id) => id !== supplierId));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplierId]);
    }
  };

  // Update handleSubmit function
  const handleSubmit = async () => {
    try {
      // In a real implementation, fetch actual engine results here
      const optimizedSuppliers = optimizeSupplierSelection(
        mockEngineResults,
        preferences,
        constraints
      );

      toast({
        title: "Analysis Complete",
        description:
          "Trade-off analysis has been calculated based on engine results.",
      });

      setActiveTab("results");
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to calculate trade-off analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save configuration
  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "Your trade-off preferences have been saved.",
    });
  };

  return (
    <main className="min-h-screen bg-background relative">
      <TradeoffPageStyles />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-fit"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Trade-off Analysis
              </h1>
              <p className="text-muted-foreground">
                Set preferences and analyze trade-offs between different factors
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSaveConfig}
              >
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preferences">Set Preferences</TabsTrigger>
              <TabsTrigger value="results">View Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Suppliers for Comparison</CardTitle>
                  <CardDescription>
                    Choose the suppliers you want to include in your trade-off
                    analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="supplier-card-grid">
                    {mockEngineResults.map((supplier) => (
                      <Card
                        key={supplier.id}
                        className={`cursor-pointer transition-all ${
                          selectedSuppliers.includes(supplier.id)
                            ? "border-primary"
                            : "border-border"
                        }`}
                        onClick={() => handleSupplierSelection(supplier.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {supplier.name}
                          </CardTitle>
                          <CardDescription>{supplier.location}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedSuppliers.includes(supplier.id)}
                              onCheckedChange={() =>
                                handleSupplierSelection(supplier.id)
                              }
                            />
                            <Label>Include in analysis</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="trade-off-grid">
                {/* Economic Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Economic Factors
                    </CardTitle>
                    <CardDescription>
                      Set importance of economic considerations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Cost</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.economic.cost}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.economic.cost]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange("economic", "cost", value[0])
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Lead Time</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.economic.leadTime}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.economic.leadTime]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "economic",
                            "leadTime",
                            value[0]
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Reliability</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.economic.reliability}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.economic.reliability]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "economic",
                            "reliability",
                            value[0]
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Filter className="mr-2 h-5 w-5" />
                      Quality Factors
                    </CardTitle>
                    <CardDescription>
                      Set importance of quality considerations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Defect Rate</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.quality.defectRate}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.quality.defectRate]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "quality",
                            "defectRate",
                            value[0]
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Durability</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.quality.durability}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.quality.durability]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "quality",
                            "durability",
                            value[0]
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Consistency</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.quality.consistency}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.quality.consistency]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "quality",
                            "consistency",
                            value[0]
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Environmental Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sliders className="mr-2 h-5 w-5" />
                      Environmental Factors
                    </CardTitle>
                    <CardDescription>
                      Set importance of environmental considerations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Carbon Footprint</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.environmental.carbonFootprint}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.environmental.carbonFootprint]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "environmental",
                            "carbonFootprint",
                            value[0]
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Water Usage</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.environmental.waterUsage}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.environmental.waterUsage]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "environmental",
                            "waterUsage",
                            value[0]
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Waste Production</Label>
                        <span className="text-sm text-muted-foreground">
                          {preferences.environmental.wasteProduction}%
                        </span>
                      </div>
                      <Slider
                        value={[preferences.environmental.wasteProduction]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            "environmental",
                            "wasteProduction",
                            value[0]
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Constraints Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Minimum Score Requirements</CardTitle>
                  <CardDescription>
                    Set minimum acceptable scores for each category. Suppliers
                    not meeting these requirements will be filtered out.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Minimum Economic Score</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[constraints.minEconomicScore]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) =>
                            setConstraints({
                              ...constraints,
                              minEconomicScore: value[0],
                            })
                          }
                        />
                        <span className="w-12 text-sm">
                          {constraints.minEconomicScore}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Quality Score</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[constraints.minQualityScore]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) =>
                            setConstraints({
                              ...constraints,
                              minQualityScore: value[0],
                            })
                          }
                        />
                        <span className="w-12 text-sm">
                          {constraints.minQualityScore}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Environmental Score</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[constraints.minEnvironmentalScore]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) =>
                            setConstraints({
                              ...constraints,
                              minEnvironmentalScore: value[0],
                            })
                          }
                        />
                        <span className="w-12 text-sm">
                          {constraints.minEnvironmentalScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button size="lg" onClick={handleSubmit}>
                  Calculate Trade-offs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trade-off Analysis Results</CardTitle>
                  <CardDescription>
                    Based on your preferences, here are the supplier rankings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Tabs defaultValue="overall">
                      <TabsList>
                        <TabsTrigger value="overall">
                          Overall Ranking
                        </TabsTrigger>
                        <TabsTrigger value="economic">Economic</TabsTrigger>
                        <TabsTrigger value="quality">Quality</TabsTrigger>
                        <TabsTrigger value="environmental">
                          Environmental
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="overall" className="pt-4">
                        <div className="space-y-4">
                          {optimizedResults
                            .filter((s) => selectedSuppliers.includes(s.id))
                            .sort(
                              (a, b) =>
                                b.engineResults.economic.score -
                                a.engineResults.economic.score
                            )
                            .map((supplier, index) => (
                              <div
                                key={supplier.id}
                                className="flex items-center space-x-4"
                              >
                                <div className="font-bold text-lg w-8">
                                  #{index + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    {supplier.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {supplier.location}
                                  </p>
                                </div>
                                <div className="w-32 text-right">
                                  <span className="font-bold text-lg">
                                    {supplier.engineResults.economic.score}%
                                  </span>
                                </div>
                                <div className="w-1/3">
                                  <Progress
                                    value={
                                      supplier.engineResults.economic.score
                                    }
                                    className="h-3"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="economic" className="pt-4">
                        <div className="space-y-4">
                          {optimizedResults
                            .filter((s) => selectedSuppliers.includes(s.id))
                            .sort(
                              (a, b) =>
                                b.engineResults.economic.score -
                                a.engineResults.economic.score
                            )
                            .map((supplier, index) => (
                              <div
                                key={supplier.id}
                                className="flex items-center space-x-4"
                              >
                                <div className="font-bold text-lg w-8">
                                  #{index + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    {supplier.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {supplier.location}
                                  </p>
                                </div>
                                <div className="w-32 text-right">
                                  <span className="font-bold text-lg">
                                    {supplier.engineResults.economic.score}%
                                  </span>
                                </div>
                                <div className="w-1/3">
                                  <Progress
                                    value={
                                      supplier.engineResults.economic.score
                                    }
                                    className="h-3"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="quality" className="pt-4">
                        <div className="space-y-4">
                          {optimizedResults
                            .filter((s) => selectedSuppliers.includes(s.id))
                            .sort(
                              (a, b) =>
                                b.engineResults.quality.score -
                                a.engineResults.quality.score
                            )
                            .map((supplier, index) => (
                              <div
                                key={supplier.id}
                                className="flex items-center space-x-4"
                              >
                                <div className="font-bold text-lg w-8">
                                  #{index + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    {supplier.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {supplier.location}
                                  </p>
                                </div>
                                <div className="w-32 text-right">
                                  <span className="font-bold text-lg">
                                    {supplier.engineResults.quality.score}%
                                  </span>
                                </div>
                                <div className="w-1/3">
                                  <Progress
                                    value={supplier.engineResults.quality.score}
                                    className="h-3"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="environmental" className="pt-4">
                        <div className="space-y-4">
                          {optimizedResults
                            .filter((s) => selectedSuppliers.includes(s.id))
                            .sort(
                              (a, b) =>
                                b.engineResults.environmental.score -
                                a.engineResults.environmental.score
                            )
                            .map((supplier, index) => (
                              <div
                                key={supplier.id}
                                className="flex items-center space-x-4"
                              >
                                <div className="font-bold text-lg w-8">
                                  #{index + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    {supplier.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {supplier.location}
                                  </p>
                                </div>
                                <div className="w-32 text-right">
                                  <span className="font-bold text-lg">
                                    {supplier.engineResults.environmental.score}
                                    %
                                  </span>
                                </div>
                                <div className="w-1/3">
                                  <Progress
                                    value={
                                      supplier.engineResults.environmental.score
                                    }
                                    className="h-3"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              <div className="comparison-grid">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart className="mr-2 h-5 w-5" />
                      Comparative Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center border rounded-md p-6">
                      <div className="text-center space-y-4">
                        <BarChart className="h-16 w-16 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Bar chart visualization would appear here, showing
                          side-by-side comparison of suppliers across all
                          factors.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="mr-2 h-5 w-5" />
                      Factor Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center border rounded-md p-6">
                      <div className="text-center space-y-4">
                        <PieChart className="h-16 w-16 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Pie chart visualization would appear here, showing the
                          breakdown of factors for the top-ranked supplier.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="economic">
                      <AccordionTrigger>Economic Factors</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-4 font-medium">
                            <div>Supplier</div>
                            <div>Cost</div>
                            <div>Lead Time</div>
                            <div>Reliability</div>
                          </div>
                          <Separator />
                          {optimizedResults
                            .filter((s) => selectedSuppliers.includes(s.id))
                            .map((supplier) => (
                              <div
                                key={supplier.id}
                                className="grid grid-cols-4 gap-4"
                              >
                                <div>{supplier.name}</div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="quality">
                      <AccordionTrigger>Quality Factors</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-4 font-medium">
                            <div>Supplier</div>
                            <div>Defect Rate</div>
                            <div>Durability</div>
                            <div>Consistency</div>
                          </div>
                          <Separator />
                          {optimizedResults
                            .filter((s) => selectedSuppliers.includes(s.id))
                            .map((supplier) => (
                              <div
                                key={supplier.id}
                                className="grid grid-cols-4 gap-4"
                              >
                                <div>{supplier.name}</div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="environmental">
                      <AccordionTrigger>Environmental Factors</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-4 font-medium">
                            <div>Supplier</div>
                            <div>Carbon Footprint</div>
                            <div>Water Usage</div>
                            <div>Waste Production</div>
                          </div>
                          <Separator />
                          {optimizedResults
                            .filter((s) => selectedSuppliers.includes(s.id))
                            .map((supplier) => (
                              <div
                                key={supplier.id}
                                className="grid grid-cols-4 gap-4"
                              >
                                <div>{supplier.name}</div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                                <div>
                                  <Badge variant="outline">
                                    {70 + Math.floor(Math.random() * 20)}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline">Export Results</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
