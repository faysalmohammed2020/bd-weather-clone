"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeteorologicalDataForm } from "./meteorological-data-form";
import { FirstCardTable } from "./first-card-table";
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import HourSelector from "@/components/hour-selector";

export default function FirstCardPage() {
  const [activeTab, setActiveTab] = useState("form");

  // Callback function to refresh the table after form submission
  const handleDataSubmitted = () => {
    setActiveTab("table");
  };

  return (
    <div className=" min-h-screen">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold mb-6 text-center text-slate-700">
          Bangladesh Weather Data Collection
        </h1>

        <Tabs
          defaultValue="form"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full "
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 gap-4 bg-transparent">
            <TabsTrigger value="form" className={cn("text-base p-3 border border-gray-300 bg-white flex items-center gap-2", {
              "border-blue-500 text-blue-700 !bg-blue-50": activeTab === "form",
            })}>  
              <Pencil className="size-5" />
              <span className="font-medium">
                Data Entry Form
              </span>
            </TabsTrigger>
            <TabsTrigger value="table" className={cn("text-base p-3 border border-gray-300 bg-white flex items-center gap-2", {
              "border-blue-500 text-blue-700 !bg-blue-50": activeTab === "table",
            })}>
              <Eye className="size-5"/>
              <span className="font-medium">
                View & Manage Data
              </span>
            </TabsTrigger>
          </TabsList>

          <HourSelector />

          <TabsContent value="form" className="mt-0">
            <MeteorologicalDataForm onDataSubmitted={handleDataSubmitted} />
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <FirstCardTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
