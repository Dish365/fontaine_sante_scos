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
  TestTube,
  FileBarChart,
  Map,
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
            Learn more
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
              <span className="text-lg font-bold">Fontaine Santé</span>
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
      <section className="bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Fontaine Santé Framework
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            A comprehensive supply chain management framework for sustainable,
            quality-focused, and economically optimized procurement decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="font-medium px-8">
                Enter Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#framework-phases">
              <Button size="lg" variant="outline" className="font-medium px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Benefits</h2>
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
                  Optimize environmental footprint across your entire supply
                  chain with comprehensive impact assessments and monitoring.
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
                  Make informed procurement decisions with real-time analytics,
                  predictive models, and comprehensive supplier scoring.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-background">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <LineChart className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  Continuous Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>
                  Evolve and adapt your supply chain strategy with ongoing
                  monitoring, stakeholder feedback, and system refinements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Framework Phases */}
      <section id="framework-phases" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Framework Phases
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Our comprehensive approach follows six key phases to transform your
            supply chain management:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FrameworkPhase
              icon={Database}
              phase="Phase 1"
              title="Data Collection & Mapping"
              description="Create a comprehensive inventory of all materials and map your entire supply chain for complete visibility."
              link="/data-collection"
            />
            <FrameworkPhase
              icon={BarChart3}
              phase="Phase 2"
              title="Impact Assessment"
              description="Analyze environmental impact, economic factors, and quality metrics for all suppliers and materials."
              link="/impact-assessment"
            />
            <FrameworkPhase
              icon={ClipboardList}
              phase="Phase 3"
              title="Framework Development"
              description="Create a scoring system with weighted criteria aligned to your company priorities and standards."
              link="/framework-development"
            />
            <FrameworkPhase
              icon={LineChart}
              phase="Phase 4"
              title="Digital Dashboard"
              description="Implement real-time monitoring, predictive analytics, and trade-off analysis tools."
              link="/digital-dashboard"
            />
            <FrameworkPhase
              icon={TestTube}
              phase="Phase 5"
              title="Testing & Refinement"
              description="Validate accuracy, collect stakeholder feedback, and refine the system for optimal performance."
              link="/testing-refinement"
            />
            <FrameworkPhase
              icon={FileBarChart}
              phase="Phase 6"
              title="Implementation & Monitoring"
              description="Deploy with a phased strategy and establish continuous improvement processes."
              link="/implementation-monitoring"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Start optimizing your procurement decisions with the Fontaine Santé
            Framework today.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="font-medium px-8">
              Enter Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-4 md:mb-0">
              © 2025 Fontaine Santé. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
