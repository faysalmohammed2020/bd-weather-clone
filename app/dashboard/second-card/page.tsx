"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeatherObservationForm from "./SecondCard";
import { SecondCardTable } from "./SecondCardTable";

export default function Home() {
  return (
    <main className="w-full py-4 px-4">
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="mb-4 mx-auto w-full h-12">
          <TabsTrigger value="form">Observation Form</TabsTrigger>
          <TabsTrigger value="table">Observation Table</TabsTrigger>
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
