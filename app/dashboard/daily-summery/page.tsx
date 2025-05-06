"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeatherDataTable from "./weatherDataTable";
import WeatherDataForm from "./weather-data-form";
import ExampleTable from "./weatherSummaryTable";

export default function DailySummaryPage() {
  const [activeTab, setActiveTab] = useState<string>("form");

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-center mb-6">DAILY SUMMARY</h1>

      <Tabs defaultValue="form" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Daily Summary Form</TabsTrigger>
          <TabsTrigger value="reporttable">Report Table</TabsTrigger>
          <TabsTrigger value="report">Advance Table</TabsTrigger>
        </TabsList>

        <TabsContent value="reporttable" className="mt-6">
          {/* <WeatherDataForm /> */}
          <WeatherDataTable />
        </TabsContent>

        <TabsContent value="report" className="mt-6">
          {/* <WeatherDataTable /> */}
          <ExampleTable />
        </TabsContent>

        <TabsContent value="form" className="mt-6">
          <WeatherDataForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
