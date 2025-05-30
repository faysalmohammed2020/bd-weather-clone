"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart,
  Menu,
  ChevronLeft,
  Codesandbox,
  Binoculars,
  CloudHail,
  Users,
  CloudFog,
  Settings,
  PencilIcon,
  ChevronDown,
  Eye,
  FileBarChart,
  X,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const role = session?.user?.role;
  const pathname = usePathname();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isMobileOpen
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen]);

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Auto-detect screen size and set appropriate state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile behavior
        setIsMobileOpen(false);
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        // Tablet behavior - auto collapse
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else {
        // Desktop behavior - auto expand
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    // Initialize on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-open submenu if current path matches
  useEffect(() => {
    sidebarLinks.forEach((link) => {
      if (link.subMenu) {
        const isActive = link.subMenu.some((item) => item.href === pathname);
        if (isActive) {
          setActiveSubmenu(link.label);
        }
      }
    });
  }, [pathname]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleSubmenuToggle = (label: string) => {
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };

  const sidebarLinks = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      roles: ["super_admin", "observer", "station_admin"],
    },
    {
      icon: <PencilIcon className="w-5 h-5" />,
      label: "Data Entry",
      roles: ["observer", "station_admin", "super_admin"],
      subMenu: [
        {
          icon: <CloudHail className="w-5 h-5" />,
          href: "/dashboard/data-entry/first-card",
          label: "First Card",
        },
        {
          icon: <Binoculars className="w-5 h-5" />,
          href: "/dashboard/data-entry/second-card",
          label: "Second Card",
        },
        {
          icon: <Codesandbox className="w-5 h-5" />,
          href: "/dashboard/data-entry/synoptic-code",
          label: "Synoptic Code",
        },
        {
          icon: <BarChart className="w-5 h-5" />,
          href: "/dashboard/data-entry/daily-summery",
          label: "Daily Summery",
        },
      ],
    },
    {
      icon: <Eye className="w-5 h-5" />,
      label: "View & Manage",
      roles: ["observer", "station_admin", "super_admin"],
      subMenu: [
        {
          icon: <CloudHail className="w-5 h-5" />,
          href: "/dashboard/view-and-manage/first-card-view",
          label: "First Card",
        },
        {
          icon: <Binoculars className="w-5 h-5" />,
          href: "/dashboard/view-and-manage/second-card-view",
          label: "Second Card",
        },
        {
          icon: <Codesandbox className="w-5 h-5" />,
          href: "/dashboard/view-and-manage/synoptic-code",
          label: "Synoptic Code",
        },
        {
          icon: <BarChart className="w-5 h-5" />,
          href: "/dashboard/view-and-manage/daily-summery",
          label: "Daily Summary",
        },
        {
          icon: <FileBarChart className="w-5 h-5" />,
          href: "/dashboard/view-and-manage/all",
          label: "View all & Export",
        },
      ],
    },
    {
      href: "/dashboard/user",
      icon: <Users className="w-5 h-5" />,
      label: "User Management",
      roles: ["super_admin", "station_admin"],
    },
    {
      href: "/dashboard/stations",
      icon: <CloudFog className="w-5 h-5" />,
      label: "Station Management",
      roles: ["super_admin"],
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      roles: ["super_admin"],
    },
  ];

  return (
    <>
      {!isMobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            onClick={toggleMobileSidebar}
            variant="outline"
            size="icon"
            className="bg-white shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "bg-sky-700 text-white h-full transition-all duration-300 ease-in-out",
          "fixed md:relative z-40 flex flex-col", // Increased z-index to 40
          "border-r border-sky-800",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full md:translate-x-0"
        )}
        style={{
          height: "100vh",
          top: 0,
          left: 0,
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-800 z-40 bg-sky-700">
          {(!isCollapsed || isMobileOpen) && (
            <h2 className="text-lg font-bold whitespace-nowrap">BD Weather</h2>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-1 rounded-md hover:bg-sky-600 transition-colors"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-1 rounded-md hover:bg-sky-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden z-30">
          {sidebarLinks.map((link) => {
            if (!link.roles.includes(role as string)) return null;

            return (
              <div key={link.href || link.label} className="relative z-30">
                <SidebarLink
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  isCollapsed={isCollapsed && !isMobileOpen}
                  subMenu={link.subMenu}
                  isActive={
                    link.href === pathname ||
                    (link.subMenu &&
                      link.subMenu.some((item) => item.href === pathname))
                  }
                  isSubmenuOpen={activeSubmenu === link.label}
                  onSubmenuToggle={() => handleSubmenuToggle(link.label)}
                  onMobileLinkClick={toggleMobileSidebar}
                />
              </div>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleMobileSidebar}
        />
      )}
    </>
  );
};

type SidebarLinkProps = {
  href?: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
  isSubmenuOpen?: boolean;
  subMenu?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  onSubmenuToggle?: () => void;
  onMobileLinkClick?: () => void;
};

const SidebarLink = ({
  href,
  icon,
  label,
  isCollapsed,
  isActive = false,
  isSubmenuOpen = false,
  subMenu = [],
  onSubmenuToggle,
  onMobileLinkClick,
}: SidebarLinkProps) => {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onMobileLinkClick && href) {
      onMobileLinkClick();
    }
  };

  if (subMenu && subMenu.length > 0) {
    return (
      <Collapsible
        open={isSubmenuOpen}
        onOpenChange={onSubmenuToggle}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center justify-between text-white",
              "hover:bg-white hover:text-sky-800 transition-colors",
              "rounded-md px-3 py-2",
              isActive && "bg-sky-600 text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(isActive ? "text-white" : "text-sky-200")}>
                {icon}
              </span>
              {!isCollapsed && (
                <span className="whitespace-nowrap">{label}</span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isSubmenuOpen ? "rotate-180" : "",
                  isActive ? "text-white" : "text-sky-200"
                )}
              />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 flex flex-col space-y-1">
          {subMenu.map((item) => {
            const isItemActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={handleLinkClick}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full flex items-center gap-3 justify-start",
                    "py-1.5 pl-9 pr-3 rounded-md",
                    "text-white hover:bg-white hover:text-sky-800",
                    isItemActive && "bg-sky-600 text-white"
                  )}
                >
                  {item.icon && (
                    <span
                      className={cn(
                        "text-current",
                        isItemActive ? "text-white" : "text-sky-200"
                      )}
                    >
                      {item.icon}
                    </span>
                  )}
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link href={href || "#"} onClick={handleLinkClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full flex items-center gap-3 justify-start",
          "px-3 py-2 rounded-md",
          "text-white hover:bg-white hover:text-sky-800",
          isActive && "bg-sky-600 text-white"
        )}
      >
        <span className={cn(isActive ? "text-white" : "text-sky-200")}>
          {icon}
        </span>
        {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
      </Button>
    </Link>
  );
};

export default Sidebar;
