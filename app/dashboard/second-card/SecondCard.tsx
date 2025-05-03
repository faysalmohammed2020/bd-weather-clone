"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CloudIcon, CloudRainIcon, Wind, User, Sun, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast, Toaster } from "sonner"

export default function WeatherObservationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("cloud")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const formObject: Record<string, string> = {}

      // Convert FormData to a plain object
      formData.forEach((value, key) => {
        formObject[key] = value.toString()
      })

      // Add timestamp to the data
      formObject.timestamp = new Date().toISOString()

      const response = await fetch("/api/save-observation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formObject),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Weather observation submitted successfully!")
        // Reset form
        ;(e.target as HTMLFormElement).reset()
      } else {
        throw new Error(result.error || "Failed to submit observation")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex flex-col">
      <Toaster position="top-right" richColors />

      <div className="text-center p-4">
        <h1 className="text-2xl font-bold">Weather Observation System</h1>
        <p className="text-gray-600">Record meteorological data with precision</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="flex-grow overflow-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap mb-4 w-full justify-between">
              <TabsTrigger
                value="cloud"
                className="flex items-center gap-2 flex-grow data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <CloudIcon className="h-4 w-4" />
                <span className="hidden sm:inline">CLOUD</span>
              </TabsTrigger>
              <TabsTrigger
                value="n"
                className="flex-grow data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                N
              </TabsTrigger>
              <TabsTrigger
                value="significant-cloud"
                className="flex-grow text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <span className="hidden sm:inline">SIGNIFICANT</span> CLOUD
              </TabsTrigger>
              <TabsTrigger
                value="rainfall"
                className="flex items-center gap-2 flex-grow data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <CloudRainIcon className="h-4 w-4" />
                <span className="hidden sm:inline">RAINFALL</span>
              </TabsTrigger>
              <TabsTrigger
                value="wind"
                className="flex items-center gap-2 flex-grow data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Wind className="h-4 w-4" />
                <span className="hidden sm:inline">WIND</span>
              </TabsTrigger>
              <TabsTrigger
                value="observer"
                className="flex items-center gap-2 flex-grow data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Observer</span>
              </TabsTrigger>
            </TabsList>

            {/* CLOUD Tab Content */}
            <TabsContent value="cloud" className="h-full overflow-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudIcon className="h-5 w-5" />
                    Cloud Observation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="low" className="w-full">
                    <TabsList className="flex w-full mb-4">
                      <TabsTrigger
                        value="low"
                        className="flex-1 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
                      >
                        LOW
                      </TabsTrigger>
                      <TabsTrigger
                        value="medium"
                        className="flex-1 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
                      >
                        MEDIUM
                      </TabsTrigger>
                      <TabsTrigger
                        value="high"
                        className="flex-1 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
                      >
                        HIGH
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="low">
                      <CloudLevelInputs title="Low Cloud" />
                    </TabsContent>

                    <TabsContent value="medium">
                      <CloudLevelInputs title="Medium Cloud" />
                    </TabsContent>

                    <TabsContent value="high">
                      <CloudLevelInputs title="High Cloud" />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* N Tab Content */}
            <TabsContent value="n" className="h-full overflow-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Total Cloud Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="total-cloud-amount">Total Cloud Amount (Octa)</Label>
                      <Input id="total-cloud-amount" name="total-cloud-amount" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SIGNIFICANT CLOUD Tab Content */}
            <TabsContent value="significant-cloud" className="h-full overflow-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudIcon className="h-5 w-5" />
                    Significant Cloud
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="layer1" className="w-full">
                    <TabsList className="flex flex-wrap w-full mb-4">
                      <TabsTrigger
                        value="layer1"
                        className="flex-1 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
                      >
                        1st Layer
                      </TabsTrigger>
                      <TabsTrigger
                        value="layer2"
                        className="flex-1 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
                      >
                        2nd Layer
                      </TabsTrigger>
                      <TabsTrigger
                        value="layer3"
                        className="flex-1 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
                      >
                        3rd Layer
                      </TabsTrigger>
                      <TabsTrigger
                        value="layer4"
                        className="flex-1 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
                      >
                        4th Layer
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="layer1">
                      <SignificantCloudLayer title="1st Layer" />
                    </TabsContent>

                    <TabsContent value="layer2">
                      <SignificantCloudLayer title="2nd Layer" />
                    </TabsContent>

                    <TabsContent value="layer3">
                      <SignificantCloudLayer title="3rd Layer" />
                    </TabsContent>

                    <TabsContent value="layer4">
                      <SignificantCloudLayer title="4th Layer" />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RAINFALL Tab Content */}
            <TabsContent value="rainfall" className="h-full overflow-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudRainIcon className="h-5 w-5" />
                    Rainfall Measurement (mm)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="time-start">Time of Start (HH:MM UTC)</Label>
                      <Input id="time-start" name="time-start" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time-end">Time of Ending (HH:MM UTC)</Label>
                      <Input id="time-end" name="time-end" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="since-previous">Since Previous Observation</Label>
                      <Input id="since-previous" name="since-previous" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="during-previous">During Previous 6 Hours (At 00, 06, 12, 18 UTC)</Label>
                      <Input id="during-previous" name="during-previous" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-24-hours">Last 24 Hours Precipitation</Label>
                      <Input id="last-24-hours" name="last-24-hours" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WIND Tab Content */}
            <TabsContent value="wind" className="h-full overflow-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Wind Measurement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="first-anemometer">1st Anemometer Reading</Label>
                      <Input id="first-anemometer" name="first-anemometer" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="second-anemometer">2nd Anemometer Reading</Label>
                      <Input id="second-anemometer" name="second-anemometer" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="speed">Speed (KTS)</Label>
                      <Input id="speed" name="speed" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="direction">Direction</Label>
                      <Input id="direction" name="wind-direction" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Observer Tab Content */}
            <TabsContent value="observer" className="h-full overflow-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Observer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="observer-initial">Initial of Observer</Label>
                      <Input id="observer-initial" name="observer-initial" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="observation-time">Time of Observation (UTC)</Label>
                      <Input id="observation-time" name="observation-time" type="datetime-local" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="station-id">Station ID</Label>
                      <Input id="station-id" name="station-id" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 flex justify-end gap-2">
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CloudIcon className="h-4 w-4 mr-2" />
                Submit Observation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

function CloudLevelInputs({ title }: { title: string }) {
  const prefix = title.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <h3 className="text-lg font-medium md:col-span-2">{title}</h3>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}-direction`}>Direction (Code)</Label>
        <Input id={`${prefix}-direction`} name={`${prefix}-direction`} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}-height`}>Height of Base (Code)</Label>
        <Input id={`${prefix}-height`} name={`${prefix}-height`} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}-form`}>Form (Code)</Label>
        <Input id={`${prefix}-form`} name={`${prefix}-form`} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}-amount`}>Amount (Octa)</Label>
        <Input id={`${prefix}-amount`} name={`${prefix}-amount`} />
      </div>
    </div>
  )
}

function SignificantCloudLayer({ title }: { title: string }) {
  const prefix = title.toLowerCase().replace(/\s+/g, "-")

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-height`}>Height of Base (Code)</Label>
          <Input id={`${prefix}-height`} name={`${prefix}-height`} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-form`}>Form (Code)</Label>
          <Input id={`${prefix}-form`} name={`${prefix}-form`} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-amount`}>Amount (Octa)</Label>
          <Input id={`${prefix}-amount`} name={`${prefix}-amount`} />
        </div>
      </div>
    </div>
  )
}
