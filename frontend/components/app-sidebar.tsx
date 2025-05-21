"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  Home,
  Map,
  LayoutDashboard,
  Settings,
  Sliders,
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
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>("dashboard");

  // Enhanced mobile detection and sidebar state management
  useEffect(() => {
    const checkResponsive = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      setIsMobile(mobile);
      
      // Auto-collapse on mobile, semi-collapse on tablet
      if (mobile) {
        setIsCollapsed(true);
        setIsOpen(false);
      } else if (tablet) {
        setIsCollapsed(true);
        setIsOpen(true);
      } else {
        setIsCollapsed(false);
        setIsOpen(true);
      }
    };

    // Initial check
    checkResponsive();

    // Add event listener with debounce for performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkResponsive, 100);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.querySelector('[data-sidebar]');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

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
      title: "Route Visualization",
      href: "/dashboard/visualization",
      icon: Map,
    },
    {
      title: "Analysis",
      href: "/dashboard/analysis",
      icon: BarChart3,
    },
    {
      title: "Trade-off Analysis",
      href: "/dashboard/trade-off",
      icon: Sliders,
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
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <Sidebar
        data-sidebar
        className={cn(
          "border-r transition-all duration-300 fixed top-0 h-full z-40",
          isMobile ? (
            isOpen ? "left-0" : "-left-[280px]"
          ) : (
            isCollapsed ? "w-[80px] left-0" : "w-[280px] left-0"
          ),
          "bg-background"
        )}
      >
        <SidebarHeader className="border-b px-4 py-2 flex justify-between items-center">
          <div
            className={cn(
              "flex items-center gap-2 overflow-hidden",
              isCollapsed && !isMobile && "justify-center"
            )}
          >
            <Map className="h-6 w-6 flex-shrink-0" />
            {(!isCollapsed || (isMobile && isOpen)) && (
              <span className="text-lg font-bold">SupplyChain</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isMobile ? setIsOpen(!isOpen) : setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isMobile ? (
              isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </SidebarHeader>
        
        <SidebarContent>
          <ScrollArea className={cn(
            "h-[calc(100vh-8rem)]",
            "touch-pan-y" // Better touch scrolling
          )}>
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
      
      {/* Mobile toggle button */}
      {isMobile && !isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-30 h-10 w-10 rounded-full shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
