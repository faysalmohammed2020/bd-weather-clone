"use client";

import { useState } from "react";
import WeatherDataForm from "./weather-data-form";
import DailySummaryTable from "./tabs/DailySummaryTable";

export default function DailySummaryPage() {
  const [activeTab, setActiveTab] = useState<"form" | "summary">("form");

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          className={`px-6 py-2 font-medium rounded-t-lg border-b-2 transition ${
            activeTab === "form"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Weather Form
        </button>
        <button
          type="button"
          className={`ml-4 px-6 py-2 font-medium rounded-t-lg border-b-2 transition ${
            activeTab === "summary"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("summary")}
        >
          Daily Summary
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-4 rounded-lg shadow">
        {activeTab === "form" && <WeatherDataForm />}
        {activeTab === "summary" && <DailySummaryTable />}
      </div>
    </main>
  );
}
