"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  CloudIcon,
  CloudRainIcon,
  Wind,
  User,
  Sun,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "@/lib/auth-client"
import { useWeatherObservationForm } from "@/stores/useWeatherObservationForm"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useFormik } from "formik"
import { useTranslations } from "next-intl"
import * as Yup from "yup"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useHour } from "@/contexts/hourContext"
import HourSelector from "@/components/hour-selector"
import type { TimeInfo } from "@/lib/data-type"

// Define the form data type
type WeatherObservationFormData = {
  clouds: {
    low: {
      form?: string
      amount?: string
      height?: string
      direction?: string
    }
    medium: {
      form?: string
      amount?: string
      height?: string
      direction?: string
    }
    high: {
      form?: string
      amount?: string
      height?: string
      direction?: string
    }
  }
  totalCloud: {
    "total-cloud-amount"?: string
  }
  significantClouds: {
    layer1: {
      form?: string
      amount?: string
      height?: string
    }
    layer2: {
      form?: string
      amount?: string
      height?: string
    }
    layer3: {
      form?: string
      amount?: string
      height?: string
    }
    layer4: {
      form?: string
      amount?: string
      height?: string
    }
  }
  rainfall: {
    "time-start"?: string
    "time-end"?: string
    "since-previous"?: string
    "during-previous"?: string
    "last-24-hours"?: string
    isIntermittentRain?: boolean
  }
  wind: {
    "first-anemometer"?: string
    "second-anemometer"?: string
    speed?: string
    "wind-direction"?: string
  }
  observer: {
    "observer-initial"?: string
    "observation-time"?: string
  }
  metadata: {
    stationId?: string
    submittedAt?: string
  }
}

export default function SecondCardForm({ timeInfo }: { timeInfo: TimeInfo[] }) {
  const t = useTranslations("secondCard")
  const t2 = useTranslations("Validation")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("cloud")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6 // cloud, n, significant-cloud, rainfall, wind, observer
  const { data: session } = useSession()

  const { isHourSelected, secondCardError, selectedHour, isLoading, resetStates } = useHour()

  // Get the persistent form store
  const { formData, updateFields, resetForm } = useWeatherObservationForm()

  // Tab styles with gradients and more vibrant colors
  const tabStyles = {
    cloud: {
      tab: "border border-blue-500 px-4 py-3 !bg-blue-50 text-blue-800 hover:opacity-90 shadow-sm shadow-blue-500/50",
      card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
      icon: <CloudIcon className="size-5 mr-2" />,
    },
    n: {
      tab: "border border-yellow-500 px-4 py-3 !bg-yellow-50 text-yellow-800 hover:opacity-90 shadow-sm shadow-yellow-500/50",
      card: "bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-200 shadow-sm",
      icon: <Sun className="size-5 mr-2" />,
    },
    "significant-cloud": {
      tab: "border border-purple-500 px-4 py-3 !bg-purple-50 text-purple-800 hover:opacity-90 shadow-sm shadow-purple-500/50",
      card: "bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-200 shadow-sm",
      icon: <CloudIcon className="size-5 mr-2" />,
    },
    rainfall: {
      tab: "border border-cyan-500 px-4 py-3 !bg-cyan-50 text-cyan-800 hover:opacity-90 shadow-sm shadow-cyan-500/50",
      card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
      icon: <CloudRainIcon className="size-5 mr-2" />,
    },
    wind: {
      tab: "border border-green-500 px-4 py-3 !bg-green-50 text-green-800 hover:opacity-90 shadow-sm shadow-green-500/50",
      card: "bg-gradient-to-br from-green-50 to-white border-l-4 border-green-200 shadow-sm",
      icon: <Wind className="size-5 mr-2" />,
    },
    observer: {
      tab: "border border-orange-500 px-4 py-3 !bg-orange-50 text-orange-800 hover:opacity-90 shadow-sm shadow-orange-500/50",
      card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
      icon: <User className="size-5 mr-2" />,
    },
  }

  //validation schema

  // Rainfall validation schema
  const rainfallSchema = Yup.object({
    rainfall: Yup.object({
      "since-previous": Yup.string()
        .required(t("errors.required"))
        .matches(/^[1-9]\d{0,2}$/, t2("errors.rainfall.invalidFormat"))
        .test("is-valid-range", t2("errors.rainfall.invalidRange"), (value) => {
          const num = Number.parseInt(value || "0");
          return num >= 1 && num <= 989;
        }),
      "during-previous": Yup.string()
        .required(t("errors.required"))
        .matches(/^[1-9]\d{0,2}$/, t2("errors.rainfall.invalidFormat"))
        .test("is-valid-range", t2("errors.rainfall.invalidRange"), (value) => {
          const num = Number.parseInt(value || "0");
          return num >= 1 && num <= 989;
        }),
      "last-24-hours": Yup.string()
        .required(t("errors.required"))
        .matches(/^[1-9]\d{0,2}$/, t2("errors.rainfall.invalidFormat"))
        .test("is-valid-range", t2("errors.rainfall.invalidRange"), (value) => {
          const num = Number.parseInt(value || "0");
          return num >= 1 && num <= 989;
        }),
    }),
  });

  // Wind validation schema
  const windSchema = Yup.object({
    wind: Yup.object({
      "first-anemometer": Yup.string()
        .required(t2("errors.required"))
        .matches(/^\d{5}$/, t2("errors.wind.anemometer")),
      "second-anemometer": Yup.string()
        .required(t2("errors.required"))
        .matches(/^\d{5}$/, t2("errors.wind.anemometer")),
      speed: Yup.string()
        .required(t2("errors.required"))
        .matches(/^\d{3}$/, t2("errors.wind.speed")),
      "wind-direction": Yup.string()
        .required(t2("errors.required"))
        .test("is-valid-direction", t2("errors.wind.direction"), (value) => {
          if (!value) return false;
          if (value === "00") return true;
          const num = Number(value);
          return Number.isInteger(num) && num >= 5 && num <= 360;
        }),
    }),
  });

  // Cloud validation schema
  const cloudSchema = Yup.object({
    clouds: Yup.object({
      low: Yup.object({
        form: Yup.string().required(t2("errors.required")),
        amount: Yup.string().required(t2("errors.required")),
        height: Yup.string().required(t2("errors.required")),
        direction: Yup.string().required(t2("errors.required")),
      }),
      medium: Yup.object({
        form: Yup.string().required(t2("errors.required")),
        amount: Yup.string().required(t2("errors.required")),
        height: Yup.string().required(t2("errors.required")),
        direction: Yup.string().required(t2("errors.required")),
      }),
      high: Yup.object({
        form: Yup.string().required(t2("errors.required")),
        amount: Yup.string().required(t2("errors.required")),
        direction: Yup.string().required(t2("errors.required")),
      }),
    }),
  });

  // Total cloud validation schema
  const totalCloudSchema = Yup.object({
    totalCloud: Yup.object({
      "total-cloud-amount": Yup.string().required(t2("errors.required")),
    }),
  });

  // Significant cloud validation schema
  const significantCloudSchema = Yup.object({
    significantClouds: Yup.object({
      layer1: Yup.object({
        form: Yup.string().required(t2("errors.required")),
        amount: Yup.string().required(t2("errors.required")),
        height: Yup.string()
          .required(t2("errors.required"))
          .matches(/^[0-9]+$/, t2("errors.cloud.numbersOnly")),
      }),
      layer2: Yup.object({
        form: Yup.string(),
        amount: Yup.string(),
        height: Yup.string().matches(/^[0-9]*$/, t2("errors.cloud.numbersOnly")),
      }),
      layer3: Yup.object({
        form: Yup.string(),
        amount: Yup.string(),
        height: Yup.string().matches(/^[0-9]*$/, t2("errors.cloud.numbersOnly")),
      }),
      layer4: Yup.object({
        form: Yup.string(),
        amount: Yup.string(),
        height: Yup.string().matches(/^[0-9]*$/, t2("errors.cloud.numbersOnly")),
      }),
    }),
  });

  // Observer validation schema
  const observerSchema = Yup.object({
    observer: Yup.object({
      "observer-initial": Yup.string().required(t2("errors.required")),
      "observation-time": Yup.string().required(t2("errors.required")),
    }),
  });

  // Combined schema for the entire form
  const validationSchema = Yup.object({
    ...cloudSchema.fields,
    ...totalCloudSchema.fields,
    ...significantCloudSchema.fields,
    ...rainfallSchema.fields,
    ...windSchema.fields,
    ...observerSchema.fields,
  })

  ///////////////////////////////////////////////////

  // Initialize Formik
  const formik = useFormik<WeatherObservationFormData>({
    initialValues: {
      clouds: {
        low: formData?.clouds?.low || {},
        medium: formData?.clouds?.medium || {},
        high: formData?.clouds?.high || {},
      },
      totalCloud: formData?.totalCloud || {},
      significantClouds: {
        layer1: formData?.significantClouds?.layer1 || {},
        layer2: formData?.significantClouds?.layer2 || {},
        layer3: formData?.significantClouds?.layer3 || {},
        layer4: formData?.significantClouds?.layer4 || {},
      },
      rainfall: {
        "since-previous": formData?.rainfall?.["since-previous"] || "",
        "during-previous": formData?.rainfall?.["during-previous"] || "",
        "last-24-hours": formData?.rainfall?.["last-24-hours"] || "",
        isIntermittentRain: formData?.rainfall?.isIntermittentRain || false,
      },

      wind: formData?.wind || {},
      observer: {
        "observer-initial": session?.user?.name || "",
        "observation-time": new Date().getUTCHours().toString().padStart(2, "0"),
        ...formData?.observer,
      },
      metadata: {
        stationId: session?.user?.station?.stationId || "",
        ...formData?.metadata,
      },
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  })

  // Function to check if a tab is valid
  const isTabValid = (tabName: string) => {
    const errors = formik.errors
    const touched = formik.touched

    switch (tabName) {
      case "cloud":
        return !(
          (touched.clouds?.low && errors.clouds?.low) ||
          (touched.clouds?.medium && errors.clouds?.medium) ||
          (touched.clouds?.high && errors.clouds?.high)
        )
      case "n":
        return !(touched.totalCloud?.["total-cloud-amount"] && errors.totalCloud?.["total-cloud-amount"])
      case "significant-cloud":
        return !(touched.significantClouds?.layer1 && errors.significantClouds?.layer1)
      case "rainfall":
        return !(
          (touched.rainfall?.["since-previous"] && errors.rainfall?.["since-previous"]) ||
          (touched.rainfall?.["during-previous"] && errors.rainfall?.["during-previous"]) ||
          (touched.rainfall?.["last-24-hours"] && errors.rainfall?.["last-24-hours"])
        )
      case "wind":
        return !(
          (touched.wind?.["first-anemometer"] && errors.wind?.["first-anemometer"]) ||
          (touched.wind?.["second-anemometer"] && errors.wind?.["second-anemometer"]) ||
          (touched.wind?.speed && errors.wind?.speed) ||
          (touched.wind?.["wind-direction"] && errors.wind?.["wind-direction"])
        )
      case "observer":
        return !(
          (touched.observer?.["observer-initial"] && errors.observer?.["observer-initial"]) ||
          (touched.observer?.["observation-time"] && errors.observer?.["observation-time"])
        )
      default:
        return true
    }
  }

  // Function to validate current tab before proceeding
  const validateTab = (tabName: string) => {
    let fieldsToValidate: string[] = []

    switch (tabName) {
      case "cloud":
        fieldsToValidate = [
          "clouds.low.form",
          "clouds.low.amount",
          "clouds.low.height",
          "clouds.low.direction",
          "clouds.medium.form",
          "clouds.medium.amount",
          "clouds.medium.height",
          "clouds.medium.direction",
          "clouds.high.form",
          "clouds.high.amount",
          "clouds.high.height",
          "clouds.high.direction",
        ]
        break
      case "n":
        fieldsToValidate = ["totalCloud.total-cloud-amount"]
        break
      case "significant-cloud":
        fieldsToValidate = [
          "significantClouds.layer1.form",
          "significantClouds.layer1.amount",
          "significantClouds.layer1.height",
          "significantClouds.layer2.height",
          "significantClouds.layer3.height",
          "significantClouds.layer4.height",
        ]
        break
      case "rainfall":
        fieldsToValidate = ["rainfall.since-previous", "rainfall.during-previous", "rainfall.last-24-hours"]
        break
      case "wind":
        fieldsToValidate = ["wind.first-anemometer", "wind.second-anemometer", "wind.speed", "wind.wind-direction"]
        break
      case "observer":
        fieldsToValidate = ["observer.observer-initial", "observer.observation-time"]
        break
    }

    // Touch all fields in the current tab to trigger validation
    const touchedFields = {}
    fieldsToValidate.forEach((field) => {
      const fieldParts = field.split(".")
      if (fieldParts.length === 2) {
        touchedFields[fieldParts[0]] = {
          ...formik.touched[fieldParts[0]],
          [fieldParts[1]]: true,
        }
      } else if (fieldParts.length === 3) {
        touchedFields[fieldParts[0]] = {
          ...formik.touched[fieldParts[0]],
          [fieldParts[1]]: {
            ...formik.touched[fieldParts[0]]?.[fieldParts[1]],
            [fieldParts[2]]: true,
          },
        }
      }
    })

    formik.setTouched({ ...formik.touched, ...touchedFields }, true)

    // Check if there are any errors in the validated fields
    return !fieldsToValidate.some((field) => {
      const fieldParts = field.split(".")
      if (fieldParts.length === 2) {
        return formik.errors[fieldParts[0]]?.[fieldParts[1]]
      } else if (fieldParts.length === 3) {
        return formik.errors[fieldParts[0]]?.[fieldParts[1]]?.[fieldParts[2]]
      }
      return false
    })
  }

  // Initialize session-specific values when session is available
  useEffect(() => {
    if (session?.user) {
      formik.setFieldValue("observer.observer-initial", session.user.name || "")
      formik.setFieldValue("metadata.stationId", session.user.station?.stationId || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // Set observation time on initial load (only runs once)
  useEffect(() => {
    if (!formik.values.observer["observation-time"]) {
      const utcHour = new Date().getUTCHours().toString().padStart(2, "0")
      formik.setFieldValue("observer.observation-time", utcHour)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync formik values with the store
  useEffect(() => {
    updateFields(formik.values)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values])

  // Update the handleNext function to validate the current tab before proceeding
  const handleNext = () => {
    // Validate current tab before proceeding
    if (validateTab(activeTab)) {
      const nextStep = Math.min(currentStep + 1, totalSteps)
      setCurrentStep(nextStep)
      setActiveTab(getTabForStep(nextStep))
    } else {
      toast.error(t("alerts.fillRequired"), {
        description: t("alerts.completeTab"),
      })
    }
  }

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1)
    setCurrentStep(prevStep)
    setActiveTab(getTabForStep(prevStep))
  }

  const getTabForStep = (step: number) => {
    const steps = ["cloud", "n", "significant-cloud", "rainfall", "wind", "observer"]
    return steps[step - 1] || "cloud"
  }

  // Handle input changes and update the form data state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Guard clause for undefined or null name
    if (!name) {
      console.warn("Input element has no name attribute")
      return
    }

    // Update the form field value
    if (name.startsWith("rainfall-")) {
      const field = name.replace("rainfall-", "")
      formik.setFieldValue(`rainfall.${field}`, value)
    } else if (
      name === "first-anemometer" ||
      name === "second-anemometer" ||
      name === "speed" ||
      name === "wind-direction"
    ) {
      formik.setFieldValue(`wind.${name}`, value)
    }

    // Mark the field as touched
    formik.setFieldTouched(name, true, true)

    // Update the appropriate section of the form data based on the input name
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "")
      formik.setFieldValue(`clouds.low.${field}`, value)
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "")
      formik.setFieldValue(`clouds.medium.${field}`, value)
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "")
      formik.setFieldValue(`clouds.high.${field}`, value)
    } else if (name.startsWith("sig-cloud-layer1-")) {
      const field = name.replace("sig-cloud-layer1-", "")
      formik.setFieldValue(`significantClouds.layer1.${field}`, value)
    } else if (name.startsWith("sig-cloud-layer2-")) {
      const field = name.replace("sig-cloud-layer2-", "")
      formik.setFieldValue(`significantClouds.layer2.${field}`, value)
    } else if (name.startsWith("sig-cloud-layer3-")) {
      const field = name.replace("sig-cloud-layer3-", "")
      formik.setFieldValue(`significantClouds.layer3.${field}`, value)
    } else if (name.startsWith("sig-cloud-layer4-")) {
      const field = name.replace("sig-cloud-layer4-", "")
      formik.setFieldValue(`significantClouds.layer4.${field}`, value)
    } else if (
      name.startsWith("rainfall-") ||
      name === "date-start" ||
      name === "time-start" ||
      name === "date-end" ||
      name === "time-end" ||
      name === "since-previous" ||
      name === "during-previous" ||
      name === "last-24-hours" ||
      name === "isIntermittentRain"
    ) {
      const field = name.startsWith("rainfall-") ? name.replace("rainfall-", "") : name

      formik.setFieldValue(`rainfall.${field}`, value)
    } else if (
      name === "first-anemometer" ||
      name === "second-anemometer" ||
      name === "speed" ||
      name === "wind-direction"
    ) {
      formik.setFieldValue(`wind.${name}`, value)
    } else if (name === "observer-initial") {
      formik.setFieldValue("observer.observer-initial", value)
    }
  }

  // Handle select changes for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "")
      formik.setFieldValue(`clouds.low.${field}`, value)
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "")
      formik.setFieldValue(`clouds.medium.${field}`, value)
    } else if (name === "observation-time") {
      formik.setFieldValue("observer.observation-time", value)
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "")
      formik.setFieldValue(`clouds.high.${field}`, value)
    } else if (name.startsWith("layer1-")) {
      const field = name.replace("layer1-", "")
      formik.setFieldValue(`significantClouds.layer1.${field}`, value)
    } else if (name.startsWith("layer2-")) {
      const field = name.replace("layer2-", "")
      formik.setFieldValue(`significantClouds.layer2.${field}`, value)
    } else if (name.startsWith("layer3-")) {
      const field = name.replace("layer3-", "")
      formik.setFieldValue(`significantClouds.layer3.${field}`, value)
    } else if (name.startsWith("layer4-")) {
      const field = name.replace("layer4-", "")
      formik.setFieldValue(`significantClouds.layer4.${field}`, value)
    } else if (name === "total-cloud-amount") {
      formik.setFieldValue("totalCloud.total-cloud-amount", value)
    } else if (
      name.startsWith("time-") ||
      name.startsWith("since-") ||
      name.startsWith("during-") ||
      name.startsWith("last-")
    ) {
      formik.setFieldValue(`rainfall.${name}`, value)
    }
  }

  // Reset form function
  const handleReset = () => {
    // Clear all form data except station info
    const resetValues = {
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
      observer: {
        "observer-initial": session?.user?.name || "",
        "observation-time": new Date().getUTCHours().toString().padStart(2, "0"),
      },
      metadata: {
        stationId: session?.user?.station?.stationId || "",
      },
    }

    formik.resetForm({ values: resetValues })
    resetForm()

    // Show toast notification
    toast.info(t("alerts.formCleared"))

    // Reset to first tab
    setCurrentStep(1)
    setActiveTab("cloud")
  }

  async function handleSubmit(values: WeatherObservationFormData) {
    // Prevent duplicate submissions
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const submissionData = {
        ...values,
        observingTimeId: selectedHour || "",
        metadata: {
          ...values.metadata,
          submittedAt: new Date().toISOString(),
          stationId: session?.user?.station?.id || "",
        },
      }

      const response = await fetch("/api/save-observation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.message)
        return
      }

      toast.success(data.message, {
        description: `Entry #${data.dataCount} saved`,
      })

      resetForm()
      formik.resetForm()
      resetStates()
      setCurrentStep(1)
      setActiveTab("cloud")
      updateFields({})
    } catch (error) {
      console.error("Submission error:", error)
      toast.error(t("alerts.submissionFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to render error message
  const renderErrorMessage = (fieldPath: string) => {
    const fieldParts = fieldPath.split(".")
    let error = null

    if (fieldParts.length === 2) {
      error = formik.touched[fieldParts[0]]?.[fieldParts[1]] && formik.errors[fieldParts[0]]?.[fieldParts[1]]
    } else if (fieldParts.length === 3) {
      error =
        formik.touched[fieldParts[0]]?.[fieldParts[1]]?.[fieldParts[2]] &&
        formik.errors[fieldParts[0]]?.[fieldParts[1]]?.[fieldParts[2]]
    }

    return error ? (
      <div className="text-red-500 text-sm mt-1 flex items-start">
        <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    ) : null
  }

  // Prevent form submission on Enter key and other unwanted submissions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  // Check if current tab is the last one
  const isFirstTab = currentStep === 1

  // Update the Tabs component to prevent direct tab navigation when current tab is invalid
  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading || secondCardError || !isHourSelected ? (
          <motion.div
            key="hour-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-white backdrop-blur-sm z-50 px-6"
          >
            <HourSelector type="second" timeInfo={timeInfo} />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={formik.handleSubmit}
            className="w-full"
            onKeyDown={handleKeyDown}
          >
            <div className="relative rounded-xl">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  const currentTabIndex = Object.keys(tabStyles).indexOf(activeTab)
                  const newTabIndex = Object.keys(tabStyles).indexOf(value)

                  if (newTabIndex <= currentTabIndex || validateTab(activeTab)) {
                    setActiveTab(value)
                    setCurrentStep(newTabIndex + 1)
                  } else {
                    toast.error(t("alerts.fillRequired"), {
                      description: t("alerts.completeTab"),
                    })
                  }
                }}
                className="w-full"
              >
                {/* Responsive tabs list */}
                <TabsList className="grid w-full mb-10 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 rounded-xl p-1 border-0 bg-transparent">
                  {Object.entries(tabStyles).map(([key, style]) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className={cn("border border-gray-300 text-xs sm:text-sm", {
                        [style.tab]: activeTab === key,
                        "!border-red-500 !text-red-700": !isTabValid(key) && formik.submitCount > 0,
                      })}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {style.icon}
                        <span className="hidden sm:inline">{t(`tabs.${key}`)}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="p-4 sm:p-6">
                  {/* CLOUD Tab */}
                  <TabsContent value="cloud" className="mt-4 sm:mt-6 transition-all duration-500">
                    <Card className={cn("overflow-hidden", tabStyles.cloud.card)}>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <CloudIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t("cloud.title")}
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-6 sm:space-y-8">
                          <CloudLevelSection
                            title={t("cloud.low")}
                            prefix="low-cloud"
                            color="blue"
                            data={formik.values.clouds.low}
                            onChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            renderError={(field) => renderErrorMessage(`clouds.low.${field}`)}
                            t={t}
                          />
                          <CloudLevelSection
                            title={t("cloud.medium")}
                            prefix="medium-cloud"
                            color="purple"
                            data={formik.values.clouds.medium}
                            onChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            renderError={(field) => renderErrorMessage(`clouds.medium.${field}`)}
                            t={t}
                          />
                          <CloudLevelSection
                            title={t("cloud.high")}
                            prefix="high-cloud"
                            color="cyan"
                            data={formik.values.clouds.high}
                            onChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            renderError={(field) => renderErrorMessage(`clouds.high.${field}`)}
                            t={t}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("buttons.previous")}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          {t("buttons.next")} <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* TOTAL CLOUD Tab */}
                  <TabsContent value="n" className="mt-4 sm:mt-6 transition-all duration-500">
                    <Card className={cn("overflow-hidden", tabStyles.n.card)}>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <Sun className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t("totalCloud.title")}
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="grid gap-4 sm:gap-6">
                          <SelectField
                            id="total-cloud-amount"
                            name="total-cloud-amount"
                            label={t("totalCloud.label")}
                            accent="yellow"
                            value={formik.values.totalCloud["total-cloud-amount"] || ""}
                            onValueChange={(value) => handleSelectChange("total-cloud-amount", value)}
                            options={Object.keys(t.raw("options.cloudAmount"))}
                            optionLabels={Object.values(t.raw("options.cloudAmount"))}
                            error={renderErrorMessage("totalCloud.total-cloud-amount")}
                            required
                            t={t}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("buttons.previous")}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          {t("buttons.next")} <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* SIGNIFICANT CLOUD Tab */}
                  <TabsContent value="significant-cloud" className="mt-4 sm:mt-6 transition-all duration-500">
                    <Card className={cn("overflow-hidden", tabStyles["significant-cloud"].card)}>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <CloudIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t("significantCloud.title")}
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-6 sm:space-y-8">
                          <SignificantCloudSection
                            title={t("significantCloud.layer1")}
                            prefix="layer1"
                            color="purple"
                            data={formik.values.significantClouds.layer1}
                            onSelectChange={handleSelectChange}
                            renderError={(field) => renderErrorMessage(`significantClouds.layer1.${field}`)}
                            t={t}
                          />
                          <SignificantCloudSection
                            title={t("significantCloud.layer2")}
                            prefix="layer2"
                            color="fuchsia"
                            data={formik.values.significantClouds.layer2}
                            onSelectChange={handleSelectChange}
                            renderError={(field) => renderErrorMessage(`significantClouds.layer2.${field}`)}
                            t={t}
                          />
                          <SignificantCloudSection
                            title={t("significantCloud.layer3")}
                            prefix="layer3"
                            color="violet"
                            data={formik.values.significantClouds.layer3}
                            onSelectChange={handleSelectChange}
                            renderError={(field) => renderErrorMessage(`significantClouds.layer3.${field}`)}
                            t={t}
                          />
                          <SignificantCloudSection
                            title={t("significantCloud.layer4")}
                            prefix="layer4"
                            color="indigo"
                            data={formik.values.significantClouds.layer4}
                            onSelectChange={handleSelectChange}
                            renderError={(field) => renderErrorMessage(`significantClouds.layer4.${field}`)}
                            t={t}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("buttons.previous")}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          {t("buttons.next")} <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* RAINFALL Tab */}
                  <TabsContent value="rainfall" className="mt-4 sm:mt-6 transition-all duration-500">
                    <Card className={cn("overflow-hidden", tabStyles.rainfall.card)}>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-200 to-cyan-300 text-cyan-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <CloudRainIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t("rainfall.title")}
                        </h3>
                      </div>

                      <CardContent className="pt-4 sm:pt-6">
                        <p className="mb-3 text-xs sm:text-sm text-yellow-800">{t("rainfall.note")}</p>
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="time-start" className="font-medium text-gray-700 text-xs sm:text-sm">
                              {t("rainfall.timeStart")} <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                id="date-start"
                                name="date-start"
                                type="date"
                                value={formik.values.rainfall["date-start"] || ""}
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                              <Input
                                id="time-start"
                                name="time-start"
                                type="text"
                                placeholder={t("rainfall.setThis")}
                                step="60"
                                value={formik.values.rainfall["time-start"] || ""}
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                            </div>

                            {renderErrorMessage("rainfall.time-start")}
                            <p className="text-xs text-gray-500 mt-1">{t("rainfall.formatHint")}</p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="time-end" className="font-medium text-gray-700 text-xs sm:text-sm">
                              {t("rainfall.timeEnd")} <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                id="date-end"
                                name="date-end"
                                type="date"
                                value={formik.values.rainfall["date-end"] || ""}
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                              <Input
                                id="time-end"
                                name="time-end"
                                type="text"
                                placeholder={t("rainfall.setThis")}
                                step="60"
                                value={formik.values.rainfall["time-end"] || ""}
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                            </div>

                            {renderErrorMessage("rainfall.time-end")}
                            <p className="text-xs text-gray-500 mt-1">{t("rainfall.formatHint")}</p>
                          </div>

                          <InputField
                            id="since-previous"
                            name="since-previous"
                            label={t("rainfall.sincePrevious")}
                            placeholder={t("rainfall.placeholder")}
                            accent="cyan"
                            value={formik.values.rainfall["since-previous"] || ""}
                            onChange={handleInputChange}
                            error={renderErrorMessage("rainfall.since-previous")}
                            required
                            numeric={true}
                            maxLength={3}
                            min={1}
                            max={989}
                            t={t}
                          />

                          <InputField
                            id="during-previous"
                            name="during-previous"
                            label={t("rainfall.duringPrevious")}
                            placeholder={t("rainfall.placeholder")}
                            accent="cyan"
                            value={formik.values.rainfall["during-previous"] || ""}
                            onChange={handleInputChange}
                            error={renderErrorMessage("rainfall.during-previous")}
                            required
                            numeric={true}
                            maxLength={3}
                            min={1}
                            max={989}
                            t={t}
                          />

                          <InputField
                            id="last-24-hours"
                            name="last-24-hours"
                            label={t("rainfall.last24Hours")}
                            placeholder={t("rainfall.placeholder")}
                            accent="cyan"
                            value={formik.values.rainfall["last-24-hours"] || ""}
                            onChange={handleInputChange}
                            error={renderErrorMessage("rainfall.last-24-hours")}
                            required
                            numeric={true}
                            maxLength={3}
                            min={1}
                            max={989}
                            t={t}
                          />

                          <div className="md:col-span-2 flex items-center gap-2 mt-2 sm:mt-4">
                            <input
                              id="is-intermittent-rain"
                              name="isIntermittentRain"
                              type="checkbox"
                              checked={formik.values.rainfall?.isIntermittentRain || false}
                              onChange={(e) => {
                                formik.setFieldValue("rainfall.isIntermittentRain", e.target.checked)
                              }}
                              className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <Label
                              htmlFor="is-intermittent-rain"
                              className="font-medium text-cyan-800 text-xs sm:text-sm"
                            >
                              {t("rainfall.intermittentRain")}
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("buttons.previous")}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          {t("buttons.next")} <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* WIND Tab */}
                  <TabsContent value="wind" className="mt-4 sm:mt-6 transition-all duration-500">
                    <Card className={cn("overflow-hidden", tabStyles.wind.card)}>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-green-200 to-green-300 text-green-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <Wind className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t("wind.title")}
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="first-anemometer" className="font-medium text-gray-700 text-xs sm:text-sm">
                              {t("wind.first")}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="first-anemometer"
                              name="first-anemometer"
                              placeholder={t("wind.placeholder")}
                              value={formik.values.wind?.["first-anemometer"] || ""}
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-cyan-300 bg-cyan-50 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500": formik.errors.wind?.["first-anemometer"],
                                },
                              )}
                              required
                            />
                            <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-start">
                              {formik.errors.wind?.["first-anemometer"]}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="second-anemometer" className="font-medium text-gray-700 text-xs sm:text-sm">
                              {t("wind.second")}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="second-anemometer"
                              name="second-anemometer"
                              placeholder={t("wind.placeholder")}
                              value={formik.values.wind?.["second-anemometer"] || ""}
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-cyan-300 bg-cyan-50 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500": formik.errors.wind?.["second-anemometer"],
                                },
                              )}
                              required
                            />
                            <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-start">
                              {formik.errors.wind?.["second-anemometer"]}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="speed" className="font-medium text-gray-700 text-xs sm:text-sm">
                              {t("wind.speed")}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="speed"
                              name="speed"
                              placeholder={t("wind.placeholder3")}
                              value={formik.values.wind?.["speed"] || ""}
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-cyan-300 bg-cyan-50 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500": formik.errors.wind?.["speed"],
                                },
                              )}
                              required
                            />
                            <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-start">
                              {formik.errors.wind?.["speed"]}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="wind-direction" className="font-medium text-gray-700 text-xs sm:text-sm">
                              {t("wind.direction")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="wind-direction"
                              name="wind-direction"
                              type="number"
                              min="0"
                              max="360"
                              value={formik.values.wind["wind-direction"] || ""}
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500": renderErrorMessage("wind.wind-direction"),
                                },
                              )}
                              placeholder={t("wind.directionPlaceholder")}
                              required
                              inputMode="numeric"
                            />
                            {renderErrorMessage("wind.wind-direction")}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("buttons.previous")}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          {t("buttons.next")} <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* OBSERVER Tab */}
                  <TabsContent value="observer" className="mt-4 sm:mt-6 transition-all duration-500">
                    <Card className={cn("overflow-hidden", tabStyles.observer.card)}>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t("observer.title")}
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <InputField
                            id="observer-initial"
                            name="observer-initial"
                            label={t("observer.initials")}
                            accent="orange"
                            value={formik.values.observer["observer-initial"] || ""}
                            onChange={handleInputChange}
                            required
                            error={renderErrorMessage("observer.observer-initial")}
                            t={t}
                          />
                          <InputField
                            id="station-id"
                            name="station-id"
                            label={t("observer.stationId")}
                            accent="orange"
                            value={session?.user?.station?.stationId || ""}
                            onChange={handleInputChange}
                            disabled
                            t={t}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row justify-between p-4 sm:p-6 gap-3 sm:gap-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm w-full sm:w-auto flex justify-center items-center"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t("buttons.previous")}
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-600 hover:bg-slate-100 transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto"
                            onClick={handleReset}
                          >
                            {t("buttons.reset")}
                          </Button>

                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm text-xs sm:text-sm w-full sm:w-auto flex justify-center items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 animate-spin" />
                                {t("buttons.submitting")}
                              </>
                            ) : (
                              <>
                                <CloudIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                {t("buttons.submit")}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  )
}

// Reusable Components

function InputField({
  id,
  name,
  label,
  type = "text",
  accent = "blue",
  value,
  disabled = false,
  required = false,
  placeholder = "",
  onChange,
  error,
  numeric = false,
  maxLength,
  min,
  max,
  t,
}: {
  id: string
  name: string
  label: string
  type?: string
  accent?: string
  value: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: React.ReactNode
  numeric?: boolean
  maxLength?: number
  min?: number
  max?: number
  t: any
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // For numeric fields, validate immediately
    if (numeric) {
      // Only allow numbers and empty string
      if (value !== "" && !/^\d*$/.test(value)) {
        return // Don't update if not a number
      }

      // Enforce max length
      if (maxLength && value.length > maxLength) {
        value = value.slice(0, maxLength)
      }

      // Enforce min/max if provided
      if (value !== "") {
        const numValue = Number.parseInt(value, 10)
        if (min !== undefined && numValue < min) {
          value = min.toString()
        }
        if (max !== undefined && numValue > max) {
          value = max.toString()
        }
      }
    }

    // Create a new event with the updated value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: value,
        name: e.target.name, // Ensure name is preserved
      },
    }

    onChange(newEvent)
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={numeric ? "number" : type}
        value={value}
        onChange={handleInput}
        className={cn(`${focusClasses[accent]} border-gray-300 rounded-lg py-2 px-3`, {
          "bg-gray-100 cursor-not-allowed": disabled,
          "border-red-500": error,
        })}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        inputMode={numeric ? "numeric" : "text"}
        min={min}
        max={max}
        maxLength={maxLength}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
  error,
  required = false,
  t,
}: {
  id: string
  name: string
  label: string
  accent?: string
  value: string
  onValueChange: (value: string) => void
  options: string[]
  optionLabels?: string[]
  error?: React.ReactNode
  required?: boolean
  t: any
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
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select name={name} value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            `w-full border-2 ${accentColors[accent]} rounded-lg py-2.5 px-4 transition-all duration-200 shadow-sm hover:bg-white focus:shadow-md`,
            {
              "border-red-500": error,
            },
          )}
        >
          <SelectValue placeholder={t("errors.required")} className="text-gray-600" />
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
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function CloudLevelSection({
  title,
  prefix,
  color = "blue",
  data,
  onSelectChange,
  renderError,
  t,
}: {
  title: string
  prefix: string
  color?: string
  data: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: string, value: string) => void
  renderError: (field: string) => React.ReactNode
  t: any
}) {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label={t("SelectField.form")}
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={Object.keys(t.raw("options.cloudForm"))}
          optionLabels={Object.values(t.raw("options.cloudForm"))}
          error={renderError("form")}
          required
          t={t}
        />

        <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label={t("SelectField.amount")}
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={Object.keys(t.raw("options.cloudAmount"))}
          optionLabels={Object.values(t.raw("options.cloudAmount"))}
          error={renderError("amount")}
          required
          t={t}
        />

        {prefix !== "high-cloud" && (
          <SelectField
            id={`${prefix}-height`}
            name={`${prefix}-height`}
            label={t("SelectField.height")}
            accent={color}
            value={data["height"] || ""}
            onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
            options={Object.keys(t.raw("options.cloudHeight"))}
            optionLabels={Object.values(t.raw("options.cloudHeight"))}
            error={renderError("height")}
            required
            t={t}
          />
        )}

        <SelectField
          id={`${prefix}-direction`}
          name={`${prefix}-direction`}
          label={t("SelectField.direction")}
          accent={color}
          value={data["direction"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-direction`, value)}
          options={Object.keys(t.raw("options.cloudDirection"))}
          optionLabels={Object.values(t.raw("options.cloudDirection"))}
          error={renderError("direction")}
          required
          t={t}
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
  renderError,
  t,
}: {
  title: string
  prefix: string
  color?: string
  data: Record<string, string>
  onSelectChange: (name: string, value: string) => void
  renderError: (field: string) => React.ReactNode
  t: any
}) {
  // Generate height options from 0 to 99
  const heightOptions = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"))

  // Determine if this is the first layer (required) or other layers (optional)
  const isRequired = prefix === "layer1"

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label={t("SelectField.form")}
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={Object.keys(t.raw("options.sigCloudForm"))}
          optionLabels={Object.values(t.raw("options.sigCloudForm"))}
          error={renderError("form")}
          required={isRequired}
          t={t}
        />
        <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label={t("SelectField.amount")}
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={Object.keys(t.raw("options.cloudAmount"))}
          optionLabels={Object.values(t.raw("options.cloudAmount"))}
          error={renderError("amount")}
          required={isRequired}
          t={t}
        />
        <SelectField
          id={`${prefix}-height`}
          name={`${prefix}-height`}
          label={t("SelectField.height")}
          accent={color}
          value={data["height"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
          options={heightOptions}
          error={renderError("height")}
          required={isRequired}
          t={t}
        />
      </div>
    </div>
  )
}
