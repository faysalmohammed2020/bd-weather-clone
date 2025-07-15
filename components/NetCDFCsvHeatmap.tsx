// components/NetCDFCsvHeatmap.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import { useTranslations } from "next-intl";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface MapData {
  id: string;
  filename: string;
  plotType: string;
  lats: number[];
  lons: number[];
  z: number[][];
  windOverlay: any[];
  contourData?: any;
}

export default function NetCDFCsvHeatmap() {
  const t = useTranslations("NetCDFCsvHeatmap");
  const [maps, setMaps] = useState<MapData[]>([]);

  const titleMap: Record<string, string> = {
    t2_C: t("mapTitles.t2_C"),
    rain_mm: t("mapTitles.rain_mm"),
    rh2_percent: t("mapTitles.rh2_percent"),
    wind_combined: t("mapTitles.wind_combined"),
  };

  const colorbarTitles: Record<string, string> = {
    t2_C: t("colorbarTitles.t2_C"),
    rain_mm: t("colorbarTitles.rain_mm"),
    rh2_percent: t("colorbarTitles.rh2_percent"),
    wind_combined: t("colorbarTitles.wind_combined"),
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results: any) => {
          const data = results.data.filter((d: any) => d.lat && d.lon);

          const lats = Array.from(new Set(data.map((d: any) => d.lat))).sort(
            (a, b) => a - b
          );
          const lons = Array.from(new Set(data.map((d: any) => d.lon))).sort(
            (a, b) => a - b
          );

          const latLen = lats.length;
          const lonLen = lons.length;

          const z: number[][] = Array.from({ length: latLen }, () =>
            new Array(lonLen).fill(0)
          );

          let variable = "";
          if ("t2_C" in data[0]) variable = "t2_C";
          else if ("rain_mm" in data[0]) variable = "rain_mm";
          else if ("rh2_percent" in data[0]) variable = "rh2_percent";
          else if ("speed" in data[0] && "direction_deg" in data[0])
            variable = "wind_combined";

          let windOverlay: any[] = [];
          let contourData: any = null;

          if (variable === "wind_combined") {
            const zSpeed: number[][] = Array.from({ length: latLen }, () =>
              new Array(lonLen).fill(0)
            );
            const arrows: any[] = [];

            data.forEach((d: any) => {
              const i = lats.indexOf(d.lat);
              const j = lons.indexOf(d.lon);
              const speed = d.speed ?? 0;
              const dir = d.direction_deg ?? 0;
              zSpeed[i][j] = speed;

              const angleRad = ((dir - 90) * Math.PI) / 180;
              const arrowLength = Math.min(Math.max(speed / 20, 0.1), 0.5);
              const dx = Math.cos(angleRad) * arrowLength;
              const dy = Math.sin(angleRad) * arrowLength;

              const color =
                speed > 15 ? "#FF4444" : speed > 8 ? "#FF8C00" : "#4169E1";
              const width = speed > 15 ? 2 : speed > 8 ? 1.5 : 1;

              arrows.push({
                type: "scatter",
                mode: "lines",
                x: [d.lon, d.lon + dx],
                y: [d.lat, d.lat + dy],
                line: { color: color, width: width },
                showlegend: false,
                hoverinfo: "none",
              });

              arrows.push({
                type: "scatter",
                mode: "markers",
                x: [d.lon + dx],
                y: [d.lat + dy],
                marker: {
                  color: color,
                  size: 4,
                  symbol: "triangle-up",
                  angle: dir,
                },
                showlegend: false,
                hoverinfo: "none",
              });
            });

            windOverlay = arrows;

            const newMapData: MapData = {
              id: `${file.name}-${Date.now()}-${index}`,
              filename: file.name,
              plotType: variable,
              lats,
              lons,
              z: zSpeed,
              windOverlay: arrows,
            };

            setMaps((prev) => [...prev, newMapData]);
          } else {
            data.forEach((d: any) => {
              const i = lats.indexOf(d.lat);
              const j = lons.indexOf(d.lon);
              const value = d[variable] ?? 0;
              z[i][j] = value;
            });

            if (variable === "rain_mm" || variable === "t2_C") {
              contourData = {
                z: z,
                x: lons,
                y: lats,
                type: "contour",
                colorscale: getColorScale(variable),
                contours: {
                  showlines: true,
                  linecolor: variable === "rain_mm" ? "#1f77b4" : "#d62728",
                  linewidth: 1,
                },
                showscale: true,
                opacity: 0.7,
              };
            }

            const newMapData: MapData = {
              id: `${file.name}-${Date.now()}-${index}`,
              filename: file.name,
              plotType: variable,
              lats,
              lons,
              z,
              windOverlay: [],
              contourData,
            };

            setMaps((prev) => [...prev, newMapData]);
          }
        },
      });
    });

    e.target.value = "";
  };

  const removeMap = (id: string) => {
    setMaps((prev) => prev.filter((map) => map.id !== id));
  };

  const clearAllMaps = () => {
    setMaps([]);
  };

  const getColorScale = (plotType: string) => {
    switch (plotType) {
      case "t2_C":
        return [
          [0, "#313695"],
          [0.1, "#4575b4"],
          [0.2, "#74add1"],
          [0.3, "#abd9e9"],
          [0.4, "#e0f3f8"],
          [0.5, "#ffffcc"],
          [0.6, "#fee090"],
          [0.7, "#fdae61"],
          [0.8, "#f46d43"],
          [0.9, "#d73027"],
          [1, "#a50026"],
        ];
      case "rain_mm":
        return [
          [0, "#f7fbff"],
          [0.1, "#deebf7"],
          [0.2, "#c6dbef"],
          [0.3, "#9ecae1"],
          [0.4, "#6baed6"],
          [0.5, "#4292c6"],
          [0.6, "#2171b5"],
          [0.7, "#08519c"],
          [0.8, "#08306b"],
          [0.9, "#041f4a"],
          [1, "#020c1f"],
        ];
      case "rh2_percent":
        return [
          [0, "#fff5f0"],
          [0.2, "#fee0d2"],
          [0.4, "#fcbba1"],
          [0.5, "#fc9272"],
          [0.6, "#fb6a4a"],
          [0.7, "#ef3b2c"],
          [0.8, "#cb181d"],
          [0.9, "#a50f15"],
          [1, "#67000d"],
        ];
      case "wind_combined":
        return [
          [0, "#440154"],
          [0.2, "#31688e"],
          [0.4, "#35b779"],
          [0.6, "#fde725"],
          [0.8, "#fd8d3c"],
          [1, "#d73027"],
        ];
      default:
        return "Viridis";
    }
  };

  const getPlotData = (mapData: MapData) => {
    const baseData = [];

    if (mapData.plotType === "rain_mm") {
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "contour",
        colorscale: getColorScale(mapData.plotType),
        contours: {
          coloring: "fill",
          showlines: true,
          linecolor: "#1f77b4",
          linewidth: 0.5,
        },
        showscale: true,
        colorbar: {
          title: colorbarTitles[mapData.plotType],
          titleside: "right",
        },
      });
    } else if (mapData.plotType === "t2_C") {
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.plotType),
        showscale: true,
        colorbar: {
          title: colorbarTitles[mapData.plotType],
          titleside: "right",
        },
      });

      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "contour",
        colorscale: getColorScale(mapData.plotType),
        contours: {
          coloring: "none",
          showlines: true,
          linecolor: "rgba(255,255,255,0.5)",
          linewidth: 1,
        },
        showscale: false,
        hoverinfo: "skip",
      });
    } else if (mapData.plotType === "wind_combined") {
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.plotType),
        showscale: true,
        colorbar: {
          title: colorbarTitles[mapData.plotType],
          titleside: "right",
        },
        opacity: 0.8,
      });
    } else {
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.plotType),
        showscale: true,
        colorbar: {
          title: colorbarTitles[mapData.plotType],
          titleside: "right",
        },
      });
    }

    return [...baseData, ...mapData.windOverlay];
  };

  const getLayoutConfig = (mapData: MapData) => {
    const baseLayout = {
      title: {
        text: `${titleMap[mapData.plotType]} - ${mapData.filename}`,
        font: { size: 14, family: "Arial, sans-serif" },
      },
      xaxis: {
        title: t("axisLabels.x"),
        showgrid: true,
        gridcolor: "rgba(255,255,255,0.2)",
      },
      yaxis: {
        title: t("axisLabels.y"),
        showgrid: true,
        gridcolor: "rgba(255,255,255,0.2)",
      },
      width: 550,
      height: 450,
      margin: { l: 60, r: 60, t: 60, b: 60 },
      paper_bgcolor: "#f8f9fa",
      plot_bgcolor: "#ffffff",
    };

    if (mapData.plotType === "rain_mm") {
      baseLayout.annotations = [
        {
          text: t("annotations.precipitation"),
          showarrow: false,
          x: 0.02,
          y: 0.98,
          xref: "paper",
          yref: "paper",
          xanchor: "left",
          yanchor: "top",
          font: { size: 10, color: "#666" },
        },
      ];
    } else if (mapData.plotType === "wind_combined") {
      baseLayout.annotations = [
        {
          text: t("annotations.wind"),
          showarrow: false,
          x: 0.02,
          y: 0.98,
          xref: "paper",
          yref: "paper",
          xanchor: "left",
          yanchor: "top",
          font: { size: 9, color: "#666" },
        },
      ];
    }

    return baseLayout;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            {t("title")}
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("uploadLabel")}
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSV}
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("uploadHint")}
              </p>
            </div>

            {maps.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={clearAllMaps}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition-colors"
                  >
                    {t("clearAll")}
                  </button>
                  <span className="text-sm text-gray-600 py-2">
                    {t("activeVisualizations", { count: maps.length })}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  {t("professionalTag")}
                </div>
              </div>
            )}
          </div>
        </div>

        {maps.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("noData.title")}
            </h3>
            <p className="text-gray-500">
              {t("noData.description")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {maps.map((mapData) => (
            <div
              key={mapData.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {titleMap[mapData.plotType] || t("mapTitles.default")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("datasetLabel", { filename: mapData.filename })}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMap(mapData.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    {t("removeButton")}
                  </button>
                </div>
              </div>

              <div className="p-2">
                <Plot
                  data={getPlotData(mapData)}
                  layout={getLayoutConfig(mapData)}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: [
                      "lasso2d",
                      "select2d",
                      "autoScale2d",
                    ],
                    displaylogo: false,
                    toImageButtonOptions: {
                      format: "png",
                      filename: `${mapData.plotType}_${mapData.filename}`,
                      height: 450,
                      width: 550,
                      scale: 2,
                    },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}