"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Filter,
  RefreshCw,
  Save,
  Sliders,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

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

// Define the preferences type
type Preferences = {
  economic: {
    cost: number;
    leadTime: number;
    reliability: number;
  };
  quality: {
    defectRate: number;
    durability: number;
    consistency: number;
  };
  environmental: {
    carbonFootprint: number;
    waterUsage: number;
    wasteProduction: number;
  };
};

// Update function signatures to use Preferences type
const calculateWeightedScore = (
  supplier: SupplierWithEngineResults,
  preferences: Preferences
): number => {
  // Calculate total weights for each category
  const totalEconomicWeight = preferences.economic.cost + 
    preferences.economic.leadTime + 
    preferences.economic.reliability;
  
  const totalQualityWeight = preferences.quality.defectRate + 
    preferences.quality.durability + 
    preferences.quality.consistency;
  
  const totalEnvironmentalWeight = preferences.environmental.carbonFootprint + 
    preferences.environmental.waterUsage + 
    preferences.environmental.wasteProduction;
  
  // Calculate total weight across all categories
  const totalWeight = totalEconomicWeight + totalQualityWeight + totalEnvironmentalWeight;
  
  // Normalize category weights (ensure they sum to 1)
  const economicWeight = totalEconomicWeight / totalWeight;
  const qualityWeight = totalQualityWeight / totalWeight;
  const environmentalWeight = totalEnvironmentalWeight / totalWeight;
  
  // Calculate weighted score with normalized weights
  const weightedScore = (
    supplier.engineResults.economic.score * economicWeight +
    supplier.engineResults.quality.score * qualityWeight +
    supplier.engineResults.environmental.score * environmentalWeight
  );
  
  // Ensure the score is capped at 100
  return Math.min(100, Math.round(weightedScore * 10) / 10);
};

// Gradient descent optimization function
const optimizeWithGradientDescent = (
  suppliers: SupplierWithEngineResults[],
  preferences: Preferences,
  constraints: {
    minEconomicScore?: number;
    minQualityScore?: number;
    minEnvironmentalScore?: number;
  } = {},
  iterations: number = 10
): SupplierWithEngineResults[] => {
  // Initial weights
  const weights = {
    economic: 0.4,
    quality: 0.3,
    environmental: 0.3,
  };

  // Learning rate
  const learningRate = 0.01;

  // Perform gradient descent iterations
  for (let i = 0; i < iterations; i++) {
    // Calculate gradients
    const gradients = {
      economic: 0,
      quality: 0,
      environmental: 0,
    };

    // Calculate scores with current weights
    const scores = suppliers.map((supplier) => {
      const score =
        supplier.engineResults.economic.score * weights.economic +
        supplier.engineResults.quality.score * weights.quality +
        supplier.engineResults.environmental.score * weights.environmental;
      return { supplier, score };
    });

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    // Calculate gradients based on top performers
    const topPerformers = scores.slice(
      0,
      Math.max(1, Math.floor(scores.length * 0.2))
    );

    topPerformers.forEach(({ supplier }) => {
      gradients.economic += supplier.engineResults.economic.score;
      gradients.quality += supplier.engineResults.quality.score;
      gradients.environmental += supplier.engineResults.environmental.score;
    });

    // Normalize gradients
    const totalGradient =
      gradients.economic + gradients.quality + gradients.environmental;
    if (totalGradient > 0) {
      gradients.economic /= totalGradient;
      gradients.quality /= totalGradient;
      gradients.environmental /= totalGradient;
    }

    // Update weights
    weights.economic += learningRate * (gradients.economic - weights.economic);
    weights.quality += learningRate * (gradients.quality - weights.quality);
    weights.environmental +=
      learningRate * (gradients.environmental - weights.environmental);

    // Normalize weights
    const totalWeight =
      weights.economic + weights.quality + weights.environmental;
    weights.economic /= totalWeight;
    weights.quality /= totalWeight;
    weights.environmental /= totalWeight;
  }

  // Apply constraints and sort with optimized weights
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
        b.engineResults.economic.score * weights.economic +
        b.engineResults.quality.score * weights.quality +
        b.engineResults.environmental.score * weights.environmental -
        (a.engineResults.economic.score * weights.economic +
          a.engineResults.quality.score * weights.quality +
          a.engineResults.environmental.score * weights.environmental)
    );
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

// Add color constants for charts
const CHART_COLORS = {
  economic: "#3b82f6", // blue
  quality: "#10b981", // green
  environmental: "#f59e0b", // amber
  primary: "#3b82f6", // blue
  secondary: "#10b981", // green
  environmental_focus: "#f59e0b", // amber
};

// Add new types for supplier search and filtering
type SupplierSearchFilters = {
  searchTerm: string;
  location: string;
  minScore: number;
  maxScore: number;
};

type PaginationState = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
};

// Add supplier search component
const SearchableSupplierList = ({
  suppliers,
  selectedSuppliers,
  onSupplierSelect,
}: {
  suppliers: SupplierWithEngineResults[];
  selectedSuppliers: string[];
  onSupplierSelect: (supplierId: string) => void;
}) => {
  const [filters, setFilters] = useState<SupplierSearchFilters>({
    searchTerm: "",
    location: "",
    minScore: 0,
    maxScore: 100,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: suppliers.length,
  });

  // Filter suppliers based on search criteria
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch = supplier.name
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());
      const matchesLocation = filters.location
        ? supplier.location
            .toLowerCase()
            .includes(filters.location.toLowerCase())
        : true;
      const totalScore =
        (supplier.engineResults.economic.score +
          supplier.engineResults.quality.score +
          supplier.engineResults.environmental.score) /
        3;
      const matchesScore =
        totalScore >= filters.minScore && totalScore <= filters.maxScore;

      return matchesSearch && matchesLocation && matchesScore;
    });
  }, [suppliers, filters]);

  // Calculate pagination
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredSuppliers.slice(startIndex, endIndex);
  }, [filteredSuppliers, pagination]);

  // Update total items when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalItems: filteredSuppliers.length,
      currentPage: 1,
    }));
  }, [filteredSuppliers]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search suppliers..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
          />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Filter by location..."
            className="w-full px-4 py-2 border rounded-md"
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min score"
            className="w-full px-4 py-2 border rounded-md"
            value={filters.minScore}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minScore: parseInt(e.target.value) || 0,
              }))
            }
          />
          <input
            type="number"
            placeholder="Max score"
            className="w-full px-4 py-2 border rounded-md"
            value={filters.maxScore}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxScore: parseInt(e.target.value) || 100,
              }))
            }
          />
        </div>
        <div className="text-sm text-muted-foreground flex items-center">
          {filteredSuppliers.length} suppliers found
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedSuppliers.map((supplier) => {
          const totalScore =
            (supplier.engineResults.economic.score +
              supplier.engineResults.quality.score +
              supplier.engineResults.environmental.score) /
            3;

          return (
            <Card
              key={supplier.id}
              className={`cursor-pointer transition-all ${
                selectedSuppliers.includes(supplier.id)
                  ? "border-primary"
                  : "border-border"
              }`}
              onClick={() => onSupplierSelect(supplier.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{supplier.name}</CardTitle>
                <CardDescription>{supplier.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-sm">{totalScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={totalScore} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedSuppliers.includes(supplier.id)}
                      onCheckedChange={() => onSupplierSelect(supplier.id)}
                    />
                    <Label>Include in analysis</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {paginatedSuppliers.length} of {filteredSuppliers.length}{" "}
            suppliers
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.max(1, prev.currentPage - 1),
              }))
            }
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {pagination.currentPage} of{" "}
            {Math.ceil(pagination.totalItems / pagination.itemsPerPage)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.min(
                  Math.ceil(prev.totalItems / prev.itemsPerPage),
                  prev.currentPage + 1
                ),
              }))
            }
            disabled={
              pagination.currentPage ===
              Math.ceil(pagination.totalItems / pagination.itemsPerPage)
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function TradeoffPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Add state for test data toggle
  const [useTestData, setUseTestData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierWithEngineResults[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [showDetailedFactors, setShowDetailedFactors] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    primary: SupplierWithEngineResults | null;
    secondary: SupplierWithEngineResults | null;
    environmental: SupplierWithEngineResults | null;
  }>({
    primary: null,
    secondary: null,
    environmental: null
  });
  const [activeTab, setActiveTab] = useState("preferences");

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

  // State for constraints
  const [constraints, setConstraints] = useState({
    minEconomicScore: 70,
    minQualityScore: 70,
    minEnvironmentalScore: 70,
  });

  // Default values for reset functionality
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

  const defaultSelectedSuppliers = ["supplier-1", "supplier-2", "supplier-3"];

  const defaultConstraints = {
    minEconomicScore: 70,
    minQualityScore: 70,
    minEnvironmentalScore: 70,
  };

  // Calculate optimized results - only using gradient descent
  const optimizedResults = useMemo(() => {
    return optimizeWithGradientDescent(
      mockEngineResults,
      preferences,
      constraints
    );
  }, [preferences, constraints]);

  // Generate recommendations based on optimized results
  useEffect(() => {
    if (optimizedResults.length > 0) {
      // Find primary recommendation (highest overall score)
      const primary = optimizedResults[0];

      // Find secondary recommendation (highest economic score)
      const secondary =
        [...optimizedResults]
          .sort(
            (a, b) =>
              b.engineResults.economic.score - a.engineResults.economic.score
          )
          .find((s) => s.id !== primary.id) || null;

      // Find environmental recommendation (highest environmental score)
      const environmental =
        [...optimizedResults]
          .sort(
            (a, b) =>
              b.engineResults.environmental.score -
              a.engineResults.environmental.score
          )
          .find((s) => s.id !== primary.id) || null;

      setRecommendations({
        primary,
        secondary,
        environmental,
      });
    }
  }, [optimizedResults]);

  // Handle general preference change
  const handleGeneralPreferenceChange = (
    category: "economic" | "quality" | "environmental",
    value: number
  ) => {
    setPreferences((prev) => {
      const updatedPreferences = { ...prev };
      if (category === "economic") {
        updatedPreferences.economic = {
          cost: value,
          leadTime: value,
          reliability: value,
        };
      } else if (category === "quality") {
        updatedPreferences.quality = {
          defectRate: value,
          durability: value,
          consistency: value,
        };
      } else if (category === "environmental") {
        updatedPreferences.environmental = {
          carbonFootprint: value,
          waterUsage: value,
          wasteProduction: value,
        };
      }
      return updatedPreferences;
    });
  };

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

  // Test data for suppliers with engine results
  const testSuppliers: SupplierWithEngineResults[] = [
    {
      id: "test-supplier-1",
      name: "Eco Farms Co.",
      location: "Montreal, Canada",
      engineResults: {
        economic: {
          cost: 85,
          leadTime: 90,
          reliability: 88,
          score: 87.7
        },
        quality: {
          defectRate: 95,
          durability: 92,
          consistency: 90,
          score: 92.3
        },
        environmental: {
          carbonFootprint: 95,
          waterUsage: 92,
          wasteProduction: 94,
          score: 93.7
        }
      }
    },
    {
      id: "test-supplier-2",
      name: "Green Valley Foods",
      location: "Toronto, Canada",
      engineResults: {
        economic: {
          cost: 78,
          leadTime: 85,
          reliability: 82,
          score: 81.7
        },
        quality: {
          defectRate: 88,
          durability: 85,
          consistency: 87,
          score: 86.7
        },
        environmental: {
          carbonFootprint: 90,
          waterUsage: 88,
          wasteProduction: 89,
          score: 89
        }
      }
    },
    {
      id: "test-supplier-3",
      name: "Sustainable Solutions",
      location: "Vancouver, Canada",
      engineResults: {
        economic: {
          cost: 92,
          leadTime: 88,
          reliability: 90,
          score: 90
        },
        quality: {
          defectRate: 91,
          durability: 89,
          consistency: 92,
          score: 90.7
        },
        environmental: {
          carbonFootprint: 96,
          waterUsage: 94,
          wasteProduction: 95,
          score: 95
        }
      }
    }
  ];

  // Update getSupplierData to handle test data
  const getSupplierData = async () => {
    if (useTestData) {
      setSelectedSuppliers(testSuppliers.map(supplier => supplier.id));
      setRecommendations({
        primary: testSuppliers[0],
        secondary: testSuppliers[1],
        environmental: testSuppliers[2],
      });
      return;
    }

    try {
      // Your existing API call logic...
      const response = await fetch("/api/suppliers");
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      const data = await response.json() as SupplierWithEngineResults[];
      setSelectedSuppliers(data.map((supplier: SupplierWithEngineResults) => supplier.id));
      setRecommendations({
        primary: data[0],
        secondary: data[1],
        environmental: data[2],
      });
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch supplier data",
        variant: "destructive",
      });
    }
  };

  // Update useEffect to react to useTestData changes
  useEffect(() => {
    getSupplierData();
  }, [useTestData]); // Add useTestData as a dependency

  // Handle save configuration
  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "Your trade-off preferences have been saved.",
    });
  };

  // Handle reset functionality
  const handleReset = () => {
    // Reset all form fields to default values
    setPreferences(defaultPreferences);
    setSelectedSuppliers(defaultSelectedSuppliers);
    setConstraints(defaultConstraints);

    // Reset recommendations
    setRecommendations({
      primary: null,
      secondary: null,
      environmental: null,
    });

    // Transition back to preferences tab
    setActiveTab("preferences");

    // Show toast notification
    toast({
      title: "Form Reset",
      description: "All preferences have been reset to default values.",
    });
  };

  // Update handleSubmit to use test data or real data
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      let supplierData;
      if (useTestData) {
        supplierData = testSuppliers;
      } else {
        const response = await fetch("/api/suppliers");
        if (!response.ok) {
          throw new Error("Failed to fetch suppliers");
        }
        supplierData = await response.json();
      }

      const optimizedResults = optimizeWithGradientDescent(
        supplierData,
        preferences,
        constraints
      );

      setSuppliers(optimizedResults);
      setRecommendations({
        primary: optimizedResults[0],
        secondary: optimizedResults[1],
        environmental: optimizedResults.find(s => 
          s.engineResults.environmental.score === 
          Math.max(...optimizedResults.map(r => r.engineResults.environmental.score))
        ) || optimizedResults[2]
      });

      toast({
        title: "Analysis Complete",
        description: "Trade-off analysis has been calculated based on engine results.",
      });

      setActiveTab("results");
    } catch (error) {
      console.error("Error in trade-off analysis:", error);
      toast({
        title: "Error",
        description: "Failed to calculate trade-off analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Type-safe supplier mapping function
  const renderSupplierCard = (supplier: SupplierWithEngineResults) => (
    <Card key={supplier.id} className="relative">
      <CardHeader>
        <CardTitle>{supplier.name}</CardTitle>
        <CardDescription>{supplier.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Economic Metrics */}
          <div>
            <h4 className="font-medium mb-2">Economic Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cost Efficiency</span>
                <span>{supplier.engineResults.economic.cost}%</span>
              </div>
              <Progress value={supplier.engineResults.economic.cost} className="h-2" />
              
              {showDetailedFactors && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Lead Time</span>
                    <span>{supplier.engineResults.economic.leadTime}%</span>
                  </div>
                  <Progress value={supplier.engineResults.economic.leadTime} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Reliability</span>
                    <span>{supplier.engineResults.economic.reliability}%</span>
                  </div>
                  <Progress value={supplier.engineResults.economic.reliability} className="h-2" />
                </>
              )}
            </div>
          </div>

          {/* Quality Metrics */}
          <div>
            <h4 className="font-medium mb-2">Quality Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Quality</span>
                <span>{supplier.engineResults.quality.score}%</span>
              </div>
              <Progress value={supplier.engineResults.quality.score} className="h-2" />
              
              {showDetailedFactors && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Defect Rate</span>
                    <span>{supplier.engineResults.quality.defectRate}%</span>
                  </div>
                  <Progress value={supplier.engineResults.quality.defectRate} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Consistency</span>
                    <span>{supplier.engineResults.quality.consistency}%</span>
                  </div>
                  <Progress value={supplier.engineResults.quality.consistency} className="h-2" />
                </>
              )}
            </div>
          </div>

          {/* Environmental Metrics */}
          <div>
            <h4 className="font-medium mb-2">Environmental Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Impact</span>
                <span>{supplier.engineResults.environmental.score}%</span>
              </div>
              <Progress value={supplier.engineResults.environmental.score} className="h-2" />
              
              {showDetailedFactors && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Carbon Footprint</span>
                    <span>{supplier.engineResults.environmental.carbonFootprint}%</span>
                  </div>
                  <Progress value={supplier.engineResults.environmental.carbonFootprint} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Water Usage</span>
                    <span>{supplier.engineResults.environmental.waterUsage}%</span>
                  </div>
                  <Progress value={supplier.engineResults.environmental.waterUsage} className="h-2" />
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-background relative">
      <TradeoffPageStyles />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>

            {/* Add Test Data Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useTestData"
                checked={useTestData}
                onCheckedChange={(checked) => setUseTestData(checked as boolean)}
              />
              <Label htmlFor="useTestData" className="text-sm">
                Use Test Data
              </Label>
            </div>
          </div>

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
              <Button variant="outline" className="gap-2" onClick={handleReset}>
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
                  <SearchableSupplierList
                    suppliers={mockEngineResults}
                    selectedSuppliers={selectedSuppliers}
                    onSupplierSelect={handleSupplierSelection}
                  />
                </CardContent>
              </Card>

              {/* Add Show/Hide Detailed Factors Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowDetailedFactors(!showDetailedFactors)}
                  >
                    {showDetailedFactors ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Hide Detailed Factors
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Show Detailed Factors
                      </>
                    )}
                  </Button>
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
                        <Label>Economic Importance</Label>
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
                          handleGeneralPreferenceChange("economic", value[0])
                        }
                      />
                    </div>

                    {showDetailedFactors && (
                      <div className="space-y-4">
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
                              handlePreferenceChange(
                                "economic",
                                "cost",
                                value[0]
                              )
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
                      </div>
                    )}
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
                        <Label>Quality Importance</Label>
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
                          handleGeneralPreferenceChange("quality", value[0])
                        }
                      />
                    </div>

                    {showDetailedFactors && (
                      <div className="space-y-4">
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
                      </div>
                    )}
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
                        <Label>Environmental Importance</Label>
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
                          handleGeneralPreferenceChange(
                            "environmental",
                            value[0]
                          )
                        }
                      />
                    </div>

                    {showDetailedFactors && (
                      <div className="space-y-4">
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
                      </div>
                    )}
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

              {/* Optimization Method Selection - Replace with info card */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Method</CardTitle>
                  <CardDescription>
                    This analysis uses gradient descent optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="gradient"
                        name="optimization"
                        value="gradient"
                        checked={true}
                        disabled
                        className="h-4 w-4"
                      />
                      <Label htmlFor="gradient">
                        Gradient Descent (Advanced)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gradient descent uses machine learning to iteratively find
                      the optimal weights for each factor based on the data.
                    </p>
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
              {/* Recommendations Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Recommendations</CardTitle>
                  <CardDescription>
                    Based on your preferences and constraints, here are our
                    recommended suppliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Primary Recommendation */}
                    <Card
                      className={
                        recommendations.primary ? "border-primary" : ""
                      }
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Primary Recommendation
                        </CardTitle>
                        <CardDescription>
                          Best overall balance of factors
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recommendations.primary ? (
                          <div className="space-y-2">
                            <p className="font-medium">
                              {recommendations.primary.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {recommendations.primary.location}
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Economic Score</span>
                                <span>
                                  {
                                    recommendations.primary.engineResults
                                      .economic.score
                                  }
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  recommendations.primary.engineResults.economic
                                    .score
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No primary recommendation available
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Secondary Recommendation */}
                    <Card
                      className={
                        recommendations.secondary ? "border-primary" : ""
                      }
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Secondary Recommendation
                        </CardTitle>
                        <CardDescription>
                          Alternative option with good balance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recommendations.secondary ? (
                          <div className="space-y-2">
                            <p className="font-medium">
                              {recommendations.secondary.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {recommendations.secondary.location}
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Economic Score</span>
                                <span>
                                  {
                                    recommendations.secondary.engineResults
                                      .economic.score
                                  }
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  recommendations.secondary.engineResults
                                    .economic.score
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No secondary recommendation available
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Environmental Focus Recommendation */}
                    <Card
                      className={
                        recommendations.environmental ? "border-primary" : ""
                      }
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Environmental Focus
                        </CardTitle>
                        <CardDescription>
                          Best environmental performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recommendations.environmental ? (
                          <div className="space-y-2">
                            <p className="font-medium">
                              {recommendations.environmental.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {recommendations.environmental.location}
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Environmental Score</span>
                                <span>
                                  {
                                    recommendations.environmental.engineResults
                                      .environmental.score
                                  }
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  recommendations.environmental.engineResults
                                    .environmental.score
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No environmental focus recommendation available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Comparative Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparative Analysis</CardTitle>
                  <CardDescription>
                    Visual comparison of supplier scores across different
                    factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={optimizedResults.map((supplier) => ({
                          name: supplier.name,
                          Economic: supplier.engineResults.economic.score,
                          Quality: supplier.engineResults.quality.score,
                          Environmental:
                            supplier.engineResults.environmental.score,
                        }))}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Economic" fill={CHART_COLORS.economic} />
                        <Bar dataKey="Quality" fill={CHART_COLORS.quality} />
                        <Bar
                          dataKey="Environmental"
                          fill={CHART_COLORS.environmental}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Factor Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Factor Breakdown</CardTitle>
                  <CardDescription>
                    Detailed breakdown of each factor&apos;s contribution to the
                    overall score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Economic Factors Pie Chart */}
                    <div className="h-[300px]">
                      <h3 className="text-lg font-medium mb-4">
                        Economic Factors
                      </h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              {
                                name: "Cost",
                                value: preferences.economic.cost,
                              },
                              {
                                name: "Lead Time",
                                value: preferences.economic.leadTime,
                              },
                              {
                                name: "Reliability",
                                value: preferences.economic.reliability,
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              {
                                name: "Cost",
                                value: preferences.economic.cost,
                              },
                              {
                                name: "Lead Time",
                                value: preferences.economic.leadTime,
                              },
                              {
                                name: "Reliability",
                                value: preferences.economic.reliability,
                              },
                            ].map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS.economic}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Quality Factors Pie Chart */}
                    <div className="h-[300px]">
                      <h3 className="text-lg font-medium mb-4">
                        Quality Factors
                      </h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              {
                                name: "Defect Rate",
                                value: preferences.quality.defectRate,
                              },
                              {
                                name: "Durability",
                                value: preferences.quality.durability,
                              },
                              {
                                name: "Consistency",
                                value: preferences.quality.consistency,
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              {
                                name: "Defect Rate",
                                value: preferences.quality.defectRate,
                              },
                              {
                                name: "Durability",
                                value: preferences.quality.durability,
                              },
                              {
                                name: "Consistency",
                                value: preferences.quality.consistency,
                              },
                            ].map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS.quality}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Environmental Factors Pie Chart */}
                    <div className="h-[300px]">
                      <h3 className="text-lg font-medium mb-4">
                        Environmental Factors
                      </h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              {
                                name: "Carbon Footprint",
                                value:
                                  preferences.environmental.carbonFootprint,
                              },
                              {
                                name: "Water Usage",
                                value: preferences.environmental.waterUsage,
                              },
                              {
                                name: "Waste Production",
                                value:
                                  preferences.environmental.wasteProduction,
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              {
                                name: "Carbon Footprint",
                                value:
                                  preferences.environmental.carbonFootprint,
                              },
                              {
                                name: "Water Usage",
                                value: preferences.environmental.waterUsage,
                              },
                              {
                                name: "Waste Production",
                                value:
                                  preferences.environmental.wasteProduction,
                              },
                            ].map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS.environmental}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Supplier Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Supplier Analysis</CardTitle>
                  <CardDescription>
                    Comprehensive breakdown of each supplier&apos;s performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {optimizedResults.map((supplier, index) => (
                      <AccordionItem
                        key={supplier.id}
                        value={`supplier-${index}`}
                      >
                        <AccordionTrigger className="text-lg">
                          {supplier.name} - Overall Score:{" "}
                          {calculateWeightedScore(supplier, preferences)}%
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Economic Metrics */}
                              <div className="space-y-2">
                                <h4 className="font-medium">
                                  Economic Metrics
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Cost</span>
                                    <span>
                                      {supplier.engineResults.economic.cost}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={supplier.engineResults.economic.cost}
                                    className="h-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Lead Time</span>
                                    <span>
                                      {supplier.engineResults.economic.leadTime}
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.economic.leadTime
                                    }
                                    className="h-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Reliability</span>
                                    <span>
                                      {
                                        supplier.engineResults.economic
                                          .reliability
                                      }
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.economic
                                        .reliability
                                    }
                                    className="h-2"
                                  />
                                </div>
                              </div>

                              {/* Quality Metrics */}
                              <div className="space-y-2">
                                <h4 className="font-medium">Quality Metrics</h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Defect Rate</span>
                                    <span>
                                      {
                                        supplier.engineResults.quality
                                          .defectRate
                                      }
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.quality.defectRate
                                    }
                                    className="h-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Durability</span>
                                    <span>
                                      {
                                        supplier.engineResults.quality
                                          .durability
                                      }
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.quality.durability
                                    }
                                    className="h-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Consistency</span>
                                    <span>
                                      {
                                        supplier.engineResults.quality
                                          .consistency
                                      }
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.quality.consistency
                                    }
                                    className="h-2"
                                  />
                                </div>
                              </div>

                              {/* Environmental Metrics */}
                              <div className="space-y-2">
                                <h4 className="font-medium">
                                  Environmental Metrics
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Carbon Footprint</span>
                                    <span>
                                      {
                                        supplier.engineResults.environmental
                                          .carbonFootprint
                                      }
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.environmental
                                        .carbonFootprint
                                    }
                                    className="h-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Water Usage</span>
                                    <span>
                                      {
                                        supplier.engineResults.environmental
                                          .waterUsage
                                      }
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.environmental
                                        .waterUsage
                                    }
                                    className="h-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Waste Production</span>
                                    <span>
                                      {
                                        supplier.engineResults.environmental
                                          .wasteProduction
                                      }
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      supplier.engineResults.environmental
                                        .wasteProduction
                                    }
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
