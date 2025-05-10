"use client"

import type React from "react"
import { useState } from "react"
import { toast, Toaster } from "sonner"
import { CloudIcon, CloudRainIcon, Wind, User, Sun, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the form data structure
interface FormData {
  clouds: {
    low: Record<string, string>
    medium: Record<string, string>
    high: Record<string, string>
  }
  significantClouds: {
    layer1: Record<string, string>
    layer2: Record<string, string>
    layer3: Record<string, string>
    layer4: Record<string, string>
  }
  rainfall: Record<string, string>
  wind: Record<string, string>
  observer: Record<string, string>
  totalCloud: Record<string, string>
}

export default function WeatherObservationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("cloud")

  // Initialize form data state to store values across tab changes
  const [formData, setFormData] = useState<FormData>({
    clouds: {
      low: {},
      medium: {},
      high: {},
    },
    totalCloud: {},
    significantClouds: {
      layer1: {},
      layer2: {},
      layer3: {},
      layer4: {},
    },
    rainfall: {},
    wind: {},
    observer: {},
  })

  // Handle input changes and update the form data state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Update the appropriate section of the form data based on the input name
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "")
      setFormData((prev) => ({
        ...prev,
        clouds: {
          ...prev.clouds,
          low: { ...prev.clouds.low, [field]: value },
        },
      }))
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "")
      setFormData((prev) => ({
        ...prev,
        clouds: {
          ...prev.clouds,
          medium: { ...prev.clouds.medium, [field]: value },
        },
      }))
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "")
      setFormData((prev) => ({
        ...prev,
        clouds: {
          ...prev.clouds,
          high: { ...prev.clouds.high, [field]: value },
        },
      }))
    }
    // Significant clouds
    else if (name.startsWith("layer")) {
      const [layer, field] = name.split("-").slice(0, 2)
      setFormData((prev) => ({
        ...prev,
        significantClouds: {
          ...prev.significantClouds,
          [layer]: { ...prev.significantClouds[layer as keyof typeof prev.significantClouds], [field]: value },
        },
      }))
    }
    // Total cloud
    else if (name === "total-cloud-amount") {
      setFormData((prev) => ({
        ...prev,
        totalCloud: { ...prev.totalCloud, [name]: value },
      }))
    }
    // Rainfall
    else if (["time-start", "time-end", "since-previous", "during-previous", "last-24-hours"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        rainfall: { ...prev.rainfall, [name]: value },
      }))
    }
    // Wind
    else if (["first-anemometer", "second-anemometer", "speed", "wind-direction"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        wind: { ...prev.wind, [name]: value },
      }))
    }
    // Observer
    else if (["observer-initial", "observation-time", "station-id"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        observer: { ...prev.observer, [name]: value },
      }))
    }
  }

  // Handle select changes for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "")
      setFormData((prev) => ({
        ...prev,
        clouds: {
          ...prev.clouds,
          low: { ...prev.clouds.low, [field]: value },
        },
      }))
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "")
      setFormData((prev) => ({
        ...prev,
        clouds: {
          ...prev.clouds,
          medium: { ...prev.clouds.medium, [field]: value },
        },
      }))
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "")
      setFormData((prev) => ({
        ...prev,
        clouds: {
          ...prev.clouds,
          high: { ...prev.clouds.high, [field]: value },
        },
      }))
    } else if (name.startsWith("layer")) {
      const [layer, field] = name.split("-").slice(0, 2)
      setFormData((prev) => ({
        ...prev,
        significantClouds: {
          ...prev.significantClouds,
          [layer]: { ...prev.significantClouds[layer as keyof typeof prev.significantClouds], [field]: value },
        },
      }))
    } else if (name === "total-cloud-amount") {
      setFormData((prev) => ({
        ...prev,
        totalCloud: { ...prev.totalCloud, [name]: value },
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare the data object from our state
      const dataToSubmit = {
        clouds: formData.clouds,
        totalCloud: formData.totalCloud,
        significantClouds: formData.significantClouds,
        rainfall: formData.rainfall,
        wind: {
          ...formData.wind,
          direction: formData.wind["wind-direction"], // Rename to match expected format
        },
        observer: {
          ...formData.observer,
        },
      }

      // Add metadata
      const submissionData = {
        ...dataToSubmit,
        metadata: {
          submittedAt: new Date().toISOString(),
          stationId: formData.observer["station-id"] || "unknown",
          tabActiveAtSubmission: activeTab,
        },
      }

      const response = await fetch("/api/save-observation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": crypto.randomUUID(),
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const result = await response.json()

      toast.success("Weather data saved successfully!", {
        description: `Observation ID: ${result.data.metadata.id}`,
        action: {
          label: "View All",
          onClick: () => (window.location.href = "/observations"),
        },
      })

      // Reset form but preserve station ID
      const stationId = formData.observer["station-id"]

      // Reset form data
      setFormData({
        clouds: { low: {}, medium: {}, high: {} },
        significantClouds: { layer1: {}, layer2: {}, layer3: {}, layer4: {} },
        rainfall: {},
        wind: {},
        observer: { "station-id": stationId || "" },
        totalCloud: {},
      })
    } catch (error) {
      toast.error("Failed to save observation", {
        description: error instanceof Error ? error.message : "Unknown error",
        action: {
          label: "Retry",
          onClick: () => handleSubmit(e),
        },
      })
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabColors: Record<string, string> = {
    cloud: "bg-blue-100 hover:bg-blue-200 data-[state=active]:bg-blue-500",
    n: "bg-yellow-100 hover:bg-yellow-200 data-[state=active]:bg-yellow-500",
    "significant-cloud": "bg-purple-100 hover:bg-purple-200 data-[state=active]:bg-purple-500",
    rainfall: "bg-cyan-100 hover:bg-cyan-200 data-[state=active]:bg-cyan-500",
    wind: "bg-green-100 hover:bg-green-200 data-[state=active]:bg-green-500",
    observer: "bg-orange-100 hover:bg-orange-200 data-[state=active]:bg-orange-500",
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto">
        <header className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800">Weather Observation System</h1>
          <p className="text-lg text-gray-600">Record meteorological data with precision</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full bg-gray-100 p-1 rounded-none">
              <TabTrigger
                value="cloud"
                icon={<CloudIcon className="h-5 w-5" />}
                label="CLOUD"
                colorClass={tabColors.cloud}
              />
              <TabTrigger value="n" icon={<Sun className="h-5 w-5" />} label="TOTAL CLOUD" colorClass={tabColors.n} />
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
              <TabTrigger value="wind" icon={<Wind className="h-5 w-5" />} label="WIND" colorClass={tabColors.wind} />
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
                      data={formData.clouds.low}
                      onChange={handleInputChange}
                      onSelectChange={handleSelectChange}
                    />
                    <CloudLevelSection
                      title="Medium Cloud"
                      prefix="medium-cloud"
                      color="purple"
                      data={formData.clouds.medium}
                      onChange={handleInputChange}
                      onSelectChange={handleSelectChange}
                    />
                    <CloudLevelSection
                      title="High Cloud"
                      prefix="high-cloud"
                      color="cyan"
                      data={formData.clouds.high}
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
                      value={formData.totalCloud["total-cloud-amount"] || ""}
                      onValueChange={(value) => handleSelectChange("total-cloud-amount", value)}
                      options={Array.from({ length: 10 }, (_, i) => i.toString())}
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
                    <InputField
                      id="direction"
                      name="wind-direction"
                      label="Direction"
                      accent="green"
                      value={formData.wind["wind-direction"] || ""}
                      onChange={handleInputChange}
                    />
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
                      label="Initial of Observer"
                      accent="orange"
                      value={formData.observer["observer-initial"] || ""}
                      onChange={handleInputChange}
                    />
                    <InputField
                      id="observation-time"
                      name="observation-time"
                      label="Time of Observation (UTC)"
                      type="datetime-local"
                      accent="orange"
                      value={formData.observer["observation-time"] || ""}
                      onChange={handleInputChange}
                    />
                    <InputField
                      id="station-id"
                      name="station-id"
                      label="Station ID"
                      accent="orange"
                      value={formData.observer["station-id"] || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </SectionCard>
              </TabsContent>
            </div>
          </Tabs>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-end">
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
          </div>
        </form>
      </div>
    </div>
  )
}

// Reusable Components
function TabTrigger({
  value,
  icon,
  label,
  colorClass,
}: {
  value: string
  icon: React.ReactNode
  label: string
  colorClass: string
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
  )
}

function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
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
  )
}

function InputField({
  id,
  name,
  label,
  type = "text",
  accent = "blue",
  value,
  onChange,
}: {
  id: string
  name: string
  label: string
  type?: string
  accent?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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
  }

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
        className={`${focusClasses[accent]} border-gray-300 rounded-lg py-2 px-3`}
      />
    </div>
  )
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
  id: string
  name: string
  label: string
  accent?: string
  value: string
  onValueChange: (value: string) => void
  options: string[]
  optionLabels?: string[]
}) {
  const accentColors: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/50 focus-within:ring-blue-500 focus-within:border-blue-500",
    yellow: "border-yellow-200 bg-yellow-50/50 focus-within:ring-yellow-500 focus-within:border-yellow-500",
    purple: "border-purple-200 bg-purple-50/50 focus-within:ring-purple-500 focus-within:border-purple-500",
    cyan: "border-cyan-200 bg-cyan-50/50 focus-within:ring-cyan-500 focus-within:border-cyan-500",
    green: "border-green-200 bg-green-50/50 focus-within:ring-green-500 focus-within:border-green-500",
    orange: "border-orange-200 bg-orange-50/50 focus-within:ring-orange-500 focus-within:border-orange-500",
    fuchsia: "border-fuchsia-200 bg-fuchsia-50/50 focus-within:ring-fuchsia-500 focus-within:border-fuchsia-500",
    violet: "border-violet-200 bg-violet-50/50 focus-within:ring-violet-500 focus-within:border-violet-500",
    indigo: "border-indigo-200 bg-indigo-50/50 focus-within:ring-indigo-500 focus-within:border-indigo-500",
  }

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
  )
}

function CloudLevelSection({
  title,
  prefix,
  color = "blue",
  data,
  onChange,
  onSelectChange,
}: {
  title: string
  prefix: string
  color?: string
  data: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: string, value: string) => void
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
  ]

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
  ]

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
  ]


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
    { value: "/", label: "/ - Key obscured or cloud amount cannot be estimated" },
  ]

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
      <SelectField
          id={`${prefix}-direction`}
          name={`${prefix}-direction`}
          label="Direction (Code)"
          accent={color}
          value={data["direction"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-direction`, value)}
          options={cloudDirectionOptions.map(opt => opt.value)}
          optionLabels={cloudDirectionOptions.map(opt => opt.label)}
        />
        <SelectField
          id={`${prefix}-height`}
          name={`${prefix}-height`}
          label="Height of Base (Code)"
          accent={color}
          value={data["height"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
          options={cloudHeightOptions.map(opt => opt.value)}
          optionLabels={cloudHeightOptions.map(opt => opt.label)}
        />
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label="Form (Code)"
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={cloudFormOptions.map(opt => opt.value)}
          optionLabels={cloudFormOptions.map(opt => opt.label)}
        />
       <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label="Amount (Octa)"
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={cloudAmountOptions.map(opt => opt.value)}
          optionLabels={cloudAmountOptions.map(opt => opt.label)}
        />
      </div>
    </div>
  )
}

function SignificantCloudSection({
  title,
  prefix,
  color = "purple",
  data,
  onSelectChange,
}: {
  title: string
  prefix: string
  color?: string
  data: Record<string, string>
  onSelectChange: (name: string, value: string) => void
}) {
  // Generate height options from 0 to 99
  const heightOptions = Array.from({ length: 100 }, (_, i) => i.toString())

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id={`${prefix}-height`}
          name={`${prefix}-height`}
          label="Height of Base (Code)"
          accent={color}
          value={data["height"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
          options={heightOptions}
        />
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label="Form (Code)"
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={[...Array.from({ length: 10 }, (_, i) => i.toString()), "/"]}
        />
        <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label="Amount (Octa)"
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={Array.from({ length: 9 }, (_, i) => i.toString())}
        />
      </div>
    </div>
  )
}