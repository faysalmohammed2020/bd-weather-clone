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
  FileBarChart,
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
  const role = session?.user?.role;

  console.log("Session", session);

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



// "use client"

// import type React from "react"

// import { useState } from "react"
// import { usePathname } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import {
//   LayoutDashboard,
//   BarChart,
//   Menu,
//   ChevronLeft,
//   Codesandbox,
//   Search,
//   CloudHail,
//   Users,
//   CloudFog,
//   Settings,
//   Edit,
//   ChevronDown,
//   Eye,
//   FileBarChart,
//   Zap,
// } from "lucide-react"
// import { useSession } from "@/lib/auth-client"
// import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

// interface SubMenuItem {
//   href: string
//   label: string
//   icon?: React.ReactNode
// }

// interface SidebarLinkType {
//   href?: string
//   icon: React.ReactNode
//   label: string
//   roles: string[]
//   gradient: string
//   subMenu?: SubMenuItem[]
// }

// interface SidebarLinkProps {
//   href?: string
//   icon: React.ReactNode
//   label: string
//   isCollapsed: boolean
//   roles?: string[]
//   subMenu?: SubMenuItem[]
//   gradient: string
//   index: number
// }

// const Sidebar = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const pathname = usePathname()

//   // Use real session data
//   const { data: session } = useSession()
//   const role = session?.user?.role

//   const toggleSidebar = () => {
//     setIsCollapsed((prev) => !prev)
//   }

//   const sidebarLinks: SidebarLinkType[] = [
//     {
//       href: "/dashboard",
//       icon: <LayoutDashboard className="w-5 h-5" />,
//       label: "Dashboard",
//       roles: ["super_admin", "observer", "station_admin"],
//       gradient: "from-blue-500 to-cyan-400",
//     },
//     {
//       icon: <Edit className="w-5 h-5" />,
//       label: "Data Entry",
//       roles: ["observer", "station_admin", "super_admin"],
//       gradient: "from-purple-500 to-pink-400",
//       subMenu: [
//         {
//           icon: <CloudHail className="w-4 h-4" />,
//           href: "/dashboard/data-entry/first-card",
//           label: "First Card",
//         },
//         {
//           icon: <Search className="w-4 h-4" />,
//           href: "/dashboard/data-entry/second-card",
//           label: "Second Card",
//         },
//         {
//           icon: <Codesandbox className="w-4 h-4" />,
//           href: "/dashboard/data-entry/synoptic-code",
//           label: "Synoptic Code",
//         },
//         {
//           icon: <BarChart className="w-4 h-4" />,
//           href: "/dashboard/data-entry/daily-summery",
//           label: "Daily Summary",
//         },
//       ],
//     },
//     {
//       icon: <Eye className="w-5 h-5" />,
//       label: "View & Manage",
//       roles: ["observer", "station_admin", "super_admin"],
//       gradient: "from-emerald-500 to-teal-400",
//       subMenu: [
//         {
//           icon: <CloudHail className="w-4 h-4" />,
//           href: "/dashboard/view-and-manage/first-card-view",
//           label: "First Card",
//         },
//         {
//           icon: <Search className="w-4 h-4" />,
//           href: "/dashboard/view-and-manage/second-card-view",
//           label: "Second Card",
//         },
//         {
//           icon: <Codesandbox className="w-4 h-4" />,
//           href: "/dashboard/view-and-manage/synoptic-code",
//           label: "Synoptic Code",
//         },
//         {
//           icon: <BarChart className="w-4 h-4" />,
//           href: "/dashboard/view-and-manage/daily-summery",
//           label: "Daily Summary",
//         },
//         {
//           icon: <FileBarChart className="w-4 h-4" />,
//           href: "/dashboard/view-and-manage/all",
//           label: "View all & Export",
//         },
//       ],
//     },
//     {
//       href: "/dashboard/user",
//       icon: <Users className="w-5 h-5" />,
//       label: "User Management",
//       roles: ["super_admin"],
//       gradient: "from-orange-500 to-red-400",
//     },
//     {
//       href: "/dashboard/stations",
//       icon: <CloudFog className="w-5 h-5" />,
//       label: "Station Management",
//       roles: ["super_admin"],
//       gradient: "from-indigo-500 to-purple-400",
//     },
//     {
//       href: "/dashboard/settings",
//       icon: <Settings className="w-5 h-5" />,
//       label: "Settings",
//       roles: ["super_admin"],
//       gradient: "from-gray-600 to-gray-400",
//     },
//   ]

//   return (
//     <div className="flex h-screen overflow-hidden shrink-0">
//       {/* Sidebar */}
//       <div
//         className={`relative backdrop-blur-xl bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 border-r border-white/10 text-white h-full transition-all duration-500 ease-in-out ${
//           isCollapsed ? "w-20" : "w-72"
//         } flex flex-col shadow-2xl`}
//       >
//         {/* Animated gradient border */}
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-30 rounded-r-3xl"></div>

//         {/* Sidebar Header */}
//         <div className="relative flex items-center justify-between p-6 border-b border-white/10">
//           <div className="flex items-center gap-3">
//             {!isCollapsed && (
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
//                   <Zap className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
//                     BD Weather
//                   </h2>
//                   <p className="text-xs text-slate-400">Advanced Analytics</p>
//                 </div>
//               </div>
//             )}
//             {isCollapsed && (
//               <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center mx-auto">
//                 <Zap className="w-4 h-4 text-white" />
//               </div>
//             )}
//           </div>

//           <button
//             onClick={toggleSidebar}
//             className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
//           >
//             {isCollapsed ? (
//               <Menu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
//             ) : (
//               <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
//             )}
//           </button>
//         </div>

//         {/* Sidebar Links */}
//         <nav className="flex flex-col gap-2 px-4 mt-2 flex-1 overflow-y-auto">
//           {sidebarLinks.map((link, index) => {
//             if (link.roles.includes(role as string)) {
//               return (
//                 <SidebarLink
//                   key={link.href || link.label}
//                   href={link.href}
//                   icon={link.icon}
//                   label={link.label}
//                   isCollapsed={isCollapsed}
//                   subMenu={link.subMenu}
//                   gradient={link.gradient}
//                   index={index}
//                 />
//               )
//             }
//             return null
//           })}
//         </nav>

//         {/* Bottom decoration */}
//         <div className="p-4">
//           <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
//           <div className="mt-4 text-center">
//             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               <span className="text-xs text-slate-400">System Online</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// const SidebarLink = ({ href, icon, label, isCollapsed, subMenu = [], gradient, index }: SidebarLinkProps) => {
//   const pathname = usePathname()
//   const [isHovered, setIsHovered] = useState(false)

//   const isActive = href ? pathname === href : subMenu.some((item) => pathname === item.href)
//   const [isOpen, setIsOpen] = useState(isActive)

//   // If it has submenu, render as collapsible
//   if (subMenu && subMenu.length > 0) {
//     return (
//       <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
//         <CollapsibleTrigger asChild>
//           <Button
//             variant="ghost"
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//             className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
//               isActive
//                 ? `bg-gradient-to-r ${gradient} shadow-lg shadow-blue-500/25`
//                 : "hover:bg-white/10 hover:shadow-lg"
//             }`}
//             style={{
//               animationDelay: `${index * 100}ms`,
//             }}
//           >
//             {/* Animated background */}
//             <div
//               className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
//             ></div>

//             <div className="flex items-center gap-4 relative z-10">
//               <div
//                 className={`p-2 rounded-xl transition-all duration-300 ${
//                   isActive ? "bg-white/20" : "bg-white/10 group-hover:bg-white/20"
//                 }`}
//               >
//                 {icon}
//               </div>
//               {!isCollapsed && (
//                 <span className="font-medium text-white group-hover:text-white transition-colors duration-300">
//                   {label}
//                 </span>
//               )}
//             </div>

//             {!isCollapsed && (
//               <ChevronDown
//                 className={`h-4 w-4 transition-all duration-300 ${isOpen ? "rotate-180" : ""} ${
//                   isHovered ? "scale-110" : ""
//                 }`}
//               />
//             )}

//             {/* Hover effect line */}
//             <div
//               className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient} transform transition-transform duration-300 ${
//                 isHovered ? "scale-y-100" : "scale-y-0"
//               }`}
//             ></div>
//           </Button>
//         </CollapsibleTrigger>

//         <CollapsibleContent className="overflow-hidden transition-all duration-500 ease-in-out">
//           <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-4">
//             {subMenu.map((item, subIndex) => {
//               const isItemActive = pathname === item.href
//               return (
//                 <Link key={item.href} href={item.href}>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group relative ${
//                       isItemActive
//                         ? "bg-white/15 text-white shadow-lg"
//                         : "text-slate-300 hover:text-white hover:bg-white/10"
//                     }`}
//                     style={{
//                       animationDelay: `${(index + subIndex) * 50}ms`,
//                     }}
//                   >
//                     <div
//                       className={`p-1.5 rounded-lg transition-all duration-300 ${
//                         isItemActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/15"
//                       }`}
//                     >
//                       {item.icon}
//                     </div>
//                     {!isCollapsed && (
//                       <span className="text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
//                         {item.label}
//                       </span>
//                     )}

//                     {/* Active indicator */}
//                     {isItemActive && (
//                       <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                     )}
//                   </Button>
//                 </Link>
//               )
//             })}
//           </div>
//         </CollapsibleContent>
//       </Collapsible>
//     )
//   }

//   // Regular link
//   return (
//     <Link href={href || "#"}>
//       <Button
//         variant="ghost"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
//           isActive
//             ? `bg-gradient-to-r ${gradient} shadow-lg shadow-blue-500/25 transform scale-105`
//             : "hover:bg-white/10 hover:shadow-lg hover:scale-102"
//         }`}
//         style={{
//           animationDelay: `${index * 100}ms`,
//         }}
//       >
//         {/* Animated background */}
//         <div
//           className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
//         ></div>

//         <div
//           className={`p-2 rounded-xl transition-all duration-300 relative z-10 ${
//             isActive ? "bg-white/20" : "bg-white/10 group-hover:bg-white/20"
//           }`}
//         >
//           {icon}
//         </div>

//         {!isCollapsed && (
//           <span className="font-medium text-white group-hover:text-white transition-all duration-300 relative z-10">
//             {label}
//           </span>
//         )}

//         {/* Hover effect particles */}
//         {isHovered && !isCollapsed && (
//           <div className="absolute inset-0 pointer-events-none">
//             <div
//               className="absolute top-2 right-4 w-1 h-1 bg-white/60 rounded-full animate-bounce"
//               style={{ animationDelay: "0ms" }}
//             ></div>
//             <div
//               className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-bounce"
//               style={{ animationDelay: "150ms" }}
//             ></div>
//             <div
//               className="absolute top-6 right-2 w-1 h-1 bg-white/50 rounded-full animate-bounce"
//               style={{ animationDelay: "300ms" }}
//             ></div>
//           </div>
//         )}

//         {/* Active indicator */}
//         {isActive && <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>}

//         {/* Hover effect line */}
//         <div
//           className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient} transform transition-transform duration-300 ${
//             isHovered ? "scale-y-100" : "scale-y-0"
//           }`}
//         ></div>
//       </Button>
//     </Link>
//   )
// }

// export default Sidebar
