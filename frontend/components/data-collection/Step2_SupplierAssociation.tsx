import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, Search } from "lucide-react";
import { RawMaterial } from "@/lib/data-collection-utils";
import { Supplier } from "@/types/types";

// Google Maps API key - in a real app, this would be stored in environment variables
const GOOGLE_MAPS_API_KEY = "AIzaSyBIB1C7--wwP2jGAzdmRAgf_8MNs-ygf8Y";

// Define Google Maps types to fix TypeScript errors
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => AutocompleteService;
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
            OVER_QUERY_LIMIT: string;
            REQUEST_DENIED: string;
            INVALID_REQUEST: string;
            UNKNOWN_ERROR: string;
          };
        };
        Geocoder: new () => Geocoder;
        GeocoderStatus: {
          OK: string;
          ZERO_RESULTS: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          INVALID_REQUEST: string;
          UNKNOWN_ERROR: string;
        };
      };
    };
  }
}

// Add console logging utility for debugging
const logDebug = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(`[${timestamp}] [GoogleMaps] ${message}`);
  if (data) {
    console.log(data);
  }
};

interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface AutocompleteService {
  getPlacePredictions(
    request: { input: string; types?: string[] },
    callback: (
      predictions: AutocompletePrediction[] | null,
      status: string
    ) => void
  ): void;
}

interface GeocoderResult {
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface Geocoder {
  geocode(
    request: { placeId: string },
    callback: (results: GeocoderResult[] | null, status: string) => void
  ): void;
}

// Define the address suggestion type
interface AddressSuggestion {
  id: string;
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

// Define the coordinates type
interface Coordinates {
  lat: number;
  lng: number;
}

interface Step2Props {
  currentMaterial: RawMaterial | null;
  isAddingNewSupplier: boolean;
  newSupplierName: string;
  newSupplierAddress: string;
  newSupplierTransportModes: string[];
  newSupplierTransportation: string;
  newSupplierCapacity: string;
  newSupplierCapacityUnit: string;
  newSupplierCertifications: string;
  newSupplierCertificationsList: string[];
  newSupplierPerformance: string;
  selectedExistingSupplierIds: string[];
  isSubmitting: boolean;
  isGeocodingAddress: boolean;
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  onBack: () => void;
  onAddSupplier: () => Promise<void>;
  onAssociateSuppliers: () => void;
  onNewSupplierNameChange: (value: string) => void;
  onNewSupplierAddressChange: (value: string) => void;
  onNewSupplierTransportModesChange: (modes: string[]) => void;
  onNewSupplierTransportationChange: (value: string) => void;
  onNewSupplierCapacityChange: (value: string) => void;
  onNewSupplierCapacityUnitChange: (value: string) => void;
  onNewSupplierCertificationsChange: (value: string) => void;
  onNewSupplierCertificationsListChange: (certs: string[]) => void;
  onNewSupplierPerformanceChange: (value: string) => void;
  onSelectedSuppliersChange: (ids: string[]) => void;
  onGeocodeAddress: () => void;
  onTabChange: (tab: string) => void;
  onCoordinatesUpdate?: (coords: Coordinates | null) => void;
  defaultTab?: string;
}

export function Step2SupplierAssociation({
  currentMaterial,
  newSupplierName,
  newSupplierAddress,
  newSupplierTransportModes,
  newSupplierCapacity,
  newSupplierCapacityUnit,
  newSupplierCertificationsList,
  selectedExistingSupplierIds,
  isSubmitting,
  suppliers,
  onBack,
  onAddSupplier,
  onAssociateSuppliers,
  onNewSupplierNameChange,
  onNewSupplierAddressChange,
  onNewSupplierTransportModesChange,
  onNewSupplierCapacityChange,
  onNewSupplierCapacityUnitChange,
  onNewSupplierCertificationsListChange,
  onSelectedSuppliersChange,
  onTabChange,
  onCoordinatesUpdate,
  defaultTab = "new",
}: Step2Props) {
  const [newSupplierError, setNewSupplierError] = useState("");
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [isLoadingAddressSuggestions, setIsLoadingAddressSuggestions] =
    useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [placesAutocompleteService, setPlacesAutocompleteService] =
    useState<AutocompleteService | null>(null);
  const [geocodingService, setGeocodingService] = useState<Geocoder | null>(
    null
  );
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [manualCoordinates, setManualCoordinates] = useState({
    lat: "",
    lng: "",
  });

  // Initialize Google Maps services
  useEffect(() => {
    // Check if script is already loaded
    if (scriptLoaded) {
      logDebug("Script already loaded, skipping initialization");
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;

    // Set a timeout to check if the API loaded successfully
    const apiLoadTimeout = setTimeout(() => {
      if (!window.google || !window.google.maps) {
        logDebug("Google Maps API failed to load within timeout period");
        handleMapsApiError(
          "Google Maps API failed to load within the expected time"
        );
      }
    }, 10000); // 10 seconds timeout

    // Function to retry initialization if it fails
    const retryInitialization = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        logDebug(
          `Retrying initialization (attempt ${retryCount}/${maxRetries})...`
        );
        setTimeout(initializeServices, 1000); // Wait 1 second before retrying
      } else {
        logDebug("Max retries reached, giving up");
        handleMapsApiError(
          "Failed to initialize Google Maps services after multiple attempts"
        );
      }
    };

    // Load Google Maps API script
    const loadGoogleMapsScript = () => {
      // Check if script is already in the document
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api"]'
      );

      if (existingScript) {
        logDebug("Google Maps script already exists in document");
        initializeServices();
        return;
      }

      // Create a global function that will be called when the script loads
      window.initGoogleMapsServices = function () {
        logDebug("Google Maps initialization function called");
        setScriptLoaded(true);
        initializeServices();
        clearTimeout(apiLoadTimeout);
      };

      logDebug("Loading Google Maps script...");
      const script = document.createElement("script");
      // Don't use callback parameter, use onload instead
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.id = "google-maps-script";

      script.onload = () => {
        logDebug("Google Maps script loaded, initializing services");
        // Call our initialization function after a short delay to ensure the API is fully loaded
        setTimeout(() => {
          if (window.initGoogleMapsServices) {
            window.initGoogleMapsServices();
          }
        }, 100);
      };

      script.onerror = (error) => {
        console.error("Error loading Google Maps script:", error);
        handleMapsApiError("Failed to load Google Maps services");
        clearTimeout(apiLoadTimeout);
      };

      // Handle script load errors
      window.gm_authFailure = () => {
        logDebug("Google Maps authentication failure");
        handleMapsApiError("Google Maps API key authentication failed");
        clearTimeout(apiLoadTimeout);
      };

      document.head.appendChild(script);
      logDebug("Google Maps script added to document head");
    };

    const handleMapsApiError = (message: string) => {
      toast({
        title: "Google Maps API Error",
        description: message + ". Using manual address entry instead.",
        variant: "destructive",
      });
      // Set script as loaded but with error to prevent further attempts
      setScriptLoaded(true);
      setApiAvailable(false);
    };

    const initializeServices = () => {
      logDebug("Attempting to initialize Google Maps services");

      // Check if Google Maps is available
      if (!window.google || !window.google.maps) {
        logDebug("Google Maps API not available yet");
        retryInitialization();
        return;
      }

      try {
        // Make sure the places library is available
        if (!window.google.maps.places) {
          logDebug("Google Maps Places API not available");
          handleMapsApiError(
            "Google Maps Places API is not available. It may not be enabled for this API key."
          );
          return;
        }

        logDebug("Creating AutocompleteService instance");
        const autocompleteService =
          new window.google.maps.places.AutocompleteService();
        setPlacesAutocompleteService(autocompleteService);

        logDebug("Creating Geocoder instance");
        const geocoder = new window.google.maps.Geocoder();
        setGeocodingService(geocoder);

        logDebug("Google Maps services initialized successfully");

        // Set API as available
        setApiAvailable(true);
      } catch (error) {
        console.error("Error initializing Google Maps services:", error);
        retryInitialization();
      }
    };

    // Try to initialize immediately if Google Maps is already loaded
    if (window.google && window.google.maps) {
      logDebug("Google Maps already available, initializing services");
      initializeServices();
      setScriptLoaded(true);
    } else {
      logDebug("Google Maps not available, loading script");
      loadGoogleMapsScript();
    }

    // Cleanup
    return () => {
      // We don't remove the script on cleanup as it might be used by other components
      logDebug("Cleaning up Google Maps services");
      // Clear the timeout to prevent it from firing after component unmount
      clearTimeout(apiLoadTimeout);
      // Remove the global functions
      if (window.initGoogleMapsServices) {
        window.initGoogleMapsServices = undefined;
      }
      if (window.gm_authFailure) {
        window.gm_authFailure = undefined;
      }
    };
  }, [scriptLoaded]);

  // Debug logging for suppliers and selected IDs
  useEffect(() => {
    console.log(
      "Suppliers:",
      suppliers.map((s) => ({ id: s.id, name: s.name }))
    );
    console.log("Selected supplier IDs:", selectedExistingSupplierIds);
    console.log("Current material:", currentMaterial);
  }, [suppliers, selectedExistingSupplierIds, currentMaterial]);

  // If there are already selected suppliers, default to the existing tab
  useEffect(() => {
    if (selectedExistingSupplierIds.length > 0 && currentTab === "new") {
      setCurrentTab("existing");
      onTabChange("existing");
    }
  }, [selectedExistingSupplierIds, currentTab, onTabChange]);

  // Debounce function for address search
  useEffect(() => {
    if (!placesAutocompleteService) {
      logDebug("Places autocomplete service not available yet");

      // If the API is not available and we're in manual mode, don't show this message
      if (apiAvailable) {
        console.log("Waiting for Places API to initialize...");
      }
      return;
    }

    const handler = setTimeout(() => {
      if (newSupplierAddress) {
        logDebug(
          `Debounce timer expired, fetching suggestions for: "${newSupplierAddress}"`
        );
        fetchAddressSuggestions(newSupplierAddress);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [newSupplierAddress, placesAutocompleteService, apiAvailable]);

  // Function to fetch address suggestions using Google Places API
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      logDebug(
        `Not fetching suggestions: query too short (length=${query?.length})`
      );
      setAddressSuggestions([]);
      return;
    }

    if (!placesAutocompleteService) {
      logDebug(
        "Places autocomplete service not available, can't fetch suggestions"
      );
      // If the API was supposed to be available but the service isn't, show an error
      if (apiAvailable) {
        toast({
          title: "API Service Unavailable",
          description:
            "The address search service is not available. Please enter the address manually.",
          variant: "destructive",
        });
        // Switch to manual mode
        setApiAvailable(false);
      }
      return;
    }

    logDebug(`Fetching address suggestions for: "${query}"`);
    setIsLoadingAddressSuggestions(true);
    try {
      const request = {
        input: query,
        types: ["address"], // Restrict to addresses only
      };

      placesAutocompleteService.getPlacePredictions(
        request,
        (predictions, status) => {
          logDebug(`Autocomplete status: ${status}`);

          // Make sure window.google is defined before accessing it
          if (
            !window.google ||
            !window.google.maps ||
            !window.google.maps.places
          ) {
            console.error("Google Maps API not available");
            handlePlacesApiError("Google Maps API not available");
            return;
          }

          if (
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !predictions
          ) {
            console.error("Error fetching address suggestions:", status);

            // If we get REQUEST_DENIED, the API key doesn't have Places API enabled
            if (
              status ===
              window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED
            ) {
              handlePlacesApiError(
                "The Places API is not enabled for this API key"
              );
            }

            setAddressSuggestions([]);
            setIsLoadingAddressSuggestions(false);
            return;
          }

          logDebug(`Received ${predictions.length} address suggestions`);
          const suggestions: AddressSuggestion[] = predictions.map(
            (prediction) => {
              const mainText =
                prediction.structured_formatting?.main_text || "";
              const secondaryText =
                prediction.structured_formatting?.secondary_text || "";

              return {
                id: prediction.place_id,
                placeId: prediction.place_id,
                description: prediction.description,
                mainText,
                secondaryText,
              };
            }
          );

          setAddressSuggestions(suggestions);
          setIsLoadingAddressSuggestions(false);
        }
      );
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      handlePlacesApiError("Failed to fetch address suggestions");
    }
  };

  // Handle Places API errors
  const handlePlacesApiError = (message: string) => {
    toast({
      title: "Places API Error",
      description: message + ". Switching to manual address entry.",
      variant: "destructive",
    });
    setApiAvailable(false);
    setIsLoadingAddressSuggestions(false);
  };

  // Function to handle address selection and geocode it
  const handleAddressSelect = async (placeId: string) => {
    const selected = addressSuggestions.find(
      (addr) => addr.placeId === placeId
    );
    if (!selected || !geocodingService) {
      console.error(
        "Cannot geocode: missing selected address or geocoding service"
      );
      return;
    }

    console.log("Selected address:", selected);
    setSelectedAddress(selected);
    onNewSupplierAddressChange(selected.description);

    // Geocode the selected address using Google Geocoding API
    setIsLoadingAddressSuggestions(true);
    try {
      geocodingService.geocode(
        { placeId: selected.placeId },
        (results, status) => {
          if (
            status !== window.google.maps.GeocoderStatus.OK ||
            !results ||
            results.length === 0
          ) {
            console.error("Error geocoding address:", status);
            toast({
              title: "Error",
              description: "Failed to geocode address",
              variant: "destructive",
            });
            setIsLoadingAddressSuggestions(false);
            return;
          }

          console.log("Geocoding results:", results);
          const location = results[0].geometry.location;
          const coords = {
            lat: location.lat(),
            lng: location.lng(),
          };

          console.log("Coordinates:", coords);
          setCoordinates(coords);

          // Call the onCoordinatesUpdate prop if it exists
          if (onCoordinatesUpdate) {
            onCoordinatesUpdate(coords);
          }

          // Generate a static map URL using Google Maps Static API
          const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lng}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}`;
          setMapUrl(mapUrl);

          toast({
            title: "Address Selected",
            description: "Address coordinates have been retrieved successfully",
          });

          setIsLoadingAddressSuggestions(false);
        }
      );
    } catch (error) {
      console.error("Error geocoding address:", error);
      toast({
        title: "Error",
        description: "Failed to geocode address",
        variant: "destructive",
      });
      setIsLoadingAddressSuggestions(false);
    }
  };

  const handleNewSupplierSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!newSupplierName.trim()) {
      setNewSupplierError("Supplier name is required");
      return;
    }
    if (!newSupplierAddress.trim()) {
      setNewSupplierError("Supplier address is required");
      return;
    }
    setNewSupplierError("");

    try {
      // Call the parent component's onAddSupplier function
      await onAddSupplier();
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      onTabChange("existing"); // Switch to existing suppliers tab after successful addition
    } catch (error) {
      console.error("Error in handleNewSupplierSubmit:", error);
      setNewSupplierError("Failed to add supplier. Please try again.");
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  // Handle checkbox change for supplier selection
  const handleSupplierCheckboxChange = (
    supplierId: string,
    checked: boolean
  ) => {
    console.log(
      `Checkbox change: supplierId=${supplierId}, checked=${checked}`
    );

    let newSelection: string[];
    if (checked) {
      // Add supplier if not already selected
      newSelection = [
        ...selectedExistingSupplierIds.filter((id) => id !== supplierId),
        supplierId,
      ];
    } else {
      // Remove supplier if selected
      newSelection = selectedExistingSupplierIds.filter(
        (id) => id !== supplierId
      );
    }

    console.log("New selection:", newSelection);
    onSelectedSuppliersChange(newSelection);
  };

  // Handle manual coordinates input
  const handleManualCoordinatesChange = (
    type: "lat" | "lng",
    value: string
  ) => {
    setManualCoordinates((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const applyManualCoordinates = () => {
    try {
      const lat = parseFloat(manualCoordinates.lat);
      const lng = parseFloat(manualCoordinates.lng);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates");
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error("Coordinates out of range");
      }

      const coords = { lat, lng };
      setCoordinates(coords);

      // Call the onCoordinatesUpdate prop if it exists
      if (onCoordinatesUpdate) {
        onCoordinatesUpdate(coords);
      }

      // Generate a static map URL using Google Maps Static API
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lng}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}`;
      setMapUrl(mapUrl);

      toast({
        title: "Coordinates Applied",
        description: "Manual coordinates have been applied successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid coordinates format",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
              2
            </span>
            Supplier Association
          </CardTitle>
          <CardDescription>
            Associate suppliers with {currentMaterial?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={currentTab}
            className="w-full"
            value={currentTab}
            onValueChange={(value) => {
              setCurrentTab(value);
              onTabChange(value);
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="new">Add New Supplier</TabsTrigger>
              <TabsTrigger value="existing">Select Existing</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="supplierName" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="supplierName"
                    value={newSupplierName}
                    onChange={(e) => onNewSupplierNameChange(e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="supplierAddress"
                    className="text-sm font-medium"
                  >
                    Address
                  </label>
                  <div className="relative">
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Input
                          id="supplierAddress"
                          value={newSupplierAddress}
                          onChange={(e) =>
                            onNewSupplierAddressChange(e.target.value)
                          }
                          placeholder={
                            apiAvailable
                              ? "Search for an address"
                              : "Enter address manually"
                          }
                          className="pr-10"
                        />
                        {apiAvailable ? (
                          isLoadingAddressSuggestions ? (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          )
                        ) : (
                          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {apiAvailable && addressSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1">
                        <ul className="py-1 max-h-60 overflow-auto">
                          {addressSuggestions.map((suggestion) => (
                            <li
                              key={suggestion.placeId}
                              className="px-3 py-2 hover:bg-muted cursor-pointer"
                              onClick={() =>
                                handleAddressSelect(suggestion.placeId)
                              }
                            >
                              <div className="font-medium">
                                {suggestion.mainText}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {suggestion.secondaryText}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Manual coordinates input when API is not available */}
                  {!apiAvailable && (
                    <div className="mt-2 p-3 border rounded-md bg-muted/30">
                      <h4 className="text-sm font-medium mb-2">
                        Manual Coordinates (Optional)
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="latitude"
                            className="text-xs text-muted-foreground"
                          >
                            Latitude (-90 to 90)
                          </label>
                          <Input
                            id="latitude"
                            value={manualCoordinates.lat}
                            onChange={(e) =>
                              handleManualCoordinatesChange(
                                "lat",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 45.5017"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="longitude"
                            className="text-xs text-muted-foreground"
                          >
                            Longitude (-180 to 180)
                          </label>
                          <Input
                            id="longitude"
                            value={manualCoordinates.lng}
                            onChange={(e) =>
                              handleManualCoordinatesChange(
                                "lng",
                                e.target.value
                              )
                            }
                            placeholder="e.g. -73.5673"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={applyManualCoordinates}
                      >
                        Apply Coordinates
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: You can find coordinates using Google Maps by
                        right-clicking on a location and selecting
                        &quot;What&apos;s here?&quot;
                      </p>
                    </div>
                  )}

                  {/* Map preview */}
                  {selectedAddress && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="p-3 bg-muted flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">
                          {selectedAddress.description}
                        </span>
                      </div>
                      <div className="h-[200px] bg-muted/50 relative">
                        {mapUrl ? (
                          <img
                            src={mapUrl}
                            alt="Map location"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              Map preview unavailable
                            </p>
                          </div>
                        )}
                        {coordinates && (
                          <div className="absolute bottom-2 right-2 bg-background/90 text-xs p-2 rounded-md">
                            Lat: {coordinates.lat.toFixed(6)}, Lng:{" "}
                            {coordinates.lng.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show map preview for manual coordinates too */}
                  {!selectedAddress && coordinates && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="p-3 bg-muted flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">
                          {newSupplierAddress || "Manual Coordinates"}
                        </span>
                      </div>
                      <div className="h-[200px] bg-muted/50 relative">
                        {mapUrl ? (
                          <img
                            src={mapUrl}
                            alt="Map location"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              Map preview unavailable
                            </p>
                          </div>
                        )}
                        {coordinates && (
                          <div className="absolute bottom-2 right-2 bg-background/90 text-xs p-2 rounded-md">
                            Lat: {coordinates.lat.toFixed(6)}, Lng:{" "}
                            {coordinates.lng.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport Modes</label>
                  <MultiSelect
                    options={[
                      { label: "Truck", value: "truck" },
                      { label: "Train", value: "train" },
                      { label: "Ship", value: "ship" },
                      { label: "Airplane", value: "airplane" },
                    ]}
                    selected={newSupplierTransportModes}
                    onChange={onNewSupplierTransportModesChange}
                    placeholder="Select transport modes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Capacity</label>
                    <Input
                      type="number"
                      value={newSupplierCapacity}
                      onChange={(e) =>
                        onNewSupplierCapacityChange(e.target.value)
                      }
                      placeholder="Enter capacity"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Select
                      value={newSupplierCapacityUnit}
                      onValueChange={onNewSupplierCapacityUnitChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="tonnes">Tonnes</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Certifications</label>
                  <MultiSelect
                    options={[
                      { label: "ISO 9001", value: "ISO 9001" },
                      { label: "ISO 14001", value: "ISO 14001" },
                      { label: "FSSC 22000", value: "FSSC 22000" },
                      { label: "Other", value: "Other" },
                    ]}
                    selected={newSupplierCertificationsList}
                    onChange={onNewSupplierCertificationsListChange}
                    placeholder="Select certifications"
                  />
                </div>

                {newSupplierError && (
                  <p className="text-red-500 text-sm">{newSupplierError}</p>
                )}
                <Button
                  onClick={handleNewSupplierSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Add Supplier"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="existing">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select suppliers for {currentMaterial?.name}
                  </label>

                  {/* Simple supplier selection list with checkboxes */}
                  <div className="border rounded-md divide-y">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`supplier-${supplier.id}`}
                          checked={selectedExistingSupplierIds.includes(
                            supplier.id
                          )}
                          onCheckedChange={(checked) =>
                            handleSupplierCheckboxChange(
                              supplier.id,
                              checked === true
                            )
                          }
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`supplier-${supplier.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {supplier.name}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({supplier.id})
                            </span>
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {supplier.location.address}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedExistingSupplierIds.length > 0 && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium mb-2">
                      Selected Suppliers ({selectedExistingSupplierIds.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedExistingSupplierIds.map((id) => {
                        const supplier = suppliers.find((s) => s.id === id);
                        return supplier ? (
                          <div
                            key={id}
                            className="flex items-center justify-between p-2 bg-background rounded-md"
                          >
                            <span className="font-medium">
                              {supplier.name}{" "}
                              <span className="text-xs text-muted-foreground">
                                ({id})
                              </span>
                            </span>
                            <Badge variant="outline">
                              {supplier.location.address}
                            </Badge>
                          </div>
                        ) : (
                          <div
                            key={id}
                            className="p-2 bg-red-50 text-red-500 rounded-md"
                          >
                            Supplier with ID {id} not found
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  onClick={onAssociateSuppliers}
                  disabled={
                    isSubmitting || selectedExistingSupplierIds.length === 0
                  }
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Associate Selected Suppliers"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Add global initialization function type
declare global {
  interface Window {
    initGoogleMapsServices?: () => void;
    gm_authFailure?: () => void;
  }
}
