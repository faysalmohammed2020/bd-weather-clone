"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeatherObservationForm from "./SecondCard";
import { SecondCardTable } from "./SecondCardTable";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <main className="w-full py-4 px-4">
      <Tabs
        defaultValue="form"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8 gap-4 bg-transparent">
          <TabsTrigger
            value="form"
            className={cn(
              "text-base p-3 border border-gray-300 bg-white flex items-center gap-2",
              {
                "border-blue-500 text-blue-700 !bg-blue-50":
                  activeTab === "form",
              }
            )}
          >
            Observation Form
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className={cn(
              "text-base p-3 border border-gray-300 bg-white flex items-center gap-2",
              {
                "border-blue-500 text-blue-700 !bg-blue-50":
                  activeTab === "table",
              }
            )}
          >
            Observation Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <WeatherObservationForm />
        </TabsContent>

        <TabsContent value="table">
          <SecondCardTable />
        </TabsContent>
      </Tabs>
    </main>
  );
}
