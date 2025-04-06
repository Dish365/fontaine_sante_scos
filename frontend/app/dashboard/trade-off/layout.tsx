"use client";

import React, { useEffect, useRef } from "react";

export default function TradeoffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialized = useRef(false);

  // Fix z-index and positioning issues only once
  useEffect(() => {
    // Only run once
    if (initialized.current) return;
    initialized.current = true;

    // Ensure the main content is properly positioned
    const mainContent = document.querySelector("main");
    const fixMainContentPosition = () => {
      if (mainContent) {
        // Apply styles to ensure content is visible and properly positioned
        mainContent.style.position = "relative";
        mainContent.style.zIndex = "10";
        mainContent.style.backgroundColor = "var(--background)";

        // Reset any margin that might have been applied
        mainContent.style.marginLeft = "";
        mainContent.style.width = "";
      }
    };

    // Apply the fix immediately
    fixMainContentPosition();

    // Also apply on resize to handle sidebar collapsing/expanding
    window.addEventListener("resize", fixMainContentPosition);

    return () => {
      // Clean up styles and event listener when unmounting
      window.removeEventListener("resize", fixMainContentPosition);
      if (mainContent) {
        mainContent.style.position = "";
        mainContent.style.zIndex = "";
        mainContent.style.backgroundColor = "";
        mainContent.style.marginLeft = "";
        mainContent.style.width = "";
      }
    };
  }, []);

  return (
    <div className="relative z-10 bg-background w-full min-h-screen">
      {children}
    </div>
  );
}
