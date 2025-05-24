"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { categoryColors } from "@/lib/constants"; // optional
import { Loader2 } from "lucide-react";

interface Measurement {
  id: number;
  label: string;
  range: string;
  unit: string;
  category: string;
  value: string;
}

interface MeasurementsTableProps {
  payload: Record<string, any>;
}

const MeasurementsTable: React.FC<MeasurementsTableProps> = ({ payload }) => {
  const [data, setData] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/daily-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result); // assumes result is an array of Measurement
      } catch (err) {
        setError("Error fetching measurement data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [payload]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading measurements...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-6">{error}</div>;
  }

  return (
    <Card className="overflow-x-auto border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Detailed Measurements Table</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Measurement</th>
              <th className="px-4 py-2 font-medium">Range</th>
              <th className="px-4 py-2 font-medium">Unit</th>
              <th className="px-4 py-2 font-medium">Value</th>
              <th className="px-4 py-2 font-medium">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((item, index) => {
              const categoryStyle = categoryColors[item.category] || {
                bg: "bg-gray-50",
                text: "text-gray-700",
                border: "border-gray-200",
                icon: null,
              };
              return (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{item.label}</td>
                  <td className="px-4 py-2 text-gray-600">{item.range}</td>
                  <td className="px-4 py-2 text-gray-600">{item.unit}</td>
                  <td className="px-4 py-2 text-gray-900">{item.value}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                    >
                      {categoryStyle.icon}
                      {item.category}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default MeasurementsTable;
