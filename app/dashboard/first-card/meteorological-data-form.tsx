"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Thermometer,
  Wind,
  Eye,
  Cloud,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { hygrometricTable } from "../../../data/hygrometric-table"; // Import the hygrometric table data

import { useSession } from "@/lib/auth-client";
import { stationDataMap } from "@/data/station-data-map";
import BasicInfoTab from "@/components/basic-info-tab";

type MeteorologicalFormData = {
  presentWeatherWW?: string;
  subIndicator?: string;
  alteredThermometer?: string;
  barAsRead?: string;
  correctedForIndex?: string;
  heightDifference?: string;
  stationLevelPressure?: string;
  seaLevelReduction?: string;
  correctedSeaLevelPressure?: string;
  afternoonReading?: string;
  pressureChange24h?: string;
  dryBulbAsRead?: string;
  wetBulbAsRead?: string;
  maxMinTempAsRead?: string;
  dryBulbCorrected?: string;
  wetBulbCorrected?: string;
  maxMinTempCorrected?: string;
  Td?: string;
  relativeHumidity?: string;
  squallConfirmed?: boolean;
  squallForce?: string;
  squallDirection?: string;
  squallTime?: string;
  horizontalVisibility?: string;
  miscMeteors?: string;
  pastWeatherW1?: string;
  pastWeatherW2?: string;
  c2Indicator?: string;
  observationTime?: string;
  stationName?: string;
  stationNo?: string;
  year?: string;
  cloudCover?: string;
  visibility?: string;
  // Add any other fields you use in formData here
};

export function MeteorologicalDataForm({ onDataSubmitted }) {
  const [formData, setFormData] = useState<MeteorologicalFormData>({});
  const [activeTab, setActiveTab] = useState("temperature");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hygrometricData, setHygrometricData] = useState({
    dryBulb: "",
    wetBulb: "",
    difference: "",
    dewPoint: "",
    relativeHumidity: "",
  });

  const { data: session } = useSession();


  // Refs for multi-box inputs to handle auto-focus
  const dataTypeRefs = [useRef(null), useRef(null)];
  const stationNoRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const yearRefs = [useRef(null), useRef(null)];

  // Tab order for navigation
  const tabOrder = [
    "temperature",
    "pressure",
    "squall",
    "V.V",
    "weather",
    "indicators",
  ];

  // Tab styles with gradients and more vibrant colors
  const tabStyles = {
    temperature: {
      tab: "from-blue-300 to-blue-200 text-blue-800 hover:opacity-90 shadow-sm shadow-blue-100/50",
      card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
      icon: <Thermometer className="h-4 w-4 mr-1" />,
    },
    pressure: {
      tab: "from-rose-300 to-rose-200 text-rose-800 hover:opacity-90 shadow-sm shadow-rose-100/50",
      card: "bg-gradient-to-br from-rose-50 to-white border-l-4 border-rose-200 shadow-sm",
      icon: <BarChart3 className="h-4 w-4 mr-1" />,
    },
    squall: {
      tab: "from-amber-300 to-amber-200 text-amber-800 hover:opacity-90 shadow-sm shadow-amber-100/50",
      card: "bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-200 shadow-sm",
      icon: <Wind className="h-4 w-4 mr-1" />,
    },
    "V.V": {
      tab: "from-orange-300 to-orange-200 text-orange-800 hover:opacity-90 shadow-sm shadow-orange-100/50",
      card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
      icon: <Eye className="h-4 w-4 mr-1" />,
    },
    weather: {
      tab: "from-cyan-300 to-cyan-200 text-cyan-800 hover:opacity-90 shadow-sm shadow-cyan-100/50",
      card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
      icon: <Cloud className="h-4 w-4 mr-1" />,
    },
    indicators: {
      tab: "from-fuchsia-300 to-fuchsia-200 text-fuchsia-800 hover:opacity-90 shadow-sm shadow-fuchsia-100/50",
      card: "bg-gradient-to-br from-fuchsia-50 to-white border-l-4 border-fuchsia-200 shadow-sm",
      icon: <Clock className="h-4 w-4 mr-1" />,
    },
  };

  // Debug logging for formData changes
  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const calculateDewPointAndHumidity = (dryBulbInput, wetBulbInput) => {
    if (!dryBulbInput || !wetBulbInput) return;

    // Convert 3-digit inputs like "256" => 25.6
    const dryBulbValue = Number.parseFloat(
      `${dryBulbInput.slice(0, 2)}.${dryBulbInput.slice(2)}`
    );
    const wetBulbValue = Number.parseFloat(
      `${wetBulbInput.slice(0, 2)}.${wetBulbInput.slice(2)}`
    );

    const difference = Number(Math.abs(dryBulbValue - wetBulbValue).toFixed(1));
    const roundedDryBulb = Math.round(dryBulbValue);

    // Validate ranges
    if (roundedDryBulb < 0 || roundedDryBulb > 50 || difference > 30.0) {
      toast.error(
        "Temperature values are outside the range of the hygrometric table"
      );
      return;
    }

    // Find index of the difference in 'differences'
    const diffIndex = hygrometricTable.differences.indexOf(difference);
    if (diffIndex === -1) {
      toast.error("Invalid temperature difference for lookup");
      return;
    }

    // Find the dbT entry
    const dbtEntry = hygrometricTable.data.find(
      (entry) => entry.dbT === roundedDryBulb
    );
    if (!dbtEntry || !dbtEntry.values || !dbtEntry.values[diffIndex]) {
      toast.error(
        "Could not find matching dry bulb temperature or difference in the table"
      );
      return;
    }

    const { DpT, RH } = dbtEntry.values[diffIndex];

    // Update state
    setHygrometricData({
      dryBulb: dryBulbValue.toFixed(1),
      wetBulb: wetBulbValue.toFixed(1),
      difference: difference.toString(),
      dewPoint: DpT.toString(),
      relativeHumidity: RH.toString(),
    });

    setFormData((prev) => ({
      ...prev,
      Td: DpT.toString(),
      relativeHumidity: RH.toString(),
    }));

    toast.success("Dew point and relative humidity calculated successfully");
  };

  useEffect(() => {
    const year = new Date().getFullYear().toString(); // e.g., "2025"
    setFormData((prev) => ({
      ...prev,
      subIndicator: "1",
      year: year.slice(2), // only "25" for last two digits
      stationNo: session?.user?.stationId || "",
      stationName: session?.user?.stationName || "",
    }));
  }, []);

  const calculatePressureValues = (
    dryBulb: string,
    barAsRead: string,
    stationId: string
  ) => {
    if (!dryBulb || !barAsRead || !stationId) return;

    const userStationData = stationDataMap[stationId];
    if (!userStationData) {
      toast.error("Station data not found");
      return;
    }

    const correctionTable = userStationData.station.correction_table;
    const dryBulbValue = Number.parseFloat(dryBulb) / 10;
    const roundedDryBulb = Math.round(dryBulbValue);

    const barAsReadValue = Number.parseFloat(barAsRead) / 10;

    const correctionEntry = correctionTable.find(
      (entry) => entry.dry_bulb_temp_c === roundedDryBulb
    );

    if (!correctionEntry) {
      toast.error(
        `Dry bulb temperature ${roundedDryBulb}°C not found in correction table`
      );
      return;
    }

    const availablePressures = Object.keys(
      correctionEntry.cistern_level_pressure
    )
      .map(Number)
      .sort((a, b) => a - b);

    const closestPressure = availablePressures.reduce((prev, curr) =>
      Math.abs(curr - barAsReadValue) < Math.abs(prev - barAsReadValue)
        ? curr
        : prev
    );

    const heightCorrection =
      correctionEntry.cistern_level_pressure[closestPressure.toString()];
    const stationLevelPressure = barAsReadValue + heightCorrection;

    const seaLevelCorrection =
      correctionEntry.sea_level_pressure?.[closestPressure.toString()];

    return {
      stationLevelPressure: Math.round(stationLevelPressure * 10).toString(), // e.g., "10041"
      heightDifference: `+${Math.round(heightCorrection * 100)}`, // e.g., "+95"
      seaLevelReduction:
        seaLevelCorrection !== undefined
          ? `+${Math.round(seaLevelCorrection * 100)}`
          : undefined,
    };
  };

  const calculateSeaLevelPressure = (
    dryBulb: string,
    stationLevelPressure: string,
    stationId: string
  ) => {
    if (!dryBulb || !stationLevelPressure || !stationId) return;

    const userStationData = stationDataMap[stationId];
    if (!userStationData) {
      toast.error("Station data not found");
      return;
    }

    const seaCorrectionTable = userStationData.sea.correction_table;
    const dryBulbValue = Number.parseFloat(dryBulb) / 10;
    const roundedDryBulb = Math.round(dryBulbValue);

    // Convert 5-digit string pressure to decimal (e.g., "10041" → 1004.1)
    const stationPressureValue = Number.parseFloat(stationLevelPressure) / 10;

    const correctionEntry = seaCorrectionTable.find(
      (entry) => entry.dry_bulb_temp_c === roundedDryBulb
    );

    if (!correctionEntry) {
      toast.error(
        `Dry bulb temperature ${roundedDryBulb}°C not found in sea level correction table`
      );
      return;
    }

    const availablePressures = Object.keys(
      correctionEntry.station_level_pressure
    )
      .map(Number)
      .sort((a, b) => a - b);

    const closestPressure = availablePressures.reduce((prev, curr) =>
      Math.abs(curr - stationPressureValue) <
      Math.abs(prev - stationPressureValue)
        ? curr
        : prev
    );

    const seaLevelReduction =
      correctionEntry.station_level_pressure[closestPressure.toString()];
    const seaLevelPressure = stationPressureValue + seaLevelReduction;

    return {
      seaLevelReduction: `+${Math.round(seaLevelReduction * 100)}`, // e.g., 0.95 → "+95"
      correctedSeaLevelPressure: Math.round(seaLevelPressure * 10).toString(), // e.g., 1004.1 → "10041"
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare data (removed redundant stationInfo nesting)
      const submissionData = {
        ...formData,
        ...hygrometricData, // Include hygrometric data directly
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/first-card-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save data");
      }

      const result = await response.json();

      toast.success("Data saved successfully!", {
        description: `Entry #${result.dataCount} saved`,
      });

      // Reset only measurement fields (preserves station info)
      setFormData((prev) => ({
        stationName: prev.stationName,
        stationNo: prev.stationNo,
        year: prev.year,
        // Clear other fields
        cloudCover: "",
        visibility: "",
        // ... other fields to reset
      }));

      setHygrometricData({
        dryBulb: "",
        wetBulb: "",
        difference: "",
        dewPoint: "",
        relativeHumidity: "",
      });

      // Notify parent component that data was submitted
      if (onDataSubmitted) {
        onDataSubmitted();
      }

      // Reset to first tab after submission
      setActiveTab("temperature");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Dew point & humidity calculation
    if (name === "dryBulbAsRead" || name === "wetBulbAsRead") {
      const dryBulb = name === "dryBulbAsRead" ? value : formData.dryBulbAsRead;
      const wetBulb = name === "wetBulbAsRead" ? value : formData.wetBulbAsRead;

      if (dryBulb && wetBulb) {
        calculateDewPointAndHumidity(dryBulb, wetBulb);
      }
    }

    // Station level + Sea level pressure calculation
    if (name === "dryBulbAsRead" || name === "barAsRead") {
      const dryBulb = name === "dryBulbAsRead" ? value : formData.dryBulbAsRead;
      const barAsRead = name === "barAsRead" ? value : formData.barAsRead;

      if (dryBulb && barAsRead) {
        const stationId = session?.user?.stationId;

        if (!stationId) {
          toast.error("Station ID is missing");
          return;
        }

        const pressureData = calculatePressureValues(
          dryBulb,
          barAsRead,
          stationId
        );
        if (pressureData) {
          setFormData((prev) => ({
            ...prev,
            stationLevelPressure: pressureData.stationLevelPressure,
            heightDifference: pressureData.heightDifference,
          }));

          const seaData = calculateSeaLevelPressure(
            dryBulb,
            pressureData.stationLevelPressure,
            stationId
          );
          if (seaData) {
            setFormData((prev) => ({
              ...prev,
              seaLevelReduction: seaData.seaLevelReduction,
              correctedSeaLevelPressure: seaData.correctedSeaLevelPressure,
            }));
          }
        }
      }
    }

    // Automatically generate Present Weather (WW) from W1 and W2
    if (name === "pastWeatherW1" || name === "pastWeatherW2") {
      const w1 = name === "pastWeatherW1" ? value : formData.pastWeatherW1;
      const w2 = name === "pastWeatherW2" ? value : formData.pastWeatherW2;

      if (w1 && w2) {
        setFormData((prev) => ({
          ...prev,
          presentWeatherWW: `${w1}${w2}`,
        }));
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input for segmented boxes with auto-focus to next box
  const handleSegmentedInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    refs: React.RefObject<HTMLInputElement>[],
    key: string
  ) => {
    const value = e.target.value.slice(0, 1); // ensure single digit
    const updated = (formData[key] || "").split("");
    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      [key]: updated.join(""),
    }));

    // Auto-focus next input
    if (value && refs[index + 1]) {
      refs[index + 1]?.current?.focus();
    }
  };
  // Reset form function
  const handleReset = () => {
    // Clear all form data
    setFormData({});
    setHygrometricData({
      dryBulb: "",
      wetBulb: "",
      difference: "",
      dewPoint: "",
      relativeHumidity: "",
    });

    // Show toast notification
    toast.info("All form data has been cleared.");

    // Reset to first tab
    setActiveTab("temperature");
  };

  // Navigation functions
  const nextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // Check if current tab is the last one
  const isLastTab = tabOrder.indexOf(activeTab) === tabOrder.length - 1;
  const isFirstTab = tabOrder.indexOf(activeTab) === 0;


  return (
    <>
      <form onSubmit={handleSubmit} className="w-full mx-auto">
        <BasicInfoTab />
        {/*Card Body */}
        <Card className="border-none shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-3 rounded-xl p-1 border-0 bg-transparent">
                {Object.entries(tabStyles).map(([key, style]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={cn(
                      "rounded-lg bg-gradient-to-br transition-all duration-300 transform hover:scale-105",
                      style.tab,
                      activeTab === key ? "ring-2 ring-white ring-offset-1" : ""
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {style.icon}
                      <span className="hidden md:inline">
                        {key === "V.V" ? "VV" : key}
                      </span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Bar Pressure Tab */}
              <TabsContent
                value="pressure"
                className="mt-6 transition-all duration-500"
              >
                <Card
                  className={cn("overflow-hidden", tabStyles.pressure.card)}
                >
                  <div className="p-4 bg-rose-200 text-rose-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <BarChart3 className="mr-2" /> Bar Pressure Measurements
                    </h3>
                  </div>
                  <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="subIndicator">1st Card Indicator</Label>
                      <Input
                        id="subIndicator"
                        name="subIndicator"
                        value={formData.subIndicator || ""}
                        onChange={handleChange}
                        readOnly
                        className="border-slate-600 bg-gray-100 cursor-not-allowed text-gray-700 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alteredThermometer">
                        Altered Thermometer
                      </Label>
                      <Input
                        id="alteredThermometer"
                        name="alteredThermometer"
                        value={formData.alteredThermometer || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barAsRead">Bar As Read(hPa)</Label>
                      <Input
                        id="barAsRead"
                        name="barAsRead"
                        value={formData.barAsRead || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correctedForIndex">
                        Corrected for Index Temp-gravity(hPa)
                      </Label>
                      <Input
                        id="correctedForIndex"
                        name="correctedForIndex"
                        value={formData.correctedForIndex || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heightDifference">
                        Height Difference Correction(hPa)
                      </Label>
                      <Input
                        id="heightDifference"
                        name="heightDifference"
                        value={formData.heightDifference || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stationLevelPressure">
                        Station Level Pressure (P.P.P.P.hpa)
                      </Label>
                      <Input
                        id="stationLevelPressure"
                        name="stationLevelPressure"
                        value={formData.stationLevelPressure || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seaLevelReduction">
                        Sea Level Reduction Constant
                      </Label>
                      <Input
                        id="seaLevelReduction"
                        name="seaLevelReduction"
                        value={formData.seaLevelReduction || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correctedSeaLevelPressure">
                        Sea-Level Pressure(PPPP)hpa
                      </Label>
                      <Input
                        id="correctedSeaLevelPressure"
                        name="correctedSeaLevelPressure"
                        value={formData.correctedSeaLevelPressure || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="afternoonReading">
                        Altimeter setting(QNH)
                      </Label>
                      <Input
                        id="afternoonReading"
                        name="afternoonReading"
                        value={formData.afternoonReading || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pressureChange24h">
                        24-Hour Pressure Change
                      </Label>
                      <Input
                        id="pressureChange24h"
                        name="pressureChange24h"
                        value={formData.pressureChange24h || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevTab}
                      disabled={isFirstTab}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Temperature Tab */}
              <TabsContent
                value="temperature"
                className="mt-6 transition-all duration-500"
              >
                <Card
                  className={cn("overflow-hidden", tabStyles.temperature.card)}
                >
                  <div className="p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Thermometer className="mr-2" /> Temperature
                    </h3>
                  </div>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="temperature" className="w-full">
                      {/* Temperature Values */}
                      <TabsContent value="temperature" className="mt-4">
                        <Tabs defaultValue="as-read" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-blue-50/50 rounded-lg">
                            <TabsTrigger
                              value="as-read"
                              className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800"
                            >
                              As Read
                            </TabsTrigger>
                            <TabsTrigger
                              value="corrected"
                              className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800"
                            >
                              Corrected
                            </TabsTrigger>
                          </TabsList>

                          {/* As Read Temperature Values */}
                          <TabsContent value="as-read" className="mt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="dryBulbAsRead">
                                  Dry-bulb (°C)
                                </Label>
                                <Input
                                  id="dryBulbAsRead"
                                  name="dryBulbAsRead"
                                  value={formData.dryBulbAsRead || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="wetBulbAsRead">
                                  Wet-bulb (°C)
                                </Label>
                                <Input
                                  id="wetBulbAsRead"
                                  name="wetBulbAsRead"
                                  value={formData.wetBulbAsRead || ""}
                                  onChange={handleChange}
                                  className=" border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="maxMinTempAsRead">
                                  MAX/MIN (°C)
                                </Label>
                                <Input
                                  id="maxMinTempAsRead"
                                  name="maxMinTempAsRead"
                                  value={formData.maxMinTempAsRead || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>
                            </div>
                          </TabsContent>

                          {/* Corrected Temperature Values */}
                          <TabsContent value="corrected" className="mt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="dryBulbCorrected">
                                  Dry-bulb (°C)
                                </Label>
                                <Input
                                  id="dryBulbCorrected"
                                  name="dryBulbCorrected"
                                  value={formData.dryBulbCorrected || ""}
                                  onChange={handleChange}
                                  className="transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="wetBulbCorrected">
                                  Wet-bulb (°C)
                                </Label>
                                <Input
                                  id="wetBulbCorrected"
                                  name="wetBulbCorrected"
                                  value={formData.wetBulbCorrected || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="maxMinTempCorrected">
                                  MAX/MIN (°C)
                                </Label>
                                <Input
                                  id="maxMinTempCorrected"
                                  name="maxMinTempCorrected"
                                  value={formData.maxMinTempCorrected || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="mt-6 space-y-4">
                          <div className="p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                            <h3 className="text-lg font-semibold flex items-center">
                              <Thermometer className="mr-2" /> Dew-Point &
                              Humidity
                            </h3>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="Td">
                                Dew-Point Temperature (&deg;C)
                              </Label>
                              <Input
                                id="Td"
                                name="Td"
                                value={formData.Td || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-emerald-500 focus:ring-emerald-500/30"
                                readOnly
                              />
                              {hygrometricData.difference && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Calculated from Dry-bulb:{" "}
                                  {hygrometricData.dryBulb}°C, Wet-bulb:{" "}
                                  {hygrometricData.wetBulb}
                                  °C, Difference: {hygrometricData.difference}
                                  °C
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="relativeHumidity">
                                Relative Humidity (%)
                              </Label>
                              <Input
                                id="relativeHumidity"
                                name="relativeHumidity"
                                value={formData.relativeHumidity || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-violet-500 focus:ring-violet-500/30"
                                readOnly
                              />
                              {hygrometricData.difference && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Calculated from Dry-bulb:{" "}
                                  {hygrometricData.dryBulb}°C, Wet-bulb:{" "}
                                  {hygrometricData.wetBulb}
                                  °C, Difference: {hygrometricData.difference}
                                  °C
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex justify-end p-6">
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Squall Tab */}
              <TabsContent
                value="squall"
                className="mt-6 transition-all duration-500"
              >
                <Card className={cn("overflow-hidden", tabStyles.squall.card)}>
                  <div className="p-4 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Wind className="mr-2" /> Squall Measurements
                    </h3>
                  </div>
                  <CardContent className="pt-6 space-y-4">
                    {formData.squallConfirmed === undefined ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-amber-800 font-medium mb-3">
                          Are you sure you want to fill up squall measurements?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-amber-500 text-amber-700 hover:bg-amber-50"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                squallConfirmed: false,
                                squallForce: "",
                                squallDirection: "",
                                squallTime: "",
                              }));
                              nextTab();
                            }}
                          >
                            No, Skip
                          </Button>
                          <Button
                            type="button"
                            className="bg-amber-500 hover:bg-amber-600"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                squallConfirmed: true,
                              }));
                            }}
                          >
                            Yes, Continue
                          </Button>
                        </div>
                      </div>
                    ) : formData.squallConfirmed ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="squallForce">Force (KTS)</Label>
                          <Input
                            id="squallForce"
                            name="squallForce"
                            value={formData.squallForce || ""}
                            onChange={handleChange}
                            className="border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="squallDirection">
                            Direction (°d)
                          </Label>
                          <Input
                            id="squallDirection"
                            name="squallDirection"
                            type="number"
                            min="0"
                            max="360"
                            value={formData.squallDirection || ""}
                            onChange={handleChange}
                            className="border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="squallTime">Time (qt)</Label>
                          <Input
                            id="squallTime"
                            name="squallTime"
                            value={formData.squallTime || ""}
                            onChange={handleChange}
                            className="border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center">
                        <p className="text-slate-600">
                          Squall measurements skipped
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              squallConfirmed: true,
                            }));
                          }}
                        >
                          Fill Measurements
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between p-6">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* VV Tab */}
              <TabsContent
                value="V.V"
                className="mt-6 transition-all duration-500"
              >
                <Card className={cn("overflow-hidden", tabStyles["V.V"].card)}>
                  <div className="p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Eye className="mr-2" /> Visibility Measurements
                    </h3>
                  </div>
                  <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="horizontalVisibility">
                        Horizontal Visibility
                      </Label>
                      <Input
                        id="horizontalVisibility"
                        name="horizontalVisibility"
                        value={formData.horizontalVisibility || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="miscMeteors">Misc Meteors(Code)</Label>
                      <Input
                        id="miscMeteors"
                        name="miscMeteors"
                        value={formData.miscMeteors || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-6">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Weather Tab */}
              <TabsContent
                value="weather"
                className="mt-6 transition-all duration-500"
              >
                <Card className={cn("overflow-hidden", tabStyles.weather.card)}>
                  <div className="p-4 bg-gradient-to-r from-cyan-200 to-cyan-300 text-cyan-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Cloud className="mr-2" /> Weather Conditions
                    </h3>
                  </div>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="past" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-cyan-50 rounded-lg">
                        <TabsTrigger
                          value="past"
                          className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                        >
                          Past
                        </TabsTrigger>
                        <TabsTrigger
                          value="present"
                          className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                        >
                          Present
                        </TabsTrigger>
                      </TabsList>

                      {/* Past Weather */}
                      <TabsContent value="past" className="mt-4">
                        <Tabs defaultValue="w1" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-cyan-50/50 rounded-lg">
                            <TabsTrigger
                              value="w1"
                              className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                            >
                              W1
                            </TabsTrigger>
                            <TabsTrigger
                              value="w2"
                              className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                            >
                              W2
                            </TabsTrigger>
                          </TabsList>

                          {/* W1 Past Weather */}
                          <TabsContent value="w1" className="mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="pastWeatherW1">
                                Past Weather (W1)
                              </Label>
                              <Input
                                id="pastWeatherW1"
                                name="pastWeatherW1"
                                placeholder="Enter past weather code (0-9)"
                                value={formData.pastWeatherW1 || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Weather code for the first part of the
                                observation period
                              </p>
                            </div>
                          </TabsContent>

                          {/* W2 Past Weather */}
                          <TabsContent value="w2" className="mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="pastWeatherW2">
                                Past Weather (W2)
                              </Label>
                              <Input
                                id="pastWeatherW2"
                                name="pastWeatherW2"
                                placeholder="Enter past weather code (0-9)"
                                value={formData.pastWeatherW2 || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Weather code for the second part of the
                                observation period
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </TabsContent>

                      {/* Present Weather */}
                      <TabsContent value="present" className="mt-4">
                        <Tabs defaultValue="ww" className="w-full">
                          <TabsList className="grid w-full grid-cols-1 bg-cyan-50/50 rounded-lg">
                            <TabsTrigger
                              value="ww"
                              className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                            >
                              WW
                            </TabsTrigger>
                          </TabsList>

                          {/* WW Present Weather */}
                          <TabsContent value="ww" className="mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="presentWeatherWW">
                                Present Weather (WW)
                              </Label>
                              <Input
                                id="presentWeatherWW"
                                name="presentWeatherWW"
                                placeholder="Auto-generated from W1 + W2"
                                value={formData.presentWeatherWW || ""}
                                readOnly
                                className="border-slate-600 bg-gray-100 cursor-not-allowed text-gray-700"
                              />

                              <p className="text-xs text-muted-foreground mt-1">
                                Current weather conditions at time of
                                observation
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex justify-between p-6">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Indicators Tab */}
              <TabsContent
                value="indicators"
                className="mt-6 transition-all duration-500"
              >
                <Card
                  className={cn("overflow-hidden", tabStyles.indicators.card)}
                >
                  <div className="p-4 bg-gradient-to-r from-fuchsia-200 to-fuchsia-300 text-fuchsia-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Clock className="mr-2" /> Time Indicators
                    </h3>
                  </div>
                  <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="observationTime">
                        GG: Time of Observation (UTC)
                      </Label>
                      <select
                        id="observationTime"
                        name="observationTime"
                        value={formData.observationTime || ""}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-fuchsia-500 focus:ring-fuchsia-500/30"
                      >
                        <option value="">-- Select GG Time --</option>
                        <option value="00">00 UTC</option>
                        <option value="03">03 UTC</option>
                        <option value="06">06 UTC</option>
                        <option value="09">09 UTC</option>
                        <option value="12">12 UTC</option>
                        <option value="15">15 UTC</option>
                        <option value="18">18 UTC</option>
                        <option value="21">21 UTC</option>
                      </select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-6">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-600 hover:bg-slate-100 transition-all duration-300"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Submit Data"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
