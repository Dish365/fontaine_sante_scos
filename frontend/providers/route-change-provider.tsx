"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RouteChangeContextType {
  isRouteChanging: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const RouteChangeContext = createContext<RouteChangeContextType>({
  isRouteChanging: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useRouteChange = () => useContext(RouteChangeContext);

export function RouteChangeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const [prevPathname, setPrevPathname] = useState("");
  const [prevSearchParams, setPrevSearchParams] = useState("");
  const [loadingTimeoutId, setLoadingTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  // Function to start loading
  const startLoading = () => {
    setIsRouteChanging(true);
  };

  // Function to stop loading
  const stopLoading = () => {
    setIsRouteChanging(false);
    if (loadingTimeoutId) {
      clearTimeout(loadingTimeoutId);
      setLoadingTimeoutId(null);
    }
  };

  // Check for route changes
  useEffect(() => {
    const currentSearchParams = searchParams.toString();

    // If this is the initial load, don't show the loading spinner
    if (prevPathname === "") {
      setPrevPathname(pathname);
      setPrevSearchParams(currentSearchParams);
      return;
    }

    // Only handle major route changes, not just query param changes
    // This helps avoid conflicts with Next.js loading.tsx files
    const currentMainPath = pathname.split("?")[0];
    const prevMainPath = prevPathname.split("?")[0];

    // If only the main path is changing (not just params), show the loading spinner
    if (currentMainPath !== prevMainPath) {
      startLoading();

      // Store the new route
      setPrevPathname(pathname);
      setPrevSearchParams(currentSearchParams);

      // Hide the loading spinner after a short delay
      const timer = setTimeout(() => {
        stopLoading();
      }, 200); // Reduced to 200ms for faster transitions

      setLoadingTimeoutId(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    } else if (currentSearchParams !== prevSearchParams) {
      // Just update the stored params without showing loading spinner
      setPrevSearchParams(currentSearchParams);
    }
  }, [pathname, searchParams, prevPathname, prevSearchParams]);

  // Safety mechanism: ensure loading state doesn't persist for too long
  useEffect(() => {
    if (isRouteChanging) {
      const safetyTimer = setTimeout(() => {
        stopLoading();
      }, 2000); // Force stop loading after 2 seconds

      return () => clearTimeout(safetyTimer);
    }
  }, [isRouteChanging]);

  return (
    <RouteChangeContext.Provider
      value={{ isRouteChanging, startLoading, stopLoading }}
    >
      {isRouteChanging && <LoadingSpinner fullScreen text="Changing page..." />}
      {children}
    </RouteChangeContext.Provider>
  );
}
