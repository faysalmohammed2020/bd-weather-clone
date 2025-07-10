"use client";

import SpatialAnalysis from "@/components/NetCDF";
import NetCDFSpatialAnalyzer from "@/components/NetCDFSpatialAnalysis";

export default function NetCDFVisualizerPage() {
    return (

        <div className="bg-white rounded-lg shadow-md p-6">
            <NetCDFSpatialAnalyzer/>
            <SpatialAnalysis/>
        </div>
    );
}