
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

// Main Tabs Wrapper
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col space-y-4", className)}
      {...props}
    />
  )
}

// Tabs Navigation Bar
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center justify-start rounded-xl gap-2 bg-gray-100 dark:bg-gray-800 p-1 shadow-inner border border-gray-200 dark:border-gray-700 w-full md:w-fit",
        className
      )}
      {...props}
    />
  )
}

// Individual Tab Button
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200",
        "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        // Rounded & styling for active tab
        "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:rounded-lg",
        "dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white",
        className
      )}
      {...props}
    />
  )
}

// Content Area
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
