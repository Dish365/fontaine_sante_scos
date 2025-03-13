"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  BarChart3,
  Database,
  ClipboardList,
  LineChart,
  FileBarChart,
  Map,
  Code,
  Github,
  ExternalLink,
  Layers,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const FrameworkPhase = ({
  icon: Icon,
  phase,
  title,
  description,
  link,
}: {
  icon: React.ElementType;
  phase: string;
  title: string;
  description: string;
  link: string;
}) => {
  return (
    <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {phase}
          </span>
        </div>
        <CardTitle className="text-xl mt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={link}>
          <Button variant="ghost" className="group">
            Explore
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Theme Toggle */}
      <header className="w-full border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Fontaine Santé SCOS</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle variant="ghost" showTooltip={true} />
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">
              Prototype Demo
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Fontaine Santé SCOS
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-3">
            Supply Chain Operating System
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
            A comprehensive supply chain management system for sustainable,
            quality-focused, and economically optimized procurement decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="font-medium px-8">
                Launch Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#project-overview">
              <Button size="lg" variant="outline" className="font-medium px-8">
                Project Overview
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section id="project-overview" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">
            Project Overview
          </h2>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-muted-foreground mb-6">
              Fontaine Santé SCOS is a prototype supply chain operating system
              designed to help food manufacturers optimize their procurement
              decisions based on sustainability, quality, and economic factors.
            </p>
            <p className="text-lg text-muted-foreground">
              This prototype demonstrates the core functionality and user
              interface of the system, showcasing how data collection, analysis,
              and visualization can transform supply chain management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Code className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Next.js & React</h3>
                    <p className="text-sm text-muted-foreground">
                      Modern frontend framework for building the user interface
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Cpu className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">TypeScript</h3>
                    <p className="text-sm text-muted-foreground">
                      Type-safe programming for robust application development
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">JSON Data Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      Simulated database for prototype demonstration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Project Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p>
                    Demonstrate a user-friendly interface for supply chain data
                    management
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p>Showcase data visualization and analysis capabilities</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p>
                    Illustrate how sustainability, quality, and economic factors
                    can be balanced
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p>
                    Provide a foundation for future development and
                    implementation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">Key Features</h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Our prototype demonstrates these essential capabilities for modern
            supply chain management:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm bg-background">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  Sustainable Supply Chain
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>
                  Track and optimize environmental impact metrics across your
                  entire supply chain network.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-background">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  Data-Driven Decisions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>
                  Make informed procurement decisions with comprehensive
                  analytics and supplier scoring.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-background">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Map className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  Visual Supply Chain Mapping
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>
                  Visualize your entire supply network with interactive maps and
                  geographical insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* System Modules */}
      <section id="system-modules" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            System Modules
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Explore the key modules of our prototype system:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FrameworkPhase
              icon={Database}
              phase="Core Module"
              title="Data Collection & Mapping"
              description="Create a comprehensive inventory of raw materials and map your entire supply chain for complete visibility."
              link="/dashboard/data-collection"
            />
            <FrameworkPhase
              icon={BarChart3}
              phase="Core Module"
              title="Supplier Management"
              description="Manage supplier information, certifications, and performance metrics to optimize your supplier relationships."
              link="/dashboard/suppliers"
            />
            <FrameworkPhase
              icon={LineChart}
              phase="Analysis Module"
              title="Cost Analysis"
              description="Analyze material costs, transportation expenses, and storage costs to identify optimization opportunities."
              link="/dashboard/analysis"
            />
            <FrameworkPhase
              icon={Map}
              phase="Visualization Module"
              title="Supply Chain Visualization"
              description="Visualize your entire supply chain network with interactive maps and geographical insights."
              link="/dashboard/visualization"
            />
            <FrameworkPhase
              icon={ClipboardList}
              phase="Analysis Module"
              title="Material Analysis"
              description="Analyze raw materials for quality, environmental impact, and economic factors to make informed decisions."
              link="/dashboard/analysis"
            />
            <FrameworkPhase
              icon={FileBarChart}
              phase="Analysis Module"
              title="Transportation Analysis"
              description="Optimize transportation routes, modes, and costs to improve efficiency and reduce environmental impact."
              link="/dashboard/analysis"
            />
          </div>
        </div>
      </section>

      {/* Demo Access */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Explore the Prototype</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Access the interactive demo of Fontaine Santé SCOS to see how it can
            transform your supply chain management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="font-medium px-8"
              >
                Launch Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Map className="h-5 w-5 text-primary" />
              <span className="font-medium">Fontaine Santé SCOS</span>
              <span className="text-sm text-muted-foreground ml-2">
                Prototype Demo
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Documentation</span>
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              © 2025 Fontaine Santé SCOS. This is a prototype for demonstration
              purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
