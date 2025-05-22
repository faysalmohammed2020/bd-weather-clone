"use client";

import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstCardTable from "../first-card-view/page";
import SecondCardTable from "../second-card-view/page";
import SynopticCodeTable from "../synoptic-code/synoptic-components/synoptic-table";
import DailySummaryPage from "../daily-summery/page";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function AllViewAndManagePage() {
   const [activeTab, setActiveTab] = useState("first-card");
  const firstCardRef = useRef<any>(null);
  const secondCardRef = useRef<any>(null);
  const synopticRef = useRef<any>(null);
  const summaryRef = useRef<any>(null);

  const exportToExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Get data from each component
    const firstCardData = firstCardRef.current?.getData?.() || [];
    const secondCardData = secondCardRef.current?.getData?.() || [];
    const synopticData = synopticRef.current?.getData?.() || [];
    const dailySummaryData = summaryRef.current?.getData?.() || [];

    // Create worksheets for each dataset
    const firstCardSheet = XLSX.utils.json_to_sheet(firstCardData);
    const secondCardSheet = XLSX.utils.json_to_sheet(secondCardData);
    const synopticSheet = XLSX.utils.json_to_sheet(synopticData);
    const dailySummarySheet = XLSX.utils.json_to_sheet(dailySummaryData);

    // Add worksheets to the workbook with appropriate names
    XLSX.utils.book_append_sheet(wb, firstCardSheet, "First Card");
    XLSX.utils.book_append_sheet(wb, secondCardSheet, "Second Card");
    XLSX.utils.book_append_sheet(wb, synopticSheet, "Synoptic Code");
    XLSX.utils.book_append_sheet(wb, dailySummarySheet, "Daily Summary");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "Weather_Data_All_Tabs.xlsx");
  };

  return (
     <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">All View & Manage</h1>
        <Button onClick={exportToExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4" />
          Export All to Excel
        </Button>
      </div>

      <Tabs defaultValue="first-card" onValueChange={(value) => setActiveTab(value)} className="w-full">
        <TabsList className="bg-white shadow rounded-lg p-1 flex justify-start gap-2 overflow-x-auto">
          <TabsTrigger value="first-card">First Card</TabsTrigger>
          <TabsTrigger value="second-card">Second Card</TabsTrigger>
          <TabsTrigger value="synoptic-code">Synoptic Code</TabsTrigger>
          <TabsTrigger value="daily-summary">Daily Summary</TabsTrigger>
        </TabsList>

        <div className="mt-6 rounded-lg border bg-white p-4 shadow">
          <div hidden={activeTab !== "first-card"}>
            <FirstCardTable ref={firstCardRef} />
          </div>
          <div hidden={activeTab !== "second-card"}>
            <SecondCardTable ref={secondCardRef} />
          </div>
          <div hidden={activeTab !== "synoptic-code"}>
            <SynopticCodeTable ref={synopticRef} />
          </div>
          <div hidden={activeTab !== "daily-summary"}>
            <DailySummaryPage ref={summaryRef} />
          </div>
        </div>
      </Tabs>
    </div>
  );
}