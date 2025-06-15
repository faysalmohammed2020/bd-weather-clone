"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Thermometer,
  Wind,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Sun,
  MapPin,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { useFormik } from "formik"
import { motion } from "framer-motion"
import * as Yup from "yup"

// Validation schema
const validationSchema = Yup.object({
  stationInfo: Yup.object({
    stationName: Yup.string().required("Station name is required"),
    latitude: Yup.number().min(-90).max(90).required("Latitude is required"),
    longitude: Yup.number().min(-180).max(180).required("Longitude is required"),
    elevation: Yup.number().min(0).required("Elevation is required"),
    year: Yup.number().min(1900).max(2100).required("Year is required"),
    month: Yup.number().min(1).max(12).required("Month is required"),
  }),
  solarRadiation: Yup.number().min(0).max(50),
  airTemperature: Yup.object({
    dryBulbMorning: Yup.number().min(-50).max(60),
    dryBulbEvening: Yup.number().min(-50).max(60),
    wetBulbMorning: Yup.number().min(-50).max(60),
    wetBulbEvening: Yup.number().min(-50).max(60),
  }),
  soilTemperature: Yup.object({
    depth5cm: Yup.number().min(-20).max(60),
    depth10cm: Yup.number().min(-20).max(60),
    depth20cm: Yup.number().min(-20).max(60),
    depth30cm: Yup.number().min(-20).max(60),
    depth50cm: Yup.number().min(-20).max(60),
  }),
  panEvaporation: Yup.number().min(0).max(50),
  windSpeed: Yup.number().min(0).max(200),
  rainfall: Yup.number().min(0).max(1000),
  duration: Yup.number().min(0).max(24),
})

export function AgroclimatologicalForm() {
  const [activeTab, setActiveTab] = useState("station")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)

  // Tab order for navigation
  const tabOrder = [
    "station",
    "solar",
    "temperature", 
    "soil",
    "weather",
    "summary"
  ]

  // Tab styles with gradients and colors
  const tabStyles = {
    station: {
      tab: "border border-blue-500 px-4 py-3 !bg-blue-50 text-blue-800 hover:opacity-90 shadow-sm shadow-blue-500/50",
      card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
      icon: <MapPin className="size-5 mr-2" />,
    },
    solar: {
      tab: "border border-yellow-500 px-4 py-3 !bg-yellow-50 text-yellow-800 hover:opacity-90 shadow-sm shadow-yellow-500/50",
      card: "bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-200 shadow-sm",
      icon: <Sun className="size-5 mr-2" />,
    },
    temperature: {
      tab: "border border-red-500 px-4 py-3 !bg-red-50 text-red-800 hover:opacity-90 shadow-sm shadow-red-500/50",
      card: "bg-gradient-to-br from-red-50 to-white border-l-4 border-red-200 shadow-sm",
      icon: <Thermometer className="size-5 mr-2" />,
    },
    soil: {
      tab: "border border-amber-600 px-4 py-3 !bg-amber-50 text-amber-800 hover:opacity-90 shadow-sm shadow-amber-500/50",
      card: "bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-200 shadow-sm",
      icon: <BarChart3 className="size-5 mr-2" />,
    },
    weather: {
      tab: "border border-cyan-500 px-4 py-3 !bg-cyan-50 text-cyan-800 hover:opacity-90 shadow-sm shadow-cyan-500/50",
      card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
      icon: <Wind className="size-5 mr-2" />,
    },
    summary: {
      tab: "border border-green-500 px-4 py-3 !bg-green-50 text-green-800 hover:opacity-90 shadow-sm shadow-green-500/50",
      card: "bg-gradient-to-br from-green-50 to-white border-l-4 border-green-200 shadow-sm",
      icon: <Calendar className="size-5 mr-2" />,
    },
  }

  // Initialize Formik
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
        airTemperature: {
          dryBulbMorning: "",
          dryBulbEvening: "",
          wetBulbMorning: "",
          wetBulbEvening: "",
        },
        soilTemperature: {
          depth5cm: "",
          depth10cm: "",
          depth20cm: "",
          depth30cm: "",
          depth50cm: "",
        },
        panEvaporation: "",
        windSpeed: "",
        rainfall: "",
        duration: "",
      })),
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  })

  // Function to check if a tab is valid
  const isTabValid = (tabName: string) => {
    const errors = formik.errors
    const touched = formik.touched

    switch (tabName) {
      case "station":
        return !(
          (touched.stationInfo?.stationName && errors.stationInfo?.stationName) ||
          (touched.stationInfo?.latitude && errors.stationInfo?.latitude) ||
          (touched.stationInfo?.longitude && errors.stationInfo?.longitude) ||
          (touched.stationInfo?.elevation && errors.stationInfo?.elevation)
        )
      default:
        return true
    }
  }

  // Function to validate current tab before proceeding
  const validateTab = (tabName: string) => {
    let fieldsToValidate: string[] = []

    switch (tabName) {
      case "station":
        fieldsToValidate = [
          "stationInfo.stationName",
          "stationInfo.latitude", 
          "stationInfo.longitude",
          "stationInfo.elevation"
        ]
        break
    }

    // Touch all fields in the current tab to trigger validation
    const touchedFields: any = {}
    fieldsToValidate.forEach((field) => {
      const fieldPath = field.split('.')
      if (fieldPath.length === 2) {
        if (!touchedFields[fieldPath[0]]) touchedFields[fieldPath[0]] = {}
        touchedFields[fieldPath[0]][fieldPath[1]] = true
      } else {
        touchedFields[field] = true
      }
    })
    formik.setTouched({ ...formik.touched, ...touchedFields }, true)

    // Check if any of the fields have errors
    return fieldsToValidate.every((field) => {
      const fieldPath = field.split('.')
      if (fieldPath.length === 2) {
        return !formik.errors[fieldPath[0] as keyof typeof formik.errors]?.[fieldPath[1] as any]
      }
      return !formik.errors[field as keyof typeof formik.errors]
    })
  }

  // Enhanced setActiveTab function that validates before changing tabs
  const handleTabChange = (tabName: string) => {
    if (activeTab !== tabName) {
      if (!validateTab(activeTab)) {
        toast.error("Please fill all required fields", {
          description: "Complete current tab before proceeding to next tab",
        })
        return
      }
    }
    setActiveTab(tabName)
  }

  async function handleSubmit(values: any) {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      console.log("Submitting data:", values)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Data submitted successfully!", {
        description: "Agroclimatological data has been saved",
      })

      // Reset form after successful submission
      formik.resetForm()
      setActiveTab("station")
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Network error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Only allow numeric input with decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      return
    }

    formik.setFieldValue(name, value)
  }

  // Navigation functions
  const nextTab = () => {
    if (!validateTab(activeTab)) {
      toast.error("Please fill all required fields", {
        description: "Complete current tab before proceeding to next tab",
      })
      return
    }

    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const prevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  const isFirstTab = tabOrder.indexOf(activeTab) === 0
  const isLastTab = tabOrder.indexOf(activeTab) === tabOrder.length - 1

  // Helper function to render error message
  const renderErrorMessage = (fieldName: string) => {
    const fieldPath = fieldName.split('.')
    let error: any = formik.errors
    let touched: any = formik.touched
    
    for (const path of fieldPath) {
      error = error?.[path]
      touched = touched?.[path]
    }

    return touched && error ? (
      <div className="text-red-500 text-sm mt-1 flex items-start">
        <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    ) : null
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Bangladesh Meteorological Department</h1>
        <p className="text-center text-muted-foreground">Agroclimatological Data Entry Form</p>
      </div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onSubmit={formik.handleSubmit}
        className="w-full mx-auto"
      >
        <div className="relative rounded-xl">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 rounded-xl p-1 border-0 bg-transparent">
              {Object.entries(tabStyles).map(([key, style]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={cn(
                    "flex flex-col items-center justify-center border border-gray-300 text-xs sm:text-sm px-2 py-1 md:py-2",
                    {
                      [style.tab]: activeTab === key,
                      "!border-red-500 !text-red-700":
                        !isTabValid(key) && formik.submitCount > 0,
                    }
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    {style.icon}
                    <span className="hidden sm:inline capitalize">
                      {key}
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Station Information Tab */}
            <TabsContent value="station" className="mt-6 transition-all duration-500">
              <Card className={cn("overflow-hidden", tabStyles.station.card)}>
                <div className="p-4 bg-blue-200 text-blue-800">
                  <h3 className="text-lg font-semibold flex items-center">
                    <MapPin className="mr-2" /> Station Information
                  </h3>
                </div>
                <CardContent className="pt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="stationName">Station Name *</Label>
                    <Input
                      id="stationName"
                      name="stationInfo.stationName"
                      value={formik.values.stationInfo.stationName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                        {
                          "border-red-500":
                            formik.touched.stationInfo?.stationName &&
                            formik.errors.stationInfo?.stationName,
                        }
                      )}
                      placeholder="Enter station name"
                    />
                    {renderErrorMessage("stationInfo.stationName")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (°) *</Label>
                    <Input
                      id="latitude"
                      name="stationInfo.latitude"
                      type="number"
                      step="0.0001"
                      value={formik.values.stationInfo.latitude}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                        {
                          "border-red-500":
                            formik.touched.stationInfo?.latitude &&
                            formik.errors.stationInfo?.latitude,
                        }
                      )}
                      placeholder="e.g., 23.7104"
                    />
                    {renderErrorMessage("stationInfo.latitude")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (°) *</Label>
                    <Input
                      id="longitude"
                      name="stationInfo.longitude"
                      type="number"
                      step="0.0001"
                      value={formik.values.stationInfo.longitude}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                        {
                          "border-red-500":
                            formik.touched.stationInfo?.longitude &&
                            formik.errors.stationInfo?.longitude,
                        }
                      )}
                      placeholder="e.g., 90.4074"
                    />
                    {renderErrorMessage("stationInfo.longitude")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="elevation">Elevation (m) *</Label>
                    <Input
                      id="elevation"
                      name="stationInfo.elevation"
                      type="number"
                      step="0.01"
                      value={formik.values.stationInfo.elevation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                        {
                          "border-red-500":
                            formik.touched.stationInfo?.elevation &&
                            formik.errors.stationInfo?.elevation,
                        }
                      )}
                      placeholder="e.g., 21.95"
                    />
                    {renderErrorMessage("stationInfo.elevation")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="stationInfo.year"
                      type="number"
                      value={formik.values.stationInfo.year}
                      onChange={formik.handleChange}
                      className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Input
                      id="month"
                      name="stationInfo.month"
                      type="number"
                      min="1"
                      max="12"
                      value={formik.values.stationInfo.month}
                      onChange={formik.handleChange}
                      className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
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

            {/* Solar Radiation Tab */}
            <TabsContent value="solar" className="mt-6 transition-all duration-500">
              <Card className={cn("overflow-hidden", tabStyles.solar.card)}>
                <div className="p-4 bg-yellow-200 text-yellow-800">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Sun className="mr-2" /> Solar Radiation Data
                  </h3>
                </div>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Label htmlFor="daySelector">Select Day</Label>
                    <select
                      id="daySelector"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      className="w-full border border-slate-600 rounded-md px-3 py-2 mt-1"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Day {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`solarRadiation-${selectedDay}`}>
                      Solar Radiation (MJ/m²) - Day {String(selectedDay).padStart(2, "0")}
                    </Label>
                    <Input
                      id={`solarRadiation-${selectedDay}`}
                      name={`dailyData.${selectedDay - 1}.solarRadiation`}
                      type="number"
                      step="0.1"
                      value={formik.values.dailyData[selectedDay - 1]?.solarRadiation || ""}
                      onChange={handleNumericInput}
                      className="border-slate-600 transition-all focus:border-yellow-400 focus:ring-yellow-500/30"
                      placeholder="Enter solar radiation value"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
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

            {/* Air Temperature Tab */}
            <TabsContent value="temperature" className="mt-6 transition-all duration-500">
              <Card className={cn("overflow-hidden", tabStyles.temperature.card)}>
                <div className="p-4 bg-red-200 text-red-800">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Thermometer className="mr-2" /> Air Temperature Data
                  </h3>
                </div>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Label htmlFor="daySelector">Select Day</Label>
                    <select
                      id="daySelector"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      className="w-full border border-slate-600 rounded-md px-3 py-2 mt-1"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Day {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-700">Dry Bulb Temperature (°C)</h4>
                      <div className="space-y-2">
                        <Label htmlFor={`dryBulbMorning-${selectedDay}`}>Morning Reading</Label>
                        <Input
                          id={`dryBulbMorning-${selectedDay}`}
                          name={`dailyData.${selectedDay - 1}.airTemperature.dryBulbMorning`}
                          type="number"
                          step="0.1"
                          value={formik.values.dailyData[selectedDay - 1]?.airTemperature.dryBulbMorning || ""}
                          onChange={handleNumericInput}
                          className="border-slate-600 transition-all focus:border-red-400 focus:ring-red-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`dryBulbEvening-${selectedDay}`}>Evening Reading</Label>
                        <Input
                          id={`dryBulbEvening-${selectedDay}`}
                          name={`dailyData.${selectedDay - 1}.airTemperature.dryBulbEvening`}
                          type="number"
                          step="0.1"
                          value={formik.values.dailyData[selectedDay - 1]?.airTemperature.dryBulbEvening || ""}
                          onChange={handleNumericInput}
                          className="border-slate-600 transition-all focus:border-red-400 focus:ring-red-500/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-700">Wet Bulb Temperature (°C)</h4>
                      <div className="space-y-2">
                        <Label htmlFor={`wetBulbMorning-${selectedDay}`}>Morning Reading</Label>
                        <Input
                          id={`wetBulbMorning-${selectedDay}`}
                          name={`dailyData.${selectedDay - 1}.airTemperature.wetBulbMorning`}
                          type="number"
                          step="0.1"
                          value={formik.values.dailyData[selectedDay - 1]?.airTemperature.wetBulbMorning || ""}
                          onChange={handleNumericInput}
                          className="border-slate-600 transition-all focus:border-red-400 focus:ring-red-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`wetBulbEvening-${selectedDay}`}>Evening Reading</Label>
                        <Input
                          id={`wetBulbEvening-${selectedDay}`}
                          name={`dailyData.${selectedDay - 1}.airTemperature.wetBulbEvening`}
                          type="number"
                          step="0.1"
                          value={formik.values.dailyData[selectedDay - 1]?.airTemperature.wetBulbEvening || ""}
                          onChange={handleNumericInput}
                          className="border-slate-600 transition-all focus:border-red-400 focus:ring-red-500/30"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
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

            {/* Soil Temperature Tab */}
            <TabsContent value="soil" className="mt-6 transition-all duration-500">
              <Card className={cn("overflow-hidden", tabStyles.soil.card)}>
                <div className="p-4 bg-amber-200 text-amber-800">
                  <h3 className="text-lg font-semibold flex items-center">
                    <BarChart3 className="mr-2" /> Soil Temperature Data
                  </h3>
                </div>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Label htmlFor="daySelector">Select Day</Label>
                    <select
                      id="daySelector"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      className="w-full border border-slate-600 rounded-md px-3 py-2 mt-1"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Day {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { depth: "5cm", key: "depth5cm" },
                      { depth: "10cm", key: "depth10cm" },
                      { depth: "20cm", key: "depth20cm" },
                      { depth: "30cm", key: "depth30cm" },
                      { depth: "50cm", key: "depth50cm" },
                    ].map(({ depth, key }) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`${key}-${selectedDay}`}>
                          Soil Temperature at {depth} (°C)
                        </Label>
                        <Input
                          id={`${key}-${selectedDay}`}
                          name={`dailyData.${selectedDay - 1}.soilTemperature.${key}`}
                          type="number"
                          step="0.1"
                          value={formik.values.dailyData[selectedDay - 1]?.soilTemperature[key as keyof typeof formik.values.dailyData[number]['soilTemperature']] || ""}
                          onChange={handleNumericInput}
                          className="border-slate-600 transition-all focus:border-amber-400 focus:ring-amber-500/30"
                       />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
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

            {/* Weather Measurements Tab */}
            <TabsContent value="weather" className="mt-6 transition-all duration-500">
              <Card className={cn("overflow-hidden", tabStyles.weather.card)}>
                <div className="p-4 bg-cyan-200 text-cyan-800">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Wind className="mr-2" /> Weather Measurements
                  </h3>
                </div>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Label htmlFor="daySelector">Select Day</Label>
                    <select
                      id="daySelector"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      className="w-full border border-slate-600 rounded-md px-3 py-2 mt-1"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Day {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`panEvaporation-${selectedDay}`}>
                        Pan Evaporation (mm)
                      </Label>
                      <Input
                        id={`panEvaporation-${selectedDay}`}
                        name={`dailyData.${selectedDay - 1}.panEvaporation`}
                        type="number"
                        step="0.1"
                        value={formik.values.dailyData[selectedDay - 1]?.panEvaporation || ""}
                        onChange={handleNumericInput}
                        className="border-slate-600 transition-all focus:border-cyan-400 focus:ring-cyan-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`windSpeed-${selectedDay}`}>
                        Wind Speed (km/h)
                      </Label>
                      <Input
                        id={`windSpeed-${selectedDay}`}
                        name={`dailyData.${selectedDay - 1}.windSpeed`}
                        type="number"
                        step="0.1"
                        value={formik.values.dailyData[selectedDay - 1]?.windSpeed || ""}
                        onChange={handleNumericInput}
                        className="border-slate-600 transition-all focus:border-cyan-400 focus:ring-cyan-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`rainfall-${selectedDay}`}>
                        Rainfall (mm)
                      </Label>
                      <Input
                        id={`rainfall-${selectedDay}`}
                        name={`dailyData.${selectedDay - 1}.rainfall`}
                        type="number"
                        step="0.1"
                        value={formik.values.dailyData[selectedDay - 1]?.rainfall || ""}
                        onChange={handleNumericInput}
                        className="border-slate-600 transition-all focus:border-cyan-400 focus:ring-cyan-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`duration-${selectedDay}`}>
                        Duration (hours)
                      </Label>
                      <Input
                        id={`duration-${selectedDay}`}
                        name={`dailyData.${selectedDay - 1}.duration`}
                        type="number"
                        step="0.1"
                        max="24"
                        value={formik.values.dailyData[selectedDay - 1]?.duration || ""}
                        onChange={handleNumericInput}
                        className="border-slate-600 transition-all focus:border-cyan-400 focus:ring-cyan-500/30"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
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

            {/* Summary Tab */}
            <TabsContent value="summary" className="mt-6 transition-all duration-500">
              <Card className={cn("overflow-hidden", tabStyles.summary.card)}>
                <div className="p-4 bg-green-200 text-green-800">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Calendar className="mr-2" /> Data Summary & Submission
                  </h3>
                </div>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-sm text-blue-600">Station</h4>
                      <p className="text-lg font-bold text-blue-800">
                        {formik.values.stationInfo.stationName || "Not set"}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-sm text-blue-600">Period</h4>
                      <p className="text-lg font-bold text-blue-800">
                        {formik.values.stationInfo.month}/{formik.values.stationInfo.year}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-sm text-blue-600">Location</h4>
                      <p className="text-lg font-bold text-blue-800">
                        {formik.values.stationInfo.latitude}°, {formik.values.stationInfo.longitude}°
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-sm text-blue-600">Elevation</h4>
                      <p className="text-lg font-bold text-blue-800">
                        {formik.values.stationInfo.elevation} m
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Data Completion Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        Station Info: Complete
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        Solar: {formik.values.dailyData.filter(d => d.solarRadiation).length}/31 days
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        Temperature: {formik.values.dailyData.filter(d => d.airTemperature.dryBulbMorning).length}/31 days
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        Weather: {formik.values.dailyData.filter(d => d.rainfall).length}/31 days
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        formik.resetForm()
                        setActiveTab("station")
                        toast.info("Form has been reset")
                      }}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Data"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.form>
    </div>
  )
}
