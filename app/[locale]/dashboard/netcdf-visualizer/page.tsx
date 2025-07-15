"use client";

import NetCDFCsvHeatmap from "@/components/NetCDFCsvHeatmap";
import NetCDFVisualizer from "@/components/NetCDFVisualizer";
import UploadAndVisualize from "@/components/UploadAndVisualize";



export default function NetCDFVisualizerPage() {
  return (
    <div className="">
      <NetCDFVisualizer />
      <UploadAndVisualize />
      <NetCDFCsvHeatmap />
    </div>
  );
}
