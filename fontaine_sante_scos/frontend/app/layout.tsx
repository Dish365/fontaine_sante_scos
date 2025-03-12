import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/leaflet.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/store/provider";
import { RouteChangeProvider } from "@/providers/route-change-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Supply Chain Dashboard",
  description: "A comprehensive supply chain management dashboard",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RouteChangeProvider>
              <div className={inter.className}>{children}</div>
              <Toaster />
            </RouteChangeProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

import "./globals.css";
