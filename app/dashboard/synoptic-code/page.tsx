"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import SynopticCodeForm from "./synoptic-code-form";
import SynopticDataTable from "./SynopticDataTable";

export interface SynopticFormValues {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
  weatherRemark: string;
  measurements: string[];
}

export default function WeatherTabsPage() {
  const [activeTab, setActiveTab] = useState<"weather" | "synoptic">("weather");

  const initialValues: SynopticFormValues = {
    dataType: "",
    stationNo: "",
    year: "",
    month: "",
    day: "",
    weatherRemark: "",
    measurements: Array(21).fill(""),
  };

  const handleSubmit = (values: SynopticFormValues) => {
    console.log(values);
    // Handle form submission
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
        Weather Data Management System
      </h1>

      <Formik<SynopticFormValues>
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        <Form>
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className={`ml-4 px-6 py-2 font-medium rounded-t-lg border-b-2 ${
                activeTab === "synoptic"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("synoptic")}
            >
              Synoptic Code
            </button>
            <button
              type="button"
              className={`px-6 py-2 font-medium rounded-t-lg border-b-2 ${
                activeTab === "weather"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("weather")}
            >
              Weather Data
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            {activeTab === "synoptic" && <SynopticCodeForm />}
            {activeTab === "weather" && <SynopticDataTable />}
          </div>
        </Form>
      </Formik>
    </main>
  );
}
