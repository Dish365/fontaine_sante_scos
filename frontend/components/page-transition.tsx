"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useRouteChange } from "@/providers/route-change-provider";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { stopLoading } = useRouteChange();

  // Ensure loading state is cleared when component mounts
  useEffect(() => {
    // Small delay to allow the page to render
    const timer = setTimeout(() => {
      stopLoading();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, stopLoading]);

  const variants = {
    hidden: { opacity: 0, x: 0, y: 10 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 0, y: 10 },
  };

  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{
        type: "ease",
        duration: 0.2,
      }}
      className="min-h-screen"
      onAnimationComplete={() => {
        // Ensure loading is stopped after animation completes
        stopLoading();
      }}
    >
      {children}
    </motion.div>
  );
}
