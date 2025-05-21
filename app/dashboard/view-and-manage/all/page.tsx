"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstCardTable from "../first-card-view/page";
import SecondCardTable from "../second-card-view/page";
import SynopticCodeTable from "../synoptic-code/synoptic-components/synoptic-table";
import DailySummaryPage from "../daily-summery/page";

export default function AllViewAndManagePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">All View & Manage</h1>

      <Tabs defaultValue="first-card" className="w-full">
        <TabsList className="bg-white shadow rounded-lg p-1 flex justify-start gap-2 overflow-x-auto">
          <TabsTrigger
            value="first-card"
            className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-sky-700 font-medium px-4 py-2 rounded-md hover:bg-sky-100 transition"
          >
            First Card
          </TabsTrigger>
          <TabsTrigger
            value="second-card"
            className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-sky-700 font-medium px-4 py-2 rounded-md hover:bg-sky-100 transition"
          >
            Second Card
          </TabsTrigger>
          <TabsTrigger
            value="synoptic-code"
            className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-sky-700 font-medium px-4 py-2 rounded-md hover:bg-sky-100 transition"
          >
            Synoptic Code
          </TabsTrigger>
          <TabsTrigger
            value="daily-summary"
            className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-sky-700 font-medium px-4 py-2 rounded-md hover:bg-sky-100 transition"
          >
            Daily Summary
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 rounded-lg border bg-white p-4 shadow">
          <TabsContent value="first-card">
            <FirstCardTable />
          </TabsContent>
          <TabsContent value="second-card">
            <SecondCardTable />
          </TabsContent>
          <TabsContent value="synoptic-code">
            <SynopticCodeTable />
          </TabsContent>
          <TabsContent value="daily-summary">
            <DailySummaryPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
