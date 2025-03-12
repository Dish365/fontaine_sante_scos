"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building,
  ChevronLeft,
  ChevronRight,
  Database,
  Home,
  Map,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    "dashboard"
  );

  // Check if we're on mobile for responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Automatically open the accordion if the current path matches one of its items
  useEffect(() => {
    if (pathname.includes("/dashboard")) {
      setOpenAccordion("dashboard");
    }
  }, [pathname]);

  // Dashboard submenu items - include all the pages
  const dashboardItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Data Collection & Mapping",
      href: "/dashboard/data-collection",
      icon: Database,
    },
    {
      title: "Analysis",
      href: "/dashboard/analysis",
      icon: BarChart3,
    },
    {
      title: "Supplier Management",
      href: "/dashboard/suppliers",
      icon: Building,
    },
  ];

  // Check if a route is active (exact match or child route)
  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    // Special case for dashboard overview to prevent it from being active on other dashboard pages
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Handle accordion toggle
  const handleAccordionToggle = (value: string) => {
    setOpenAccordion(value === openAccordion ? undefined : value);
  };

  // Render dashboard submenu items
  const renderDashboardItems = () => {
    return dashboardItems.map((item) => (
      <SidebarMenuItem key={item.href}>
        <TooltipProvider delayDuration={isCollapsed ? 300 : 999999}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                isActive={isRouteActive(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium",
                  isCollapsed && "justify-center px-2",
                  !isCollapsed && "pl-8" // Indent submenu items
                )}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 w-full",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">{item.title}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    ));
  };

  return (
    <Sidebar
      className={cn(
        "border-r transition-all duration-300 fixed top-0 left-0 h-full z-40",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <SidebarHeader className="border-b px-4 py-2 flex justify-between items-center">
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden",
            isCollapsed && "justify-center"
          )}
        >
          <Map className="h-6 w-6 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-lg font-bold">SupplyChain</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 py-4">
            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Main Navigation
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {isCollapsed ? (
                    // Collapsed view - just show dashboard icon with tooltip
                    <SidebarMenuItem>
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname.includes("/dashboard")}
                              className="w-full flex items-center justify-center px-2 py-2 text-sm font-medium"
                            >
                              <div className="flex items-center justify-center w-full">
                                <LayoutDashboard className="h-4 w-4 shrink-0" />
                              </div>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            Dashboard
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* When collapsed, show submenus in a popover on hover */}
                      {pathname.includes("/dashboard") && (
                        <div className="absolute left-[79px] top-0 z-50 w-[200px] rounded-md bg-popover p-2 shadow-md">
                          {dashboardItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                                isRouteActive(item.href)
                                  ? "bg-accent"
                                  : "hover:bg-muted"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </SidebarMenuItem>
                  ) : (
                    // Expanded view - show accordion with dropdown
                    <Accordion
                      type="single"
                      collapsible
                      value={openAccordion}
                      onValueChange={handleAccordionToggle}
                      className="w-full"
                    >
                      <AccordionItem value="dashboard" className="border-none">
                        <div className="px-2">
                          <AccordionTrigger
                            className={cn(
                              "flex w-full items-center rounded-md px-2 py-2 hover:bg-accent hover:no-underline",
                              pathname.includes("/dashboard") &&
                                "bg-accent text-accent-foreground font-medium"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <LayoutDashboard className="h-4 w-4 shrink-0" />
                              <span>Dashboard</span>
                            </div>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent className="pt-1 pb-0">
                          <SidebarMenu>{renderDashboardItems()}</SidebarMenu>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed ? (
            <>
              <Link
                href="/settings"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <ThemeToggle showTooltip={true} />
            </>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/settings"
                      className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ThemeToggle showTooltip={true} side="right" />
            </div>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
