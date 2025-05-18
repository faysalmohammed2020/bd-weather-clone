"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeteorologicalDataForm } from "./meteorological-data-form";
import { FirstCardTable } from "./first-card-table";

export default function FirstCardPage() {
  const [activeTab, setActiveTab] = useState("form");

  // Callback function to refresh the table after form submission
  const handleDataSubmitted = () => {
    setActiveTab("table");
  };

  return (
    <div className=" min-h-screen">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Bangladesh Weather Data Collection
        </h1>

        <Tabs
          defaultValue="form"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full "
        >
          <TabsList className="grid w-full bg-white grid-cols-2 mb-8">
            <TabsTrigger value="form" className="text-base p-3 ">
              Data Entry Form
            </TabsTrigger>
            <TabsTrigger value="table" className="text-base p-3 ">
              View & Manage Data
            </TabsTrigger>
          </TabsList>

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
