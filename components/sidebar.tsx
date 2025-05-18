"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Fetch user role from session
  const { data: session } = useSession();
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };
  const role = session?.user.role;

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
      ],
    },
    {
      href: "/dashboard/user",
      icon: <Users className="w-5 h-5" />,
      label: "User Management",
      roles: ["super_admin"],
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
    <div className="flex h-screen overflow-hidden shrink-0">
      {/* Sidebar */}
      <div
        className={`bg-sky-700 text-white h-full transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && <h2 className="text-lg font-bold ">BD Weather</h2>}
          <button onClick={toggleSidebar}>
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col gap-2 px-2 mt-5">
          {sidebarLinks.map((link) => {
            // Check if user's role is included in the link's roles array
            if (link.roles.includes(role as string)) {
              return (
                <SidebarLink
                  key={link.href || link.label}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  isCollapsed={isCollapsed}
                  roles={link.roles}
                  subMenu={link.subMenu}
                />
              );
            }
            return null; // Skip rendering if role doesn't match
          })}
        </nav>
      </div>
    </div>
  );
};

type SidebarLinkProps = {
  href?: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  roles?: string[];
  subMenu?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  }[];
};

const SidebarLink = ({
  href,
  icon,
  label,
  isCollapsed,
  subMenu = [],
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = href
    ? pathname === href
    : subMenu.some((item) => pathname === item.href);
  const [isOpen, setIsOpen] = useState(isActive);

  // If it has submenu, render as collapsible
  if (subMenu && subMenu.length > 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between text-white hover:bg-white hover:text-black"
          >
            <div className="flex items-center gap-3">
              {icon}
              {!isCollapsed && <span>{label}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-7 mt-2 flex flex-col space-y-1">
          {subMenu.map((item) => {
            const isItemActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full flex items-center gap-2 justify-start py-1.5 pl-2 ${isItemActive ? "bg-sky-600 text-white" : "text-white hover:bg-white hover:text-black"}`}
                >
                  {item.icon && (
                    <span className="text-current">{item.icon}</span>
                  )}
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Regular link
  return (
    <Link href={href || "#"}>
      <Button
        variant="ghost"
        className={`w-full flex items-center gap-3 justify-start ${isActive ? "bg-sky-600 text-white" : "text-white hover:bg-white hover:text-black"}`}
      >
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
};

export default Sidebar;
