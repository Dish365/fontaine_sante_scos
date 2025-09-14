import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fontaine Santé SCOS | Supply Chain Operations System",
  description: "Advanced supply chain management platform integrating environmental impact assessment, economic analysis, and quality metrics for sustainable operations.",
  keywords: ["supply chain", "sustainability", "environmental impact", "quality assessment", "economic analysis", "carbon footprint", "supplier management"],
  authors: [{ name: "Fontaine Santé" }],
  creator: "Fontaine Santé",
  publisher: "Fontaine Santé",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Fontaine Santé SCOS | Supply Chain Operations System",
    description: "Advanced supply chain management platform for sustainable operations",
    siteName: "Fontaine Santé SCOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fontaine Santé SCOS",
    description: "Advanced supply chain management platform for sustainable operations",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased">
        <div className={`${inter.className} min-h-screen bg-gray-50`}>
          <AdminProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </AdminProvider>
        </div>
      </body>
    </html>
  );
}
