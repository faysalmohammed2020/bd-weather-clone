"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CloudIcon,
  CloudRainIcon,
  Wind,
  User,
  Sun,
  Loader2,
  Clock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { useWeatherObservationForm } from "@/stores/useWeatherObservationForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import HourSelector from "@/components/hour-selector";
import { useHour } from "@/contexts/hourContext";
import { useTimeCheck } from "@/hooks/useTimeCheck";
import { utcToHour } from "@/lib/utils";

export default function WeatherObservationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("cloud");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // cloud, n, significant-cloud, rainfall, wind, observer
  const { data: session } = useSession();

  const { time, error: timeError } = useTimeCheck();

  const handleNext = () => {
    // Add validation for current step before proceeding
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, totalSteps);
      setCurrentStep(nextStep);
      setActiveTab(getTabForStep(nextStep));
    }
  };

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    setActiveTab(getTabForStep(prevStep));
  };

  const getTabForStep = (step: number) => {
    const steps = [
      "cloud",
      "n",
      "significant-cloud",
      "rainfall",
      "wind",
      "observer",
    ];
    return steps[step - 1] || "cloud";
  };

  // This section was removed to avoid duplicate declarations

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Cloud
        return (
          !!safeFormData.clouds.low.form ||
          !!safeFormData.clouds.medium.form ||
          !!safeFormData.clouds.high.form
        );
      case 2: // Total Cloud
        return !!safeFormData.totalCloud["total-cloud-amount"];
      // Add validation for other steps as needed
      default:
        return true;
    }
  };

  // Get the persistent form store
  const { formData, updateFields, resetForm, checkAndResetIfExpired } =
    useWeatherObservationForm();

  // Create a safe default value for form data to prevent TypeScript errors
  const safeFormData = {
    clouds: {
      low: formData?.clouds?.low || {},
      medium: formData?.clouds?.medium || {},
      high: formData?.clouds?.high || {},
    },
    significantClouds: {
      layer1: formData?.significantClouds?.layer1 || {},
      layer2: formData?.significantClouds?.layer2 || {},
      layer3: formData?.significantClouds?.layer3 || {},
      layer4: formData?.significantClouds?.layer4 || {},
    },
    rainfall: formData?.rainfall || {},
    wind: formData?.wind || {},
    observer: formData?.observer || {},
    totalCloud: formData?.totalCloud || {},
    metadata: formData?.metadata || {},
  };

  // Initialize session-specific values when session is available
  useEffect(() => {
    if (session?.user) {
      // Set the observer name from session if available
      updateFields({
        observer: {
          ...(formData?.observer || {}),
          "observer-initial": session.user.name || "",
        },
        metadata: {
          ...(formData?.metadata || {}),
          stationId: session.user.stationId || "",
        },
      });
    }
    // We intentionally omit formData from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, updateFields]);

  // Set observation time on initial load (only runs once)
  // Set observation time on initial load (only runs once)
  // Set observation time on initial load (only runs once)
  useEffect(() => {
    if (!formData?.observer || !formData?.observer["observation-time"]) {
      const utcHour = new Date().getUTCHours().toString().padStart(2, "0"); // "03", "15", etc.
      updateFields({
        observer: {
          ...(formData?.observer || {}),
          "observation-time": utcHour,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle input changes and update the form data state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the appropriate section of the form data based on the input name
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "");
      // Ensure we have all required properties for clouds
      updateFields({
        clouds: {
          low: { ...(safeFormData.clouds?.low || {}), [field]: value },
          medium: { ...(safeFormData.clouds?.medium || {}) },
          high: { ...(safeFormData.clouds?.high || {}) },
        },
      });
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "");
      // Ensure we have all required properties for clouds
      updateFields({
        clouds: {
          low: { ...(safeFormData.clouds?.low || {}) },
          medium: { ...(safeFormData.clouds?.medium || {}), [field]: value },
          high: { ...(safeFormData.clouds?.high || {}) },
        },
      });
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "");
      // Ensure we have all required properties for clouds
      updateFields({
        clouds: {
          low: { ...(safeFormData.clouds?.low || {}) },
          medium: { ...(safeFormData.clouds?.medium || {}) },
          high: { ...(safeFormData.clouds?.high || {}), [field]: value },
        },
      });
    } else if (name.startsWith("sig-cloud-layer1-")) {
      const field = name.replace("sig-cloud-layer1-", "");
      // Ensure we have all required properties for significantClouds
      updateFields({
        significantClouds: {
          layer1: {
            ...(safeFormData.significantClouds?.layer1 || {}),
            [field]: value,
          },
          layer2: { ...(safeFormData.significantClouds?.layer2 || {}) },
          layer3: { ...(safeFormData.significantClouds?.layer3 || {}) },
          layer4: { ...(safeFormData.significantClouds?.layer4 || {}) },
        },
      });
    } else if (name.startsWith("sig-cloud-layer2-")) {
      const field = name.replace("sig-cloud-layer2-", "");
      // Ensure we have all required properties for significantClouds
      updateFields({
        significantClouds: {
          layer1: { ...(safeFormData.significantClouds?.layer1 || {}) },
          layer2: {
            ...(safeFormData.significantClouds?.layer2 || {}),
            [field]: value,
          },
          layer3: { ...(safeFormData.significantClouds?.layer3 || {}) },
          layer4: { ...(safeFormData.significantClouds?.layer4 || {}) },
        },
      });
    } else if (name.startsWith("sig-cloud-layer3-")) {
      const field = name.replace("sig-cloud-layer3-", "");
      // Ensure we have all required properties for significantClouds
      updateFields({
        significantClouds: {
          layer1: { ...(safeFormData.significantClouds?.layer1 || {}) },
          layer2: { ...(safeFormData.significantClouds?.layer2 || {}) },
          layer3: {
            ...(safeFormData.significantClouds?.layer3 || {}),
            [field]: value,
          },
          layer4: { ...(safeFormData.significantClouds?.layer4 || {}) },
        },
      });
    } else if (name.startsWith("sig-cloud-layer4-")) {
      const field = name.replace("sig-cloud-layer4-", "");
      // Ensure we have all required properties for significantClouds
      updateFields({
        significantClouds: {
          layer1: { ...(safeFormData.significantClouds?.layer1 || {}) },
          layer2: { ...(safeFormData.significantClouds?.layer2 || {}) },
          layer3: { ...(safeFormData.significantClouds?.layer3 || {}) },
          layer4: {
            ...(safeFormData.significantClouds?.layer4 || {}),
            [field]: value,
          },
        },
      });
    } else if (
      name.startsWith("rainfall-") ||
      name.startsWith("time-") ||
      name.startsWith("since-") ||
      name.startsWith("during-") ||
      name.startsWith("last-")
    ) {
      // Handle rainfall fields with or without the rainfall- prefix
      const field = name.startsWith("rainfall-")
        ? name.replace("rainfall-", "")
        : name;
      updateFields({
        rainfall: { ...(safeFormData.rainfall || {}), [field]: value },
      });
    } else if (
      name === "first-anemometer" ||
      name === "second-anemometer" ||
      name === "speed" ||
      name === "wind-direction" // এই লাইনটি নিশ্চিত করুন
    ) {
      updateFields({
        wind: {
          ...(safeFormData.wind || {}),
          [name]: value,
        },
      });
    }
  };

  // Handle select changes for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "");
      updateFields({
        clouds: {
          low: { ...(safeFormData.clouds?.low || {}), [field]: value },
          medium: { ...(safeFormData.clouds?.medium || {}) },
          high: { ...(safeFormData.clouds?.high || {}) },
        },
      });
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "");
      updateFields({
        clouds: {
          low: { ...(safeFormData.clouds?.low || {}) },
          medium: { ...(safeFormData.clouds?.medium || {}), [field]: value },
          high: { ...(safeFormData.clouds?.high || {}) },
        },
      });
    } // Add this case to your handleInputChange function
    // Update your handleSelectChange to include observation-time
    else if (name === "observation-time") {
      updateFields({
        observer: {
          ...(safeFormData.observer || {}),
          "observation-time": value,
        },
      });
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "");
      updateFields({
        clouds: {
          low: { ...(safeFormData.clouds?.low || {}) },
          medium: { ...(safeFormData.clouds?.medium || {}) },
          high: { ...(safeFormData.clouds?.high || {}), [field]: value },
        },
      });
    } else if (name.startsWith("layer1-")) {
      // Handle significant cloud layer1
      const field = name.replace("layer1-", "");
      updateFields({
        significantClouds: {
          layer1: {
            ...(safeFormData.significantClouds?.layer1 || {}),
            [field]: value,
          },
          layer2: { ...(safeFormData.significantClouds?.layer2 || {}) },
          layer3: { ...(safeFormData.significantClouds?.layer3 || {}) },
          layer4: { ...(safeFormData.significantClouds?.layer4 || {}) },
        },
      });
    } else if (name.startsWith("layer2-")) {
      // Handle significant cloud layer2
      const field = name.replace("layer2-", "");
      updateFields({
        significantClouds: {
          layer1: { ...(safeFormData.significantClouds?.layer1 || {}) },
          layer2: {
            ...(safeFormData.significantClouds?.layer2 || {}),
            [field]: value,
          },
          layer3: { ...(safeFormData.significantClouds?.layer3 || {}) },
          layer4: { ...(safeFormData.significantClouds?.layer4 || {}) },
        },
      });
    } else if (name.startsWith("layer3-")) {
      // Handle significant cloud layer3
      const field = name.replace("layer3-", "");
      updateFields({
        significantClouds: {
          layer1: { ...(safeFormData.significantClouds?.layer1 || {}) },
          layer2: { ...(safeFormData.significantClouds?.layer2 || {}) },
          layer3: {
            ...(safeFormData.significantClouds?.layer3 || {}),
            [field]: value,
          },
          layer4: { ...(safeFormData.significantClouds?.layer4 || {}) },
        },
      });
    } else if (name.startsWith("layer4-")) {
      // Handle significant cloud layer4
      const field = name.replace("layer4-", "");
      updateFields({
        significantClouds: {
          layer1: { ...(safeFormData.significantClouds?.layer1 || {}) },
          layer2: { ...(safeFormData.significantClouds?.layer2 || {}) },
          layer3: { ...(safeFormData.significantClouds?.layer3 || {}) },
          layer4: {
            ...(safeFormData.significantClouds?.layer4 || {}),
            [field]: value,
          },
        },
      });
    } else if (name === "total-cloud-amount") {
      updateFields({
        totalCloud: { ...(safeFormData.totalCloud || {}), [name]: value },
      });
    } else if (
      name.startsWith("time-") ||
      name.startsWith("since-") ||
      name.startsWith("during-") ||
      name.startsWith("last-")
    ) {
      // Handle rainfall fields
      updateFields({
        rainfall: { ...(safeFormData.rainfall || {}), [name]: value },
      });
    }
  };

  // Update the handleSubmit function to ensure session values are included in the submission
  // Update your handleSubmit function to this:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission from the observer tab
    if (activeTab !== "observer" || currentStep !== totalSteps) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        clouds: safeFormData.clouds,
        significantClouds: safeFormData.significantClouds,
        rainfall: safeFormData.rainfall,
        wind: safeFormData.wind,
        observer: {
          ...safeFormData.observer,
        },
        totalCloud: safeFormData.totalCloud,
        metadata: {
          ...safeFormData.metadata,
          submittedAt: new Date().toISOString(),
          stationId: session?.user?.station?.id || "",
        },
      };

      const response = await fetch("/api/save-observation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submissionData),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      await response.json();
      toast.success("Observation submitted successfully!");
      resetForm();
      setCurrentStep(1);
      setActiveTab("cloud");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define tab colors for different sections
  const tabColors: Record<string, string> = {
    cloud: "bg-blue-100 hover:bg-blue-200 data-[state=active]:bg-blue-500",
    n: "bg-yellow-100 hover:bg-yellow-200 data-[state=active]:bg-yellow-500",
    "significant-cloud":
      "bg-purple-100 hover:bg-purple-200 data-[state=active]:bg-purple-500",
    rainfall: "bg-cyan-100 hover:bg-cyan-200 data-[state=active]:bg-cyan-500",
    wind: "bg-green-100 hover:bg-green-200 data-[state=active]:bg-green-500",
    observer:
      "bg-orange-100 hover:bg-orange-200 data-[state=active]:bg-orange-500",
  };
   const cloudAmountOptions = [
    { value: "0", label: "0 - No cloud" },
    { value: "1", label: "1 - 1 octa or less (1/10 or less but not zero)" },
    { value: "2", label: "2 - 2 octas (2/10 to 3/10)" },
    { value: "3", label: "3 - 3 octas (4/10)" },
    { value: "4", label: "4 - 4 octas (5/10)" },
    { value: "5", label: "5 - 5 octas (6/10)" },
    { value: "6", label: "6 - 6 octas (7/10 to 8/10)" },
    { value: "7", label: "7 - 7 octas (9/10 or more but not 10/10)" },
    { value: "8", label: "8 - 8 octas (10/10)" },
    { value: "9", label: "9 - sky obscured or cloud amount cannot be estimated." },
    {
      value: "/",
      label: "/ - Key obscured or cloud amount cannot be estimated",
    },
  ];
  // Prevent form submission on Enter key and other unwanted submissions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentStep < totalSteps) {
        handleNext();
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Weather Observation System
          </h1>
          <p className="text-lg text-gray-600">
            Record meteorological data with precision
          </p>
        </header>

        {/* Wrap in a div to prevent form submission issues */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative rounded-xl">
              {/* Overlay that blocks interaction when no hour is selected */}
              {!time && !timeError && !time?.hasMeteorologicalData && (
                <div className="absolute inset-0 bg-amber-50/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-xl ring-2 ring-amber-200 ring-offset-4">
                  <div className="bg-white py-4 px-6 rounded-lg shadow-lg text-center border-2 border-amber-300">
                    <Clock className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                    <h3 className="text-lg font-medium text-amber-800">
                      {time?.isPassed ? "3 Hours has not passed yet" : "Check first card"}
                    </h3>
                    <p className="text-sm text-amber-600 mt-1">
                      Last update hour: {utcToHour(time?.time) === "NaN" ? "" : utcToHour(time?.time)}
                    </p>
                  </div>
                </div>
              )}

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex w-full bg-gray-100 p-1 rounded-none">
                  <TabTrigger
                    value="cloud"
                    icon={<CloudIcon className="h-5 w-5" />}
                    label="CLOUD"
                    colorClass={tabColors.cloud}
                  />
                  <TabTrigger
                    value="n"
                    icon={<Sun className="h-5 w-5" />}
                    label="TOTAL CLOUD"
                    colorClass={tabColors.n}
                  />
                  <TabTrigger
                    value="significant-cloud"
                    icon={<CloudIcon className="h-5 w-5" />}
                    label="SIG CLOUD"
                    colorClass={tabColors["significant-cloud"]}
                  />
                  <TabTrigger
                    value="rainfall"
                    icon={<CloudRainIcon className="h-5 w-5" />}
                    label="RAINFALL"
                    colorClass={tabColors.rainfall}
                  />
                  <TabTrigger
                    value="wind"
                    icon={<Wind className="h-5 w-5" />}
                    label="WIND"
                    colorClass={tabColors.wind}
                  />
                  <TabTrigger
                    value="observer"
                    icon={<User className="h-5 w-5" />}
                    label="OBSERVER"
                    colorClass={tabColors.observer}
                  />
                </TabsList>

                <div className="p-6">
                  {/* CLOUD Tab */}
                  <TabsContent value="cloud">
                    <SectionCard
                      title="Cloud Observation"
                      icon={<CloudIcon className="h-6 w-6 text-blue-500" />}
                      className="border-blue-200"
                    >
                      <div className="space-y-8">
                        <CloudLevelSection
                          title="Low Cloud"
                          prefix="low-cloud"
                          color="blue"
                          data={safeFormData.clouds.low}
                          onChange={handleInputChange}
                          onSelectChange={handleSelectChange}
                        />
                        <CloudLevelSection
                          title="Medium Cloud"
                          prefix="medium-cloud"
                          color="purple"
                          data={safeFormData.clouds.medium}
                          onChange={handleInputChange}
                          onSelectChange={handleSelectChange}
                        />
                        <CloudLevelSection
                          title="High Cloud"
                          prefix="high-cloud"
                          color="cyan"
                          data={safeFormData.clouds.high}
                          onChange={handleInputChange}
                          onSelectChange={handleSelectChange}
                        />
                      </div>
                    </SectionCard>
                  </TabsContent>

                  {/* TOTAL CLOUD Tab */}
                  <TabsContent value="n">
                    <SectionCard
                      title="Total Cloud Amount"
                      icon={<Sun className="h-6 w-6 text-yellow-500" />}
                      className="border-yellow-200"
                    >
                      <div className="grid gap-6">
                        <SelectField
                          id="total-cloud-amount"
                          name="total-cloud-amount"
                          label="Total Cloud Amount (Octa)"
                          accent="yellow"
                          value={
                            formData.totalCloud["total-cloud-amount"] || ""
                          }
                          onValueChange={(value) =>
                            handleSelectChange("total-cloud-amount", value)
                          }
                          options={cloudAmountOptions.map((opt) => opt.value)}
                          optionLabels={cloudAmountOptions.map(
                            (opt) => opt.label
                          )}
                        />
                      </div>
                    </SectionCard>
                  </TabsContent>

                  {/* SIGNIFICANT CLOUD Tab */}
                  <TabsContent value="significant-cloud">
                    <SectionCard
                      title="Significant Cloud"
                      icon={<CloudIcon className="h-6 w-6 text-purple-500" />}
                      className="border-purple-200"
                    >
                      <div className="space-y-8">
                        <SignificantCloudSection
                          title="1st Layer"
                          prefix="layer1"
                          color="purple"
                          data={formData.significantClouds.layer1}
                          onSelectChange={handleSelectChange}
                        />
                        <SignificantCloudSection
                          title="2nd Layer"
                          prefix="layer2"
                          color="fuchsia"
                          data={formData.significantClouds.layer2}
                          onSelectChange={handleSelectChange}
                        />
                        <SignificantCloudSection
                          title="3rd Layer"
                          prefix="layer3"
                          color="violet"
                          data={formData.significantClouds.layer3}
                          onSelectChange={handleSelectChange}
                        />
                        <SignificantCloudSection
                          title="4th Layer"
                          prefix="layer4"
                          color="indigo"
                          data={formData.significantClouds.layer4}
                          onSelectChange={handleSelectChange}
                        />
                      </div>
                    </SectionCard>
                  </TabsContent>

                  {/* RAINFALL Tab */}
                  <TabsContent value="rainfall">
                    <SectionCard
                      title="Rainfall Measurement (mm)"
                      icon={<CloudRainIcon className="h-6 w-6 text-cyan-500" />}
                      className="border-cyan-200"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <InputField
                          id="time-start"
                          name="time-start"
                          label="Time of Start (HH:MM UTC)"
                          accent="cyan"
                          value={formData.rainfall["time-start"] || ""}
                          onChange={handleInputChange}
                        />
                        <InputField
                          id="time-end"
                          name="time-end"
                          label="Time of Ending (HH:MM UTC)"
                          accent="cyan"
                          value={formData.rainfall["time-end"] || ""}
                          onChange={handleInputChange}
                        />
                        <InputField
                          id="since-previous"
                          name="since-previous"
                          label="Since Previous Observation"
                          accent="cyan"
                          value={formData.rainfall["since-previous"] || ""}
                          onChange={handleInputChange}
                        />
                        <InputField
                          id="during-previous"
                          name="during-previous"
                          label="During Previous 6 Hours (At 00, 06, 12, 18 UTC)"
                          accent="cyan"
                          value={formData.rainfall["during-previous"] || ""}
                          onChange={handleInputChange}
                        />
                        <div className="md:col-span-2">
                          <InputField
                            id="last-24-hours"
                            name="last-24-hours"
                            label="Last 24 Hours Precipitation"
                            accent="cyan"
                            value={formData.rainfall["last-24-hours"] || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </SectionCard>
                  </TabsContent>

                  {/* WIND Tab */}
                  <TabsContent value="wind">
                    <SectionCard
                      title="Wind Measurement"
                      icon={<Wind className="h-6 w-6 text-green-500" />}
                      className="border-green-200"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <InputField
                          id="first-anemometer"
                          name="first-anemometer"
                          label="1st Anemometer Reading"
                          accent="green"
                          value={formData.wind["first-anemometer"] || ""}
                          onChange={handleInputChange}
                        />
                        <InputField
                          id="second-anemometer"
                          name="second-anemometer"
                          label="2nd Anemometer Reading"
                          accent="green"
                          value={formData.wind["second-anemometer"] || ""}
                          onChange={handleInputChange}
                        />
                        <InputField
                          id="speed"
                          name="speed"
                          label="Speed (KTS)"
                          accent="green"
                          value={formData.wind["speed"] || ""}
                          onChange={handleInputChange}
                        />
                        {/* Wind Direction - Fixed */}
                        <div className="grid gap-2">
                          <Label
                            htmlFor="wind-direction"
                            className="font-medium text-gray-700"
                          >
                            Direction (Degrees)
                          </Label>
                          <Input
                            id="wind-direction"
                            name="wind-direction"
                            type="number"
                            min="0"
                            max="360"
                            value={formData.wind["wind-direction"] || ""}
                            onChange={handleInputChange}
                            className="border-2 border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500/30 rounded-lg py-2 px-3"
                            placeholder="0-360 degrees"
                          />
                        </div>
                      </div>
                    </SectionCard>
                  </TabsContent>

                  {/* OBSERVER Tab */}
                  <TabsContent value="observer">
                    <SectionCard
                      title="Observer Information"
                      icon={<User className="h-6 w-6 text-orange-500" />}
                      className="border-orange-200"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <InputField
                          id="observer-initial"
                          name="observer-initial"
                          label="Observer Initials"
                          accent="orange"
                          value={formData.observer["observer-initial"] || ""}
                          onChange={handleInputChange}
                          required
                        />

                        {/* <div className="grid gap-2 w-full">
                        <Label
                          htmlFor="observation-time"
                          className="font-medium text-gray-700"
                        >
                          Observation Time (UTC) *
                        </Label>
                        <select
                          id="observation-time"
                          name="observation-time"
                          value={formData.observer["observation-time"] || ""}
                          onChange={(e) =>
                            handleSelectChange(
                              "observation-time",
                              e.target.value
                            )
                          }
                          required
                          className="w-full border border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-500/30 rounded-lg px-3 py-2 transition-all"
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
                      </div> */}

                        <InputField
                          id="station-id"
                          name="station-id"
                          label="Station ID"
                          accent="orange"
                          value={session?.user?.stationId || ""}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                    </SectionCard>
                  </TabsContent>
                </div>
              </Tabs>

              {/* In your form footer */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between">
                <Button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold py-3 px-6 rounded-lg shadow-md"
                >
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold py-3 px-6 rounded-lg shadow-md"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold py-3 px-6 rounded-lg shadow-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CloudIcon className="h-5 w-5 mr-2" />
                        Submit Observation
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function TabTrigger({
  value,
  icon,
  label,
  colorClass,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  colorClass: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-md transition-all 
                 ${colorClass} data-[state=active]:text-white font-medium`}
    >
      {icon}
      <span>{label}</span>
    </TabsTrigger>
  );
}

function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`border-2 ${className} shadow-sm`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Update the InputField component to support disabled state
function InputField({
  id,
  name,
  label,
  type = "text",
  accent = "blue",
  value,
  disabled = false, // Add disabled prop with default value
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  accent?: string;
  value: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const focusClasses: Record<string, string> = {
    blue: "focus:ring-blue-500 focus:border-blue-500",
    yellow: "focus:ring-yellow-500 focus:border-yellow-500",
    purple: "focus:ring-purple-500 focus:border-purple-500",
    cyan: "focus:ring-cyan-500 focus:border-cyan-500",
    green: "focus:ring-green-500 focus:border-green-500",
    orange: "focus:ring-orange-500 focus:border-orange-500",
    fuchsia: "focus:ring-fuchsia-500 focus:border-fuchsia-500",
    violet: "focus:ring-violet-500 focus:border-violet-500",
    indigo: "focus:ring-indigo-500 focus:border-indigo-500",
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`${focusClasses[accent]} border-gray-300 rounded-lg py-2 px-3 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={disabled}
      />
    </div>
  );
}

function SelectField({
  id,
  name,
  label,
  accent = "blue",
  value,
  onValueChange,
  options,
  optionLabels,
}: {
  id: string;
  name: string;
  label: string;
  accent?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  optionLabels?: string[];
}) {
  const accentColors: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/50 focus-within:ring-blue-500 focus-within:border-blue-500",
    yellow:
      "border-yellow-200 bg-yellow-50/50 focus-within:ring-yellow-500 focus-within:border-yellow-500",
    purple:
      "border-purple-200 bg-purple-50/50 focus-within:ring-purple-500 focus-within:border-purple-500",
    cyan: "border-cyan-200 bg-cyan-50/50 focus-within:ring-cyan-500 focus-within:border-cyan-500",
    green:
      "border-green-200 bg-green-50/50 focus-within:ring-green-500 focus-within:border-green-500",
    orange:
      "border-orange-200 bg-orange-50/50 focus-within:ring-orange-500 focus-within:border-orange-500",
    fuchsia:
      "border-fuchsia-200 bg-fuchsia-50/50 focus-within:ring-fuchsia-500 focus-within:border-fuchsia-500",
    violet:
      "border-violet-200 bg-violet-50/50 focus-within:ring-violet-500 focus-within:border-violet-500",
    indigo:
      "border-indigo-200 bg-indigo-50/50 focus-within:ring-indigo-500 focus-within:border-indigo-500",
  };

  return (
    <div className="grid gap-2 w-full">
      <Label htmlFor={id} className="font-medium text-gray-700">
        {label}
      </Label>
      <Select name={name} value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={`w-full border-2 ${accentColors[accent]} rounded-lg py-2.5 px-4 transition-all duration-200 shadow-sm hover:bg-white focus:shadow-md`}
        >
          <SelectValue placeholder="Select..." className="text-gray-600" />
        </SelectTrigger>
        <SelectContent className="max-h-80 overflow-y-auto rounded-lg border-2 border-gray-200 shadow-lg">
          {options.map((option, index) => (
            <SelectItem
              key={option}
              value={option}
              className="py-2.5 px-4 focus:bg-gray-100 focus:text-gray-900 rounded-md cursor-pointer"
            >
              {optionLabels ? optionLabels[index] : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CloudLevelSection({
  title,
  prefix,
  color = "blue",
  data,
  onChange,
  onSelectChange,
}: {
  title: string;
  prefix: string;
  color?: string;
  data: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}) {
  const cloudFormOptions = [
    { value: "0", label: "0 - No Sc, St, Cu or Cb" },
    { value: "1", label: "1 - Cu with little vertical extent" },
    { value: "2", label: "2 - Cu of moderate/strong vertical extent" },
    { value: "3", label: "3 - Cb lacking sharp outlines" },
    { value: "4", label: "4 - Sc formed from spreading Cu" },
    { value: "5", label: "5 - Sc not from spreading Cu" },
    { value: "6", label: "6 - St in continuous sheet or ragged shreds" },
    { value: "7", label: "7 - Stratus fractus or Cu fractus of bad weather" },
    { value: "8", label: "8 - Cu and Sc at different levels" },
    { value: "9", label: "9 - Cb with fibrous upper part/anvil" },
    { value: "/", label: "/ - Not visible" },
  ];

  const cloudDirectionOptions = [
    { value: "0", label: "0 - Stationary or no direction" },
    { value: "1", label: "1 - Cloud coming from NE" },
    { value: "2", label: "2 - Cloud coming from E" },
    { value: "3", label: "3 - Cloud coming from SE" },
    { value: "4", label: "4 - Cloud coming from S" },
    { value: "5", label: "5 - Cloud coming from SW" },
    { value: "6", label: "6 - Cloud coming from W" },
    { value: "7", label: "7 - Cloud coming from NW" },
    { value: "8", label: "8 - Cloud coming from N" },
    { value: "9", label: "9 - No definite direction or direction unknown" },
  ];

  const cloudHeightOptions = [
    { value: "0", label: "0 - 0 to 50 m" },
    { value: "1", label: "1 - 50 to 100 m" },
    { value: "2", label: "2 - 100 to 200 m" },
    { value: "3", label: "3 - 200 to 300 m" },
    { value: "4", label: "4 - 300 to 600 m" },
    { value: "5", label: "5 - 600 to 1000 m" },
    { value: "6", label: "6 - 1000 to 1500 m" },
    { value: "7", label: "7 - 1500 to 2000 m" },
    { value: "8", label: "8 - 2000 to 2500 m" },
    { value: "9", label: "9 - 2500 m or more or no cloud" },
    { value: "/", label: "/ - Height of base of cloud not known" },
  ];

  const cloudAmountOptions = [
    { value: "0", label: "0 - No cloud" },
    { value: "1", label: "1 - 1 octa or less (1/10 or less but not zero)" },
    { value: "2", label: "2 - 2 octas (2/10 to 3/10)" },
    { value: "3", label: "3 - 3 octas (4/10)" },
    { value: "4", label: "4 - 4 octas (5/10)" },
    { value: "5", label: "5 - 5 octas (6/10)" },
    { value: "6", label: "6 - 6 octas (7/10 to 8/10)" },
    { value: "7", label: "7 - 7 octas (9/10 or more but not 10/10)" },
    { value: "8", label: "8 - 8 octas (10/10)" },
    { value: "9", label: "9 - sky obscured or cloud amount cannot be estimated." },
    {
      value: "/",
      label: "/ - Key obscured or cloud amount cannot be estimated",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label="Form (Code)"
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={cloudFormOptions.map((opt) => opt.value)}
          optionLabels={cloudFormOptions.map((opt) => opt.label)}
        />

        <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label="Amount (Octa)"
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={cloudAmountOptions.map((opt) => opt.value)}
          optionLabels={cloudAmountOptions.map((opt) => opt.label)}
        />

        <SelectField
          id={`${prefix}-height`}
          name={`${prefix}-height`}
          label="Height of Base (Code)"
          accent={color}
          value={data["height"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
          options={cloudHeightOptions.map((opt) => opt.value)}
          optionLabels={cloudHeightOptions.map((opt) => opt.label)}
        />
        
        <SelectField
          id={`${prefix}-direction`}
          name={`${prefix}-direction`}
          label="Direction (Code)"
          accent={color}
          value={data["direction"] || ""}
          onValueChange={(value) =>
            onSelectChange(`${prefix}-direction`, value)
          }
          options={cloudDirectionOptions.map((opt) => opt.value)}
          optionLabels={cloudDirectionOptions.map((opt) => opt.label)}
        />
        
        
        
      </div>
    </div>
  );
}

function SignificantCloudSection({
  title,
  prefix,
  color = "purple",
  data,
  onSelectChange,
}: {
  title: string;
  prefix: string;
  color?: string;
  data: Record<string, string>;
  onSelectChange: (name: string, value: string) => void;
}) {
  // Generate height options from 0 to 99
  const heightOptions = Array.from({ length: 100 }, (_, i) => i.toString());

  const cloudFormOptions = [
    { value: "0", label: "0 - Cirrus (Ci)" },
    { value: "1", label: "1 - Cirrocumulus (Cc)" },
    { value: "2", label: "2 - Cirrostratus (Cs)" },
    { value: "3", label: "3 - Altocumulus (Ac)" },
    { value: "4", label: "4 - Altostratus (As)" },
    { value: "5", label: "5 - Nimbostratus (Ns)" },
    { value: "6", label: "6 - Stratocumulus (Sc)" },
    { value: "7", label: "7 - Stratus (St)" },
    { value: "8", label: "8 - Cumulus (Cu)" },
    { value: "9", label: "9 - Cumulonimbus (Cb)" },
    { value: "/", label: "/ - Clouds not visible (darkness, fog, etc.)" },
  ];

  const SigcloudAmountOptions = [
    { value: "0", label: "0 - No cloud" },
    { value: "1", label: "1 - 1 octa or less (1/10 or less but not zero)" },
    { value: "2", label: "2 - 2 octas (2/10 to 3/10)" },
    { value: "3", label: "3 - 3 octas (4/10)" },
    { value: "4", label: "4 - 4 octas (5/10)" },
    { value: "5", label: "5 - 5 octas (6/10)" },
    { value: "6", label: "6 - 6 octas (7/10 to 8/10)" },
    { value: "7", label: "7 - 7 octas (9/10 or more but not 10/10)" },
    { value: "8", label: "8 - 8 octas (10/10)" },
    {
      value: "/",
      label: "/ - Key obscured or cloud amount cannot be estimated",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label="Form (Code)"
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={cloudFormOptions.map((opt) => opt.value)}
          optionLabels={cloudFormOptions.map((opt) => opt.label)}
        />
         <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label="Amount (Octa)"
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={SigcloudAmountOptions.map((opt) => opt.value)}
          optionLabels={SigcloudAmountOptions.map((opt) => opt.label)}
        />
        <SelectField
          id={`${prefix}-height`}
          name={`${prefix}-height`}
          label="Height of Base (Code)"
          accent={color}
          value={data["height"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
          options={heightOptions}
        />
        
       
      </div>
    </div>
  );
}
