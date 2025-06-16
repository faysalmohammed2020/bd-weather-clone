"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Thermometer,
  Wind,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Sun,
  MapPin,
  Calendar,
  Droplets,
} from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import * as Yup from "yup";

// Enhanced validation schema with all fields
const validationSchema = Yup.object({
  stationInfo: Yup.object({
    stationName: Yup.string().required("Station name is required"),
    latitude: Yup.number().min(-90).max(90).required("Latitude is required"),
    longitude: Yup.number()
      .min(-180)
      .max(180)
      .required("Longitude is required"),
    elevation: Yup.number().min(0).required("Elevation is required"),
    year: Yup.number().min(1900).max(2100).required("Year is required"),
    month: Yup.number().min(1).max(12).required("Month is required"),
  }),
});

export function AgroclimatologicalFormComplete() {
  const [activeTab, setActiveTab] = useState("station");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  // Enhanced tab order with new sections
  const tabOrder = [
    "station",
    "solar",
    "temperature",
    "soil",
    "humidity",
    "weather",
    "summary",
  ];

  // Updated waterdrop tab styles with new sections
  const tabStyles = {
    station: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-violet-50 via-white to-purple-50 border-l-4 border-violet-400 shadow-xl shadow-violet-500/10",
      icon: <MapPin className="size-5 mr-2 text-violet-600" />,
      header: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
      color: "violet",
    },
    solar: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-l-4 border-amber-400 shadow-xl shadow-amber-500/10",
      icon: <Sun className="size-5 mr-2 text-amber-600" />,
      header: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
      color: "amber",
    },
    temperature: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-rose-50 via-white to-pink-50 border-l-4 border-rose-400 shadow-xl shadow-rose-500/10",
      icon: <Thermometer className="size-5 mr-2 text-rose-600" />,
      header: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
      color: "rose",
    },
    soil: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-l-4 border-emerald-400 shadow-xl shadow-emerald-500/10",
      icon: <BarChart3 className="size-5 mr-2 text-emerald-600" />,
      header: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      color: "emerald",
    },
    humidity: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-l-4 border-cyan-400 shadow-xl shadow-cyan-500/10",
      icon: <Droplets className="size-5 mr-2 text-cyan-600" />,
      header: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
      color: "cyan",
    },
    weather: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-sky-50 via-white to-indigo-50 border-l-4 border-sky-400 shadow-xl shadow-sky-500/10",
      icon: <Wind className="size-5 mr-2 text-sky-600" />,
      header: "bg-gradient-to-r from-sky-500 to-indigo-500 text-white",
      color: "sky",
    },
    summary: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-green-50 via-white to-lime-50 border-l-4 border-green-400 shadow-xl shadow-green-500/10",
      icon: <Calendar className="size-5 mr-2 text-green-600" />,
      header: "bg-gradient-to-r from-green-500 to-lime-500 text-white",
      color: "green",
    },
  };

  // Helper function to get waterdrop styles
  const getWaterdropStyles = (color: string, isActive: boolean) => {
    const colorMap = {
      violet: {
        bg: isActive
          ? "bg-gradient-to-br from-violet-400 via-violet-500 to-purple-600"
          : "bg-gradient-to-br from-violet-100 via-violet-200 to-purple-300",
        shadow: isActive
          ? "shadow-2xl shadow-violet-500/40"
          : "shadow-lg shadow-violet-300/30",
        text: isActive ? "text-white" : "text-violet-700",
      },
      amber: {
        bg: isActive
          ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600"
          : "bg-gradient-to-br from-amber-100 via-amber-200 to-orange-300",
        shadow: isActive
          ? "shadow-2xl shadow-amber-500/40"
          : "shadow-lg shadow-amber-300/30",
        text: isActive ? "text-white" : "text-amber-700",
      },
      rose: {
        bg: isActive
          ? "bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600"
          : "bg-gradient-to-br from-rose-100 via-rose-200 to-pink-300",
        shadow: isActive
          ? "shadow-2xl shadow-rose-500/40"
          : "shadow-lg shadow-rose-300/30",
        text: isActive ? "text-white" : "text-rose-700",
      },
      emerald: {
        bg: isActive
          ? "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600"
          : "bg-gradient-to-br from-emerald-100 via-emerald-200 to-teal-300",
        shadow: isActive
          ? "shadow-2xl shadow-emerald-500/40"
          : "shadow-lg shadow-emerald-300/30",
        text: isActive ? "text-white" : "text-emerald-700",
      },
      cyan: {
        bg: isActive
          ? "bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600"
          : "bg-gradient-to-br from-cyan-100 via-cyan-200 to-blue-300",
        shadow: isActive
          ? "shadow-2xl shadow-cyan-500/40"
          : "shadow-lg shadow-cyan-300/30",
        text: isActive ? "text-white" : "text-cyan-700",
      },
      sky: {
        bg: isActive
          ? "bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-600"
          : "bg-gradient-to-br from-sky-100 via-sky-200 to-indigo-300",
        shadow: isActive
          ? "shadow-2xl shadow-sky-500/40"
          : "shadow-lg shadow-sky-300/30",
        text: isActive ? "text-white" : "text-sky-700",
      },
      green: {
        bg: isActive
          ? "bg-gradient-to-br from-green-400 via-green-500 to-lime-600"
          : "bg-gradient-to-br from-green-100 via-green-200 to-lime-300",
        shadow: isActive
          ? "shadow-2xl shadow-green-500/40"
          : "shadow-lg shadow-green-300/30",
        text: isActive ? "text-white" : "text-green-700",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.violet;
  };

  // Initialize Formik with all fields
  const formik = useFormik({
    initialValues: {
      stationInfo: {
        stationName: "",
        latitude: "",
        longitude: "",
        elevation: "",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
      dailyData: Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        solarRadiation: "",
        sunShineHour: "",
        airTemperature: {
          dry05m: "",
          wet05m: "",
          dry12m: "",
          wet12m: "",
          dry22m: "",
          wet22m: "",
        },
        minTemp: "",
        maxTemp: "",
        meanTemp: "",
        grassMinTemp: "",
        soilTemperature: {
          depth5cm: "",
          depth10cm: "",
          depth20cm: "",
          depth30cm: "",
          depth50cm: "",
        },
        panWaterEvap: "",
        relativeHumidity: "",
        evaporation: "",
        soilMoisture: {
          depth0to20cm: "",
          depth20to50cm: "",
        },
        dewPoint: "",
        windSpeed: "",
        duration: "",
        rainfall: "",
      })),
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  async function handleSubmit(values: any) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      console.log("Submitting data:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Data submitted successfully!");
      formik.resetForm();
      setActiveTab("station");
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!/^\d*\.?\d*$/.test(value)) return;
    formik.setFieldValue(name, value);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Bangladesh Meteorological Department
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Comprehensive Agroclimatological Data Entry System
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={formik.handleSubmit}
          className="w-full mx-auto"
        >
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {/* Waterdrop Navigation */}
            <div className="relative mb-8 p-4">
              <div className="relative p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 max-w-max mx-auto">

                <div className="relative flex flex-wrap justify-center items-center gap-1 p-1.5 rounded-full bg-gray-100/50">
                  {Object.entries(tabStyles).map(([key, style], index) => {
                    const isActive = activeTab === key;
                    const waterdropStyles = getWaterdropStyles(
                      style.color,
                      isActive
                    );

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => handleTabChange(key)}
                        className={cn(
                          "relative flex items-center justify-center px-6 py-2 rounded-full transition-all duration-300 transform",
                          "focus:outline-none min-w-[80px]",
                          isActive
                            ? "bg-white shadow shadow-blue-300 text-gray-900 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: isActive ? 1.05 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: index * 0.05,
                        }}
                      >
                        <div className="relative z-10 flex items-center gap-1">
                          <div
                            className={cn("transition-transform duration-200", {
                              "scale-110": isActive,
                            })}
                          >
                            {style.icon}
                          </div>
                          <span className="text-base capitalize font-medium">{key}</span>
                        </div>

                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-white rounded-full border border-gray-200 z-0"
                            layoutId="activePill"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Station Information Tab */}
            <TabsContent value="station">
              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-0",
                  tabStyles.station.card
                )}
              >
                <div className={cn("p-6", tabStyles.station.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <MapPin className="mr-3 w-6 h-6" /> Station Information
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-3">
                    <Label
                      htmlFor="stationName"
                      className="text-slate-700 font-semibold"
                    >
                      Station Name *
                    </Label>
                    <Input
                      id="stationName"
                      name="stationInfo.stationName"
                      value={formik.values.stationInfo.stationName}
                      onChange={formik.handleChange}
                      className="border-2 border-slate-200 h-12 rounded-xl"
                      placeholder="Enter station name"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="latitude"
                      className="text-slate-700 font-semibold"
                    >
                      Latitude (°) *
                    </Label>
                    <Input
                      id="latitude"
                      name="stationInfo.latitude"
                      type="number"
                      step="0.0001"
                      value={formik.values.stationInfo.latitude}
                      onChange={formik.handleChange}
                      className="border-2 border-slate-200 h-12 rounded-xl"
                      placeholder="e.g., 23.7104"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="longitude"
                      className="text-slate-700 font-semibold"
                    >
                      Longitude (°) *
                    </Label>
                    <Input
                      id="longitude"
                      name="stationInfo.longitude"
                      type="number"
                      step="0.0001"
                      value={formik.values.stationInfo.longitude}
                      onChange={formik.handleChange}
                      className="border-2 border-slate-200 h-12 rounded-xl"
                      placeholder="e.g., 90.4074"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="elevation"
                      className="text-slate-700 font-semibold"
                    >
                      Elevation (m) *
                    </Label>
                    <Input
                      id="elevation"
                      name="stationInfo.elevation"
                      type="number"
                      step="0.01"
                      value={formik.values.stationInfo.elevation}
                      onChange={formik.handleChange}
                      className="border-2 border-slate-200 h-12 rounded-xl"
                      placeholder="e.g., 21.95"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="year"
                      className="text-slate-700 font-semibold"
                    >
                      Year
                    </Label>
                    <Input
                      id="year"
                      name="stationInfo.year"
                      type="number"
                      value={formik.values.stationInfo.year}
                      onChange={formik.handleChange}
                      className="border-2 border-slate-200 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="month"
                      className="text-slate-700 font-semibold"
                    >
                      Month
                    </Label>
                    <Input
                      id="month"
                      name="stationInfo.month"
                      type="number"
                      min="1"
                      max="12"
                      value={formik.values.stationInfo.month}
                      onChange={formik.handleChange}
                      className="border-2 border-slate-200 h-12 rounded-xl"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end px-8 pb-8">
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Solar & Sunshine Tab */}
            <TabsContent value="solar">
              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-0",
                  tabStyles.solar.card
                )}
              >
                <div className={cn("p-6", tabStyles.solar.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Sun className="mr-3 w-6 h-6" /> Solar Radiation & Sunshine
                    Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="mb-6">
                    <Label className="text-slate-700 font-semibold">
                      Select Day
                    </Label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 mt-2"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Day {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                      <Label className="text-slate-700 font-semibold">
                        Solar Radiation (Langley day⁻¹)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.solarRadiation`}
                        type="number"
                        step="0.1"
                        value={
                          formik.values.dailyData[selectedDay - 1]
                            ?.solarRadiation || ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-12 rounded-xl"
                        placeholder="Enter solar radiation"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-yellow-50/50 rounded-xl border border-yellow-200">
                      <Label className="text-slate-700 font-semibold">
                        Sun Shine Hour
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.sunShineHour`}
                        type="number"
                        step="0.1"
                        max="24"
                        value={
                          formik.values.dailyData[selectedDay - 1]
                            ?.sunShineHour || ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-12 rounded-xl"
                        placeholder="Enter sunshine hours"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevTab}
                    className="px-8 py-3 rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Temperature Tab */}
            <TabsContent value="temperature">
              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-0",
                  tabStyles.temperature.card
                )}
              >
                <div className={cn("p-6", tabStyles.temperature.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Thermometer className="mr-3 w-6 h-6" /> Air Temperature
                    Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="space-y-8">
                    {/* Air Temperature at Different Heights */}
                    <div className="p-6 bg-rose-50/50 rounded-xl border border-rose-200">
                      <h4 className="font-bold text-rose-700 text-lg mb-4">
                        Air Temperature (°C) at Different Heights
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          {
                            height: "0.5m",
                            dryKey: "dry05m",
                            wetKey: "wet05m",
                          },
                          {
                            height: "1.2m",
                            dryKey: "dry12m",
                            wetKey: "wet12m",
                          },
                          {
                            height: "2.2m",
                            dryKey: "dry22m",
                            wetKey: "wet22m",
                          },
                        ].map(({ height, dryKey, wetKey }) => (
                          <div
                            key={height}
                            className="space-y-3 p-4 bg-white rounded-lg border"
                          >
                            <h5 className="font-semibold text-rose-600">
                              {height}
                            </h5>
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-600">
                                Dry Bulb
                              </Label>
                              <Input
                                name={`dailyData.${selectedDay - 1}.airTemperature.${dryKey}`}
                                type="number"
                                step="0.1"
                                value={
                                  formik.values.dailyData[selectedDay - 1]
                                    ?.airTemperature[
                                    dryKey as keyof (typeof formik.values.dailyData)[number]["airTemperature"]
                                  ] || ""
                                }
                                onChange={handleNumericInput}
                                className="border-2 border-slate-200 h-10 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-600">
                                Wet Bulb
                              </Label>
                              <Input
                                name={`dailyData.${selectedDay - 1}.airTemperature.${wetKey}`}
                                type="number"
                                step="0.1"
                                value={
                                  formik.values.dailyData[selectedDay - 1]
                                    ?.airTemperature[
                                    wetKey as keyof (typeof formik.values.dailyData)[number]["airTemperature"]
                                  ] || ""
                                }
                                onChange={handleNumericInput}
                                className="border-2 border-slate-200 h-10 rounded-lg"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Summary */}
                    <div className="p-6 bg-pink-50/50 rounded-xl border border-pink-200">
                      <h4 className="font-bold text-pink-700 text-lg mb-4">
                        Temperature Summary
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            Min Temp (°C)
                          </Label>
                          <Input
                            name={`dailyData.${selectedDay - 1}.minTemp`}
                            type="number"
                            step="0.1"
                            value={
                              formik.values.dailyData[selectedDay - 1]
                                ?.minTemp || ""
                            }
                            onChange={handleNumericInput}
                            className="border-2 border-slate-200 h-10 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            Max Temp (°C)
                          </Label>
                          <Input
                            name={`dailyData.${selectedDay - 1}.maxTemp`}
                            type="number"
                            step="0.1"
                            value={
                              formik.values.dailyData[selectedDay - 1]
                                ?.maxTemp || ""
                            }
                            onChange={handleNumericInput}
                            className="border-2 border-slate-200 h-10 rounded-lg"
                          />
                        </div>
                      
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            Grass Min Temp (°C)
                          </Label>
                          <Input
                            name={`dailyData.${selectedDay - 1}.grassMinTemp`}
                            type="number"
                            step="0.1"
                            value={
                              formik.values.dailyData[selectedDay - 1]
                                ?.grassMinTemp || ""
                            }
                            onChange={handleNumericInput}
                            className="border-2 border-slate-200 h-10 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevTab}
                    className="px-8 py-3 rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Soil Temperature Tab */}
            <TabsContent value="soil">
              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-0",
                  tabStyles.soil.card
                )}
              >
                <div className={cn("p-6", tabStyles.soil.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <BarChart3 className="mr-3 w-6 h-6" /> Soil Temperature &
                    Moisture Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
              
                  <div className="space-y-8">
                    {/* Soil Temperature */}
                    <div className="p-6 bg-emerald-50/50 rounded-xl border border-emerald-200">
                      <h4 className="font-bold text-emerald-700 text-lg mb-4">
                        Soil Temperature (°C) at Different Depths
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[
                          { depth: "5 Cm", key: "depth5cm" },
                          { depth: "10 Cm", key: "depth10cm" },
                          { depth: "20 Cm", key: "depth20cm" },
                          { depth: "30 Cm", key: "depth30cm" },
                          { depth: "50 Cm", key: "depth50cm" },
                        ].map(({ depth, key }) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-slate-700 font-semibold">
                              {depth}
                            </Label>
                            <Input
                              name={`dailyData.${selectedDay - 1}.soilTemperature.${key}`}
                              type="number"
                              step="0.1"
                              value={
                                formik.values.dailyData[selectedDay - 1]
                                  ?.soilTemperature[
                                  key as keyof (typeof formik.values.dailyData)[number]["soilTemperature"]
                                ] || ""
                              }
                              onChange={handleNumericInput}
                              className="border-2 border-slate-200 h-10 rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Soil Moisture */}
                    <div className="p-6 bg-teal-50/50 rounded-xl border border-teal-200">
                      <h4 className="font-bold text-teal-700 text-lg mb-4">
                        Soil Moisture % Between
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            0-20 Cm
                          </Label>
                          <Input
                            name={`dailyData.${selectedDay - 1}.soilMoisture.depth0to20cm`}
                            type="number"
                            step="0.1"
                            max="100"
                            value={
                              formik.values.dailyData[selectedDay - 1]
                                ?.soilMoisture.depth0to20cm || ""
                            }
                            onChange={handleNumericInput}
                            className="border-2 border-slate-200 h-10 rounded-lg"
                            placeholder="0-100%"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            20-50 Cm
                          </Label>
                          <Input
                            name={`dailyData.${selectedDay - 1}.soilMoisture.depth20to50cm`}
                            type="number"
                            step="0.1"
                            max="100"
                            value={
                              formik.values.dailyData[selectedDay - 1]
                                ?.soilMoisture.depth20to50cm || ""
                            }
                            onChange={handleNumericInput}
                            className="border-2 border-slate-200 h-10 rounded-lg"
                            placeholder="0-100%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevTab}
                    className="px-8 py-3 rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Humidity & Evaporation Tab */}
            <TabsContent value="humidity">
              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-0",
                  tabStyles.humidity.card
                )}
              >
                <div className={cn("p-6", tabStyles.humidity.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Droplets className="mr-3 w-6 h-6" /> Humidity & Evaporation
                    Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                 

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3 p-4 bg-cyan-50/50 rounded-xl border border-cyan-200">
                      <Label className="text-slate-700 font-semibold">
                        Pan Water temp(°C)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.panWaterEvap`}
                        type="number"
                        step="0.1"
                        value={
                          formik.values.dailyData[selectedDay - 1]
                            ?.panWaterEvap || ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
                      <Label className="text-slate-700 font-semibold">
                        Evaporation (mm)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.evaporation`}
                        type="number"
                        step="0.1"
                        value={
                          formik.values.dailyData[selectedDay - 1]
                            ?.evaporation || ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
                      <Label className="text-slate-700 font-semibold">
                        Evapotranspiration (mm)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.dewPoint`}
                        type="number"
                        step="0.1"
                        value={
                          formik.values.dailyData[selectedDay - 1]?.dewPoint ||
                          ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevTab}
                    className="px-8 py-3 rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Weather Measurements Tab */}
            <TabsContent value="weather">
              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-0",
                  tabStyles.weather.card
                )}
              >
                <div className={cn("p-6", tabStyles.weather.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Wind className="mr-3 w-6 h-6" /> Weather Measurements
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-3 p-4 bg-sky-50/50 rounded-xl border border-sky-200">
                      <Label className="text-slate-700 font-semibold">
                        Wind run at 2m. ht. (km/hr)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.windSpeed`}
                        type="number"
                        step="0.1"
                        value={
                          formik.values.dailyData[selectedDay - 1]?.windSpeed ||
                          ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                      <Label className="text-slate-700 font-semibold">
                        Dew Amount (mm)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.rainfall`}
                        type="number"
                        step="0.1"
                        value={
                          formik.values.dailyData[selectedDay - 1]?.rainfall ||
                          ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-10 rounded-lg"
                      />
                    </div>

                      <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
                      <Label className="text-slate-700 font-semibold">
                        Duration (Dew) (hrs.)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.duration`}
                        type="number"
                        step="0.1"
                        max="24"
                        value={
                          formik.values.dailyData[selectedDay - 1]?.duration ||
                          ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-10 rounded-lg"
                      />
                    </div>

                     <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                      <Label className="text-slate-700 font-semibold">
                        Rain amount (mm)
                      </Label>
                      <Input
                        name={`dailyData.${selectedDay - 1}.rainfall`}
                        type="number"
                        step="0.1"
                        value={
                          formik.values.dailyData[selectedDay - 1]?.rainfall ||
                          ""
                        }
                        onChange={handleNumericInput}
                        className="border-2 border-slate-200 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevTab}
                    className="px-8 py-3 rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <Card
                className={cn(
                  "overflow-hidden rounded-2xl border-0",
                  tabStyles.summary.card
                )}
              >
                <div className={cn("p-6", tabStyles.summary.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Calendar className="mr-3 w-6 h-6" /> Data Summary &
                    Submission
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 border-2 border-violet-200 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50">
                      <h4 className="font-bold text-sm text-violet-600 mb-2">
                        Station
                      </h4>
                      <p className="text-lg font-bold text-violet-800">
                        {formik.values.stationInfo.stationName || "Not set"}
                      </p>
                    </div>
                    <div className="p-6 border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-lime-50">
                      <h4 className="font-bold text-sm text-green-600 mb-2">
                        Period
                      </h4>
                      <p className="text-lg font-bold text-green-800">
                        {formik.values.stationInfo.month}/
                        {formik.values.stationInfo.year}
                      </p>
                    </div>
                    <div className="p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50">
                      <h4 className="font-bold text-sm text-blue-600 mb-2">
                        Location
                      </h4>
                      <p className="text-lg font-bold text-blue-800">
                        {formik.values.stationInfo.latitude}°,{" "}
                        {formik.values.stationInfo.longitude}°
                      </p>
                    </div>
                    <div className="p-6 border-2 border-cyan-200 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50">
                      <h4 className="font-bold text-sm text-cyan-600 mb-2">
                        Elevation
                      </h4>
                      <p className="text-lg font-bold text-cyan-800">
                        {formik.values.stationInfo.elevation} m
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                    <h4 className="font-bold text-amber-800 mb-4 text-lg">
                      Comprehensive Data Completion Status
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 mr-3"></div>
                        <span className="font-medium">Station: Complete</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-amber-500 mr-3"></div>
                        <span className="font-medium">
                          Solar:{" "}
                          {
                            formik.values.dailyData.filter(
                              (d) => d.solarRadiation
                            ).length
                          }
                          /31
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-rose-500 mr-3"></div>
                        <span className="font-medium">
                          Temperature:{" "}
                          {
                            formik.values.dailyData.filter((d) => d.minTemp)
                              .length
                          }
                          /31
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 mr-3"></div>
                        <span className="font-medium">
                          Soil:{" "}
                          {
                            formik.values.dailyData.filter(
                              (d) => d.soilTemperature.depth5cm
                            ).length
                          }
                          /31
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-cyan-500 mr-3"></div>
                        <span className="font-medium">
                          Humidity:{" "}
                          {
                            formik.values.dailyData.filter(
                              (d) => d.relativeHumidity
                            ).length
                          }
                          /31
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-sky-500 mr-3"></div>
                        <span className="font-medium">
                          Weather:{" "}
                          {
                            formik.values.dailyData.filter((d) => d.rainfall)
                              .length
                          }
                          /31
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevTab}
                    className="px-8 py-3 rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        formik.resetForm();
                        setActiveTab("station");
                        toast.info("Form has been reset");
                      }}
                      className="px-8 py-3 rounded-xl"
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-8 py-3 rounded-xl font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Complete Data"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.form>
      </div>
    </div>
  );
}
