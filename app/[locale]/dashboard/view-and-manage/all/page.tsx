"use client"

import { useRef, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FirstCardTable from "../first-card-view/page"
import SecondCardTable from "../second-card-view/page"
import SynopticCodeTable from "../synoptic-code/page"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import dynamic from "next/dynamic"
import DailySummaryTable from "../daily-summery/daily-summery"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

const CompactPDFExportButton = dynamic(() => import("../PdfExportComponent"), { ssr: false })

export default function AllViewAndManagePage() {
  const t = useTranslations("AllViewAndManagePage")
  const [activeTab, setActiveTab] = useState("first-card")
  const { data: session } = useSession()

  const firstCardRef = useRef<any>(null)
  const secondCardRef = useRef<any>(null)
  const synopticRef = useRef<any>(null)
  const dailySummeryRef = useRef<any>(null)

  const exportToExcel = () => {
    toast.promise(
      new Promise((resolve, reject) => {
        try {
          const wb = XLSX.utils.book_new();

          const firstCardData = firstCardRef.current?.getData?.() || [];
          const secondCardData = secondCardRef.current?.getData?.() || [];
          const synopticData = synopticRef.current?.getData?.() || [];
          const dailySummaryData = dailySummeryRef.current?.getData?.() || [];

          const excludedKeys = [
            'id',
            'stationId',
            'stationCode',
            'stationName',
            'submittedAt',
            'createdAt',
            'updatedAt',
            'tabActive',
            'observingTime',
            'observingTimeId',
            'localTime',
            'c2Indicator'
          ];

          const cleanData = (data: any[]) => {
            return data.map(item => {
              const cleaned: Record<string, any> = {};
              Object.keys(item).forEach(key => {
                if (!excludedKeys.includes(key)) {
                  cleaned[key] = item[key];
                }
              });
              return cleaned;
            });
          };

          const cleanFirst = cleanData(firstCardData);
          const cleanSecond = cleanData(secondCardData);
          const cleanSynoptic = cleanData(synopticData);
          const cleanSummary = cleanData(dailySummaryData);

          // Create worksheets
          const firstSheet = XLSX.utils.json_to_sheet(cleanFirst);
          const secondSheet = XLSX.utils.json_to_sheet(cleanSecond);
          const synopticSheet = XLSX.utils.json_to_sheet(cleanSynoptic);
          const summarySheet = XLSX.utils.json_to_sheet(cleanSummary);

          // Add sheets to workbook
          XLSX.utils.book_append_sheet(wb, firstSheet, t("tabs.firstCard"));
          XLSX.utils.book_append_sheet(wb, secondSheet, t("tabs.secondCard"));
          XLSX.utils.book_append_sheet(wb, synopticSheet, t("tabs.synopticCode"));
          XLSX.utils.book_append_sheet(wb, summarySheet, t("tabs.dailySummary"));

          // Export
          XLSX.writeFile(wb, "Weather_Data_All_Tabs.xlsx");
          resolve(true);
        } catch (error) {
          console.error("Export error:", error);
          reject(error);
        }
      }),
      {
        loading: t("loading"),
        success: () => t("success.exportSuccess"),
        error: () => t("errors.exportFailed")
      }
    );
  };

  // Prepare station info for PDF
  const stationInfo = {
    stationId: session?.user?.station?.stationId || "41953",
    stationName: session?.user?.station?.name || t("station"),
    date: new Date().toLocaleDateString("ar-EG"),
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 min-h-screen" dir="rtl">
      {/* Header Section - Responsive */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 break-words">
          {t("title")}
        </h1>

        {/* Export Buttons - Responsive Layout */}
        {(session?.user?.role === "super_admin" || session?.user?.role === "station_admin") && (
          <div className="flex items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Excel Export Button */}
            <Button 
              onClick={exportToExcel} 
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 w-1/2 sm:w-auto text-sm sm:text-base px-3 py-2"
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t("exportExcel")}</span>
            </Button>

            {/* Compact PDF Export Button */}
            <div className="w-1/2 sm:w-auto">
              <CompactPDFExportButton
                firstCardRef={firstCardRef}
                secondCardRef={secondCardRef}
                synopticRef={synopticRef}
                dailySummeryRef={dailySummeryRef}
                stationInfo={stationInfo}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs Section - Responsive */}
      <Tabs defaultValue="first-card" onValueChange={(value) => setActiveTab(value)} className="w-full">
        {/* Tab Navigation - Responsive with Horizontal Scroll */}
        <div className="w-full md:w-[200px]">
          <TabsList className="bg-gradient-to-r from-blue-400 to-blue-500 shadow rounded-lg p-1 flex justify-start gap-1 sm:gap-2 min-w-max w-full h-12 sm:w-auto">
            <TabsTrigger 
              value="first-card" 
              className="whitespace-nowrap text-xs md:text-md sm:text-sm px-2 sm:px-3 py-4 sm:py-6 data-[state=active]:text-blue-500 data-[state=inactive]:text-white"
            >
              {t("tabs.firstCard")}
            </TabsTrigger>
            <TabsTrigger 
              value="second-card"
              className="whitespace-nowrap text-xs md:text-md sm:text-sm px-2 sm:px-3 py-4 sm:py-6 data-[state=active]:text-blue-500 data-[state=inactive]:text-white"
            >
              {t("tabs.secondCard")}
            </TabsTrigger>
            <TabsTrigger 
              value="synoptic-code"
              className="whitespace-nowrap text-xs md:text-md sm:text-sm px-2 sm:px-3 py-4 sm:py-6 data-[state=active]:text-blue-500 data-[state=inactive]:text-white"
            >
              {t("tabs.synopticCode")}
            </TabsTrigger>
            <TabsTrigger 
              value="daily-summery"
              className="whitespace-nowrap text-xs md:text-md sm:text-sm px-2 sm:px-3 py-4 sm:py-6 data-[state=active]:text-blue-500 data-[state=inactive]:text-white"
            >
              {t("tabs.dailySummary")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area - Responsive */}
        <div className="mt-4 md:mt-6 rounded-lg border bg-white shadow overflow-hidden">
          <div className="p-2 sm:p-4 overflow-x-auto">
            <div hidden={activeTab !== "first-card"}>
              <FirstCardTable ref={firstCardRef} />
            </div>
            <div hidden={activeTab !== "second-card"}>
              <SecondCardTable ref={secondCardRef} />
            </div>
            <div hidden={activeTab !== "synoptic-code"}>
              <SynopticCodeTable ref={synopticRef} />
            </div>
            <div hidden={activeTab !== "daily-summery"}>
              <DailySummaryTable ref={dailySummeryRef} />
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}