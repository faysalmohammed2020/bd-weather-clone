"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  BarChart3,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { hygrometricTable } from "@/data/hygrometric-table";
import { useSession } from "@/lib/auth-client";
import { stationDataMap } from "@/data/station-data-map";
import { useHour } from "@/contexts/hourContext";
import { useFormik } from "formik";
import BasicInfoTab from "@/components/basic-info-tab";
import HourSelector from "@/components/hour-selector";
import { AnimatePresence, motion } from "framer-motion";
import type { MeteorologicalEntry } from "@prisma/client";
import type { TimeInfo } from "@/lib/data-type";

// Import validation schemas from separate file
import { validationSchema } from "@/validations/first-card-validation";
import { useTranslations } from "next-intl";

export function FirstCardForm({ timeInfo }: { timeInfo: TimeInfo[] }) {
  const [activeTab, setActiveTab] = useState("temperature");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    isHourSelected,
    selectedHour,
    firstCardError,
    isLoading,
    timeData,
    resetStates,
  } = useHour();

  const [hygrometricData, setHygrometricData] = useState({
    dryBulb: "",
    wetBulb: "",
    difference: "",
    dewPoint: "",
    relativeHumidity: "",
  });

  const { data: session } = useSession();
  const t = useTranslations('firstCard');
  const tabs = useTranslations('firstCard.tabs')
  // Tab order for navigation
  const tabOrder = [
   
    "temperature",
    "pressure",
    "squall",
    "visibility",
    "meteors",
    "weather",
  ];

  // Tab styles with gradients and more vibrant colors
  const tabStyles = {
   
    temperature: {
      tab: "border border-blue-500 px-4 py-3 !bg-blue-50 text-blue-800 hover:opacity-90 shadow-sm shadow-blue-500/50",
      card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
      icon: <Thermometer className="size-5 mr-2" />,
    },
     pressure: {
      tab: "border border-rose-500 px-4 py-3 !bg-rose-50 text-rose-800 hover:opacity-90 shadow-sm shadow-rose-500/50",
      card: "bg-gradient-to-br from-rose-50 to-white border-l-4 border-rose-200 shadow-sm",
      icon: <BarChart3 className="size-5 mr-2" />,
    },
    squall: {
      tab: "border border-amber-500 px-4 py-3 !bg-amber-50 text-amber-800 hover:opacity-90 shadow-sm shadow-amber-500/50",
      card: "bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-200 shadow-sm",
      icon: <Wind className="size-5 mr-2" />,
    },
    visibility: {
      tab: "border border-orange-500 px-4 py-3 !bg-orange-50 text-orange-800 hover:opacity-90 shadow-sm shadow-orange-500/50",
      card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
      icon: <Eye className="size-5 mr-2" />,
    },
    meteors: {
      tab: "border border-emerald-600 px-4 py-3 !bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-sm shadow-emerald-400/50",
      card: "bg-gradient-to-br from-emerald-50 via-white to-white border-l-4 border-emerald-300 shadow-sm",
      icon: <Flame className="size-5 mr-2 text-emerald-500" />,
    },
    weather: {
      tab: "border border-cyan-500 px-4 py-3 !bg-cyan-50 text-cyan-800 hover:opacity-90 shadow-sm shadow-cyan-500/50",
      card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
      icon: <Cloud className="size-5 mr-2" />,
    },
  };

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      presentWeatherWW: "",
      subIndicator: "1",
      alteredThermometer: "",
      barAsRead: "",
      correctedForIndex: "",
      heightDifference: "",
      stationLevelPressure: "",
      seaLevelReduction: "",
      correctedSeaLevelPressure: "",
      afternoonReading: "",
      pressureChange24h: "",
      dryBulbAsRead: "",
      wetBulbAsRead: "",
      maxMinTempAsRead: "",
      dryBulbCorrected: "",
      wetBulbCorrected: "",
      maxMinTempCorrected: "",
      Td: "",
      relativeHumidity: "",
      squallConfirmed: false,
      squallForce: "",
      squallDirection: "",
      squallTime: "",
      horizontalVisibility: "",
      miscMeteors: "",
      pastWeatherW1: "",
      pastWeatherW2: "",
      c2Indicator: "",
      observationTime: "",
      stationNo: session?.user?.station?.id || "",
      year: new Date().getFullYear().toString().slice(2),
      cloudCover: "",
      visibility: "",
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  // Function to check if a tab is valid
  const isTabValid = (tabName: string) => {
    const errors = formik.errors;
    const touched = formik.touched;

    switch (tabName) {
      case "Observing Time":
        return !(
          (touched.observationTime && errors.observationTime) ||
          Boolean(timeData?.time)
        );
      case "temperature":
        return !(
          (touched.dryBulbAsRead && errors.dryBulbAsRead) ||
          (touched.wetBulbAsRead && errors.wetBulbAsRead) ||
          (touched.maxMinTempAsRead && errors.maxMinTempAsRead)
        );
      case "pressure":
        return !(
          (touched.barAsRead && errors.barAsRead) ||
          (touched.correctedForIndex && errors.correctedForIndex)
        );
      case "squall":
        if (!formik.values.squallConfirmed) return true;
        return !(
          (touched.squallForce && errors.squallForce) ||
          (touched.squallDirection && errors.squallDirection) ||
          (touched.squallTime && errors.squallTime)
        );
      case "visibility":
        return !(touched.horizontalVisibility && errors.horizontalVisibility);
      case "weather":
        return !(
          (touched.pastWeatherW1 && errors.pastWeatherW1) ||
          (touched.pastWeatherW2 && errors.pastWeatherW2) ||
          (touched.presentWeatherWW && errors.presentWeatherWW)
        );
      default:
        return true;
    }
  };

  // Function to validate current tab before proceeding
   const te = useTranslations('FormikError');
  const validateTab = (tabName: string) => {
    let fieldsToValidate: any[] = [];

    switch (tabName) {
      case "Observing Time":
        fieldsToValidate = ["observationTime"];
        break;
      case "temperature":
        fieldsToValidate = [
          "dryBulbAsRead",
          "wetBulbAsRead",
          "maxMinTempAsRead",
        ];
        break;
      case "pressure":
        fieldsToValidate = ["barAsRead", "correctedForIndex"];
        break;
      case "squall":
        if (formik.values.squallConfirmed) {
          fieldsToValidate = ["squallForce", "squallDirection", "squallTime"];
        }
        break;
      case "visibility":
        fieldsToValidate = ["horizontalVisibility"];
        break;
      case "weather":
        fieldsToValidate = [
          "pastWeatherW1",
          "pastWeatherW2",
          "presentWeatherWW",
        ];
        break;
    }

    // Touch all fields in the current tab to trigger validation
    const touchedFields = {};
    fieldsToValidate.forEach((field) => {
      touchedFields[field] = true;
    });
    formik.setTouched({ ...formik.touched, ...touchedFields }, true);

    // Validate only the fields in the current tab
    return fieldsToValidate.every((field) => !formik.errors[field]);
  };

  // Enhanced setActiveTab function that validates before changing tabs
  const handleTabChange = (tabName: string) => {
    // If trying to navigate away from current tab, validate it first
    if (activeTab !== tabName) {
      if (!validateTab(activeTab)) {
        toast.error(te('validationErrorTitle'), {
          description: te('validationErrorDescription'),
        });
        return;
      }
    }
    setActiveTab(tabName);
  };

  // Debug logging for formData changes
  useEffect(() => {
    console.log("Form data updated:", formik.values);
    console.log("Form errors updated:", formik.errors);
    console.log("selectedHour:", selectedHour);
  }, [formik.values, formik.errors, selectedHour]);

  useEffect(() => {
    const year = new Date().getFullYear().toString(); // e.g., "2025"
    formik.setFieldValue("year", year.slice(2)); // only "25" for last two digits
    formik.setFieldValue("stationNo", session?.user?.station?.id || "");
  }, []);

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

    // ✅ ৩-ডিজিট ফরম্যাটিং করলাম নিচে
    const formattedDpT = DpT.toString().padEnd(3, "0"); // e.g., 25 → "250"
    const formattedRH = RH === 100 ? "100" : RH.toString().padStart(3, "0"); // e.g., 65 → "065"

    // Update state
    setHygrometricData({
      dryBulb: dryBulbValue.toFixed(1),
      wetBulb: wetBulbValue.toFixed(1),
      difference: difference.toString(),
      dewPoint: formattedDpT,
      relativeHumidity: formattedRH,
    });

    // Formik values set
    formik.setFieldValue("Td", formattedDpT);
    formik.setFieldValue("relativeHumidity", formattedRH);

    toast.success("Dew point and relative humidity calculated successfully");
  };

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
      stationLevelPressure: Math.round(stationLevelPressure * 10)
        .toString()
        .padStart(5, "0"),
      // e.g., "10041"
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
      correctedSeaLevelPressure: Math.round(seaLevelPressure * 10)
        .toString()
        .padStart(5, "0"),
    };
  };

  async function handleSubmit(values: MeteorologicalEntry) {
    // Prevent duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare data
      const submissionData = {
        ...values,
        ...hygrometricData, // Include hygrometric data directly
        observingTimeId: selectedHour,
      };

      const response = await fetch("/api/first-card-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message, {
        description: `Entry #${data.dataCount} saved`,
      });

      formik.resetForm();

      setHygrometricData({
        dryBulb: "",
        wetBulb: "",
        difference: "",
        dewPoint: "",
        relativeHumidity: "",
      });

      resetStates();

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
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.handleChange(e);

    // Dew point & humidity calculation
    if (name === "dryBulbAsRead" || name === "wetBulbAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const wetBulb =
        name === "wetBulbAsRead" ? value : formik.values.wetBulbAsRead;

      if (dryBulb && wetBulb) {
        calculateDewPointAndHumidity(dryBulb, wetBulb);
      }
    }

    // Station level + Sea level pressure calculation
    if (name === "dryBulbAsRead" || name === "barAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const barAsRead = name === "barAsRead" ? value : formik.values.barAsRead;

      if (dryBulb && barAsRead) {
        const stationId = session?.user?.station?.stationId;

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
          formik.setFieldValue(
            "stationLevelPressure",
            pressureData.stationLevelPressure
          );
          formik.setFieldValue(
            "heightDifference",
            pressureData.heightDifference
          );

          const seaData = calculateSeaLevelPressure(
            dryBulb,
            pressureData.stationLevelPressure,
            stationId
          );

          if (seaData) {
            formik.setFieldValue(
              "seaLevelReduction",
              seaData.seaLevelReduction
            );
            formik.setFieldValue(
              "correctedSeaLevelPressure",
              seaData.correctedSeaLevelPressure
            );
          }
        }
      }
    }
  };

  // Add this function after the handleChange function
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only allow numeric input
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Apply specific validation based on field type
    switch (name) {
      case "dryBulbAsRead":
      case "wetBulbAsRead":
      case "maxMinTempAsRead":
        // Limit to 3 digits for temperature fields
        if (value.length <= 3) {
          formik.setFieldValue(name, value);
        }
        break;

      case "barAsRead":
      case "correctedForIndex":
        // Limit to 5 digits for pressure fields
        if (value.length <= 5) {
          formik.setFieldValue(name, value);
        }
        break;

      case "horizontalVisibility":
        // Limit to 3 digits for visibility
        if (value.length <= 3) {
          formik.setFieldValue(name, value);
        }
        break;

      case "presentWeatherWW":
        // Limit to 2 digits for present weather
        if (value.length <= 2) {
          formik.setFieldValue(name, value);
        }
        break;

      default:
        // For other numeric fields, just update the value
        formik.setFieldValue(name, value);
    }

    // Continue with other calculations as in the original handleChange
    if (name === "dryBulbAsRead" || name === "wetBulbAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const wetBulb =
        name === "wetBulbAsRead" ? value : formik.values.wetBulbAsRead;

      if (dryBulb && wetBulb) {
        calculateDewPointAndHumidity(dryBulb, wetBulb);
      }
    }

    // Add this after the dew point calculation section and replace the existing temperature correction code
    if (
      name === "dryBulbAsRead" ||
      name === "wetBulbAsRead" ||
      name === "maxMinTempAsRead"
    ) {
      // Auto-update corrected fields with the same values as as-read fields
      if (name === "dryBulbAsRead") {
        formik.setFieldValue("dryBulbCorrected", value);
      }
      if (name === "wetBulbAsRead") {
        formik.setFieldValue("wetBulbCorrected", value);
      }
      if (name === "maxMinTempAsRead") {
        formik.setFieldValue("maxMinTempCorrected", value);
      }
    }

    // Station level + Sea level pressure calculation
    if (name === "dryBulbAsRead" || name === "barAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const barAsRead = name === "barAsRead" ? value : formik.values.barAsRead;

      if (dryBulb && barAsRead) {
        const stationId = session?.user?.station?.stationId;

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
          formik.setFieldValue(
            "stationLevelPressure",
            pressureData.stationLevelPressure
          );
          formik.setFieldValue(
            "heightDifference",
            pressureData.heightDifference
          );

          console.log(timeData);

          // Get yesterday's station level pressure
          const prevStationLevelPressure =
            timeData?.yesterday?.meteorologicalEntry[0]?.stationLevelPressure;
          console.log(
            "Time Data: ",
            timeData?.yesterday?.meteorologicalEntry[0]?.stationLevelPressure
          );
          // If there's no previous pressure data, set to '000' and return
          if (!prevStationLevelPressure) {
            formik.setFieldValue("pressureChange24h", "0000");
          } else {
            // Use the pressureData directly since we just set it
            const currentPressureStr = pressureData.stationLevelPressure;

            // Convert to numbers
            const prevPressure = Number(prevStationLevelPressure);
            const currentPressure = Number(currentPressureStr);

            // Calculate the difference
            const pressureChange = prevPressure - currentPressure;

            // Format with sign and leading zeros (always 4 chars total: sign + 3 digits)
            const sign = pressureChange > 0 ? "+" : "-";
            const absValue = Math.abs(pressureChange);
            const paddedNumber = String(absValue).padStart(4, "0");
            const formattedValue = `${sign}${paddedNumber}`;

            formik.setFieldValue("pressureChange24h", formattedValue);
          }

          const seaData = calculateSeaLevelPressure(
            dryBulb,
            pressureData.stationLevelPressure,
            stationId
          );
          if (seaData) {
            formik.setFieldValue(
              "seaLevelReduction",
              seaData.seaLevelReduction
            );
            formik.setFieldValue(
              "correctedSeaLevelPressure",
              seaData.correctedSeaLevelPressure
            );
          }
        }
      }
    }
  };

  // Reset form function
  const handleReset = () => {
    // Clear all form data except station info
    const resetValues = {
      subIndicator: formik.values.subIndicator,
      // Clear other fields
      presentWeatherWW: "",
      alteredThermometer: "",
      barAsRead: "",
      correctedForIndex: "",
      heightDifference: "",
      stationLevelPressure: "",
      seaLevelReduction: "",
      correctedSeaLevelPressure: "",
      afternoonReading: "",
      pressureChange24h: "",
      dryBulbAsRead: "",
      wetBulbAsRead: "",
      maxMinTempAsRead: "",
      dryBulbCorrected: "",
      wetBulbCorrected: "",
      maxMinTempCorrected: "",
      Td: "",
      relativeHumidity: "",
      squallConfirmed: false,
      squallForce: "",
      squallDirection: "",
      squallTime: "",
      horizontalVisibility: "",
      miscMeteors: "",
      pastWeatherW1: "",
      pastWeatherW2: "",
      cloudCover: "",
      visibility: "",
    };

    formik.resetForm({ values: resetValues });

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
    setActiveTab("pressure");
  };

  // Navigation functions
  const nextTab = () => {
    // Validate current tab before proceeding
    if (!validateTab(activeTab)) {
       toast.error(te('validationErrorTitle'), {
          description: te('validationErrorDescription'),
      });
      return;
    }

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
  const isFirstTab = tabOrder.indexOf(activeTab) === 0;

  // Helper function to render error message
  const renderErrorMessage = (fieldName: string) => {
    return formik.touched[fieldName as keyof typeof formik.touched] &&
      formik.errors[fieldName as keyof typeof formik.errors] ? (
      <div className="text-red-500 text-sm mt-1 flex items-start">
        <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
        <span>{formik.errors[fieldName as keyof typeof formik.errors]}</span>
      </div>
    ) : null;
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading || firstCardError || !isHourSelected ? (
          <motion.div
            key="hour-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-white backdrop-blur-sm z-50 px-6"
          >
            <HourSelector type="first" timeInfo={timeInfo} />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={formik.handleSubmit}
            className="w-full mx-auto"
          >
            {/* <BasicInfoTab /> */}
            <BasicInfoTab
              onFieldChange={(name, value) => {
                formik.setFieldValue(name, value);
              }}
            />
            {/*Card Body */}
            <div className="relative rounded-xl">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-20 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 rounded-xl p-1 border-0 bg-transparent">
                  {Object.entries(tabStyles).map(([key, style]) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      disabled={Boolean(timeData?.time)}
                      className={cn(
                        "flex flex-col items-center justify-center border border-gray-300 text-xs sm:text-sm px-2 py-1 md:py-2",
                        {
                          [style.tab]: activeTab === key,
                          "!border-red-500 !text-red-700":
                            !isTabValid(key) && formik.submitCount > 0,
                        }
                      )}
                      onClick={(e) => {
                        if (activeTab !== key && !validateTab(activeTab)) {
                          e.preventDefault();
                          toast.error(
                            te('validationErrorTitle'),
                            {
                              description:
                                te('validationErrorDescription'),
                            }
                          );
                          return false;
                        }
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {style.icon}
                        <span className="hidden sm:inline">
                          {tabs(key)}
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
                        <BarChart3 className="mr-2" /> {t('barPressure.title')}
                      </h3>
                    </div>
                    <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="subIndicator">{t('barPressure.cardIndicator')}</Label>
                        <Input
                          id="subIndicator"
                          name="subIndicator"
                          value={formik.values.subIndicator || ""}
                          onChange={handleChange}
                          readOnly
                          className="border-slate-600 bg-gray-100 cursor-not-allowed text-gray-700 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="attachedThermometer">
                          {t("barPressure.attachedThermometer")}
                        </Label>
                        <Input
                          id="alteredThermometer"
                          name="alteredThermometer"
                          value={formik.values.alteredThermometer || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="barAsRead">{t("barPressure.barAsRead")}</Label>
                        <Input
                          id="barAsRead"
                          name="barAsRead"
                          value={formik.values.barAsRead || ""}
                          onChange={handleNumericInput}
                          className={cn(
                            "border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30",
                            {
                              "border-red-500":
                                formik.touched.barAsRead &&
                                formik.errors.barAsRead,
                            }
                          )}
                        />
                        {renderErrorMessage("barAsRead")}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="correctedForIndex">
                         {t('barPressure.correctedForIndex')}
                        </Label>
                        <Input
                          id="correctedForIndex"
                          name="correctedForIndex"
                          value={formik.values.correctedForIndex || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="heightDifference">
                          {t('barPressure.heightDiffCorrection')}
                        </Label>
                        <Input
                          id="heightDifference"
                          name="heightDifference"
                          value={formik.values.heightDifference || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stationLevelPressure">
                          {t('barPressure.stationLevelPressure')}
                        </Label>
                        <Input
                          id="stationLevelPressure"
                          name="stationLevelPressure"
                          value={formik.values.stationLevelPressure || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seaLevelReduction">
                         {t('barPressure.seaLevelReductionConstant')}
                        </Label>
                        <Input
                          id="seaLevelReduction"
                          name="seaLevelReduction"
                          value={formik.values.seaLevelReduction || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="correctedSeaLevelPressure">
                          {t('barPressure.seaLevelPressure')}
                        </Label>
                        <Input
                          id="correctedSeaLevelPressure"
                          name="correctedSeaLevelPressure"
                          value={formik.values.correctedSeaLevelPressure || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="afternoonReading">
                          {t('barPressure.altimeterSetting')}
                        </Label>
                        <Input
                          id="afternoonReading"
                          name="afternoonReading"
                          value={formik.values.afternoonReading || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pressureChange24h">
                          {t('barPressure.twentyFourHourChange')}
                        </Label>
                        <Input
                          id="pressureChange24h"
                          name="pressureChange24h"
                          value={formik.values.pressureChange24h || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                          readOnly
                        />
                      </div>
                    </CardContent>
                    {/* <CardFooter className="flex justify-end">
                      <Button
                        type="button"
                        onClick={nextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {t("buttons.next")} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter> */}
                     <CardFooter className="flex justify-between p-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevTab}
                        disabled={isFirstTab}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> {t('buttons.previous')}
                      </Button>
                      <Button
                        type="button"
                        onClick={nextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                         {t('buttons.next')} <ChevronRight className="ml-2 h-4 w-4" />
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
                    className={cn(
                      "overflow-hidden",
                      tabStyles.temperature.card
                    )}
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Thermometer className="mr-2" /> {t('temperatureSection.title')}
                      </h3>
                    </div>
                    <CardContent className="pt-6">
                      <Tabs defaultValue="temperature" className="w-full">
                        {/* Temperature Values */}
                        <TabsContent value="temperature" className="mt-4">
                          <Tabs defaultValue="as-read" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 gap-5 bg-blue-50/50 rounded-lg">
                              <TabsTrigger
                                value="as-read"
                                className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800 border border-blue-300"
                              >
                               {t('temperatureSection.asRead')}
                              </TabsTrigger>
                              <TabsTrigger
                                value="corrected"
                                className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800 border border-blue-300"
                              >
                               {t("temperatureSection.corrected")}
                              </TabsTrigger>
                            </TabsList>

                            {/* As Read Temperature Values */}
                            <TabsContent value="as-read" className="mt-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="dryBulbAsRead">
                                   {t('temperatureSection.dryBulb')}
                                  </Label>
                                  <Input
                                    id="dryBulbAsRead"
                                    name="dryBulbAsRead"
                                    value={formik.values.dryBulbAsRead || ""}
                                    onChange={handleNumericInput}
                                    onBlur={formik.handleBlur}
                                    className={cn(
                                      "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                                      {
                                        "border-red-500":
                                          formik.touched.dryBulbAsRead &&
                                          formik.errors.dryBulbAsRead,
                                      }
                                    )}
                                  />
                                  {renderErrorMessage("dryBulbAsRead")}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="wetBulbAsRead">
                                   {t("temperatureSection.wetBulb")}
                                  </Label>
                                  <Input
                                    id="wetBulbAsRead"
                                    name="wetBulbAsRead"
                                    value={formik.values.wetBulbAsRead || ""}
                                    onChange={handleNumericInput}
                                    onBlur={formik.handleBlur}
                                    className={cn(
                                      "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                                      {
                                        "border-red-500":
                                          formik.touched.wetBulbAsRead &&
                                          formik.errors.wetBulbAsRead,
                                      }
                                    )}
                                  />
                                  {renderErrorMessage("wetBulbAsRead")}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="maxMinTempAsRead">
                                   {t('temperatureSection.maxMin')}
                                  </Label>
                                  <Input
                                    id="maxMinTempAsRead"
                                    name="maxMinTempAsRead"
                                    value={formik.values.maxMinTempAsRead || ""}
                                    onChange={handleNumericInput}
                                    onBlur={formik.handleBlur}
                                    className={cn(
                                      "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                                      {
                                        "border-red-500":
                                          formik.touched.maxMinTempAsRead &&
                                          formik.errors.maxMinTempAsRead,
                                      }
                                    )}
                                  />
                                  {renderErrorMessage("maxMinTempAsRead")}
                                </div>
                              </div>
                            </TabsContent>

                            {/* Corrected Temperature Values */}
                            <TabsContent value="corrected" className="mt-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="dryBulbCorrected">
                                    {t('temperatureSection.dryBulb')}
                                  </Label>
                                  <Input
                                    id="dryBulbCorrected"
                                    name="dryBulbCorrected"
                                    value={formik.values.dryBulbCorrected || ""}
                                    onChange={handleNumericInput}
                                    className="transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="wetBulbCorrected">
                                    {t("temperatureSection.wetBulb")}
                                  </Label>
                                  <Input
                                    id="wetBulbCorrected"
                                    name="wetBulbCorrected"
                                    value={formik.values.wetBulbCorrected || ""}
                                    onChange={handleNumericInput}
                                    className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="maxMinTempCorrected">
                                    {t('temperatureSection.maxMin')}
                                  </Label>
                                  <Input
                                    id="maxMinTempCorrected"
                                    name="maxMinTempCorrected"
                                    value={
                                      formik.values.maxMinTempCorrected || ""
                                    }
                                    onChange={handleNumericInput}
                                    className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                  />
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>

                          <div className="mt-6 space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                              <h3 className="text-lg font-semibold flex items-center">
                                <Thermometer className="mr-2" /> {t('dewPointHumidity.title')}
                              </h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="Td">
                                 {t('dewPointHumidity.dewPoint')}
                                </Label>
                                <Input
                                  id="Td"
                                  name="Td"
                                  value={formik.values.Td || ""}
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
                                 {t('dewPointHumidity.relativeHumidity')}
                                </Label>
                                <Input
                                  id="relativeHumidity"
                                  name="relativeHumidity"
                                  value={formik.values.relativeHumidity || ""}
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
                    {/* <CardFooter className="flex justify-between p-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevTab}
                        disabled={isFirstTab}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> {t('buttons.previous')}
                      </Button>
                      <Button
                        type="button"
                        onClick={nextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                         {t('buttons.next')} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter> */}
                      <CardFooter className="flex justify-end">
                      <Button
                        type="button"
                        onClick={nextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {t("buttons.next")} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Squall Tab */}
                <TabsContent
                  value="squall"
                  className="mt-6 transition-all duration-500"
                >
                  <Card
                    className={cn("overflow-hidden", tabStyles.squall.card)}
                  >
                    <div className="p-4 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Wind className="mr-2" /> {t('squallMeasurements.title')}
                      </h3>
                    </div>
                    <CardContent className="pt-6 space-y-4">
                      {formik.values.squallConfirmed === undefined ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-amber-800 font-medium mb-3">
                            Are you sure you want to fill up squall
                            measurements?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-amber-500 text-amber-700 hover:bg-amber-50"
                              onClick={() => {
                                formik.setFieldValue("squallConfirmed", false);
                                formik.setFieldValue("squallForce", "");
                                formik.setFieldValue("squallDirection", "");
                                formik.setFieldValue("squallTime", "");
                                nextTab();
                              }}
                            >
                              No, Skip
                            </Button>
                            <Button
                              type="button"
                              className="bg-amber-500 hover:bg-amber-600"
                              onClick={() => {
                                formik.setFieldValue("squallConfirmed", true);
                              }}
                            >
                              Yes, Continue
                            </Button>
                          </div>
                        </div>
                      ) : formik.values.squallConfirmed ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="squallForce">{t('squallMeasurements.force')}</Label>
                            <Input
                              id="squallForce"
                              name="squallForce"
                              value={formik.values.squallForce || ""}
                              onChange={handleChange}
                              onBlur={formik.handleBlur}
                              className={cn(
                                "border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30",
                                {
                                  "border-red-500":
                                    formik.touched.squallForce &&
                                    formik.errors.squallForce,
                                }
                              )}
                            />
                            {renderErrorMessage("squallForce")}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="squallDirection">
                              {t('squallMeasurements.direction')}
                            </Label>
                            <Input
                              id="squallDirection"
                              name="squallDirection"
                              type="number"
                              min="0"
                              max="360"
                              value={formik.values.squallDirection || ""}
                              onChange={handleChange}
                              onBlur={formik.handleBlur}
                              className={cn(
                                "border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30",
                                {
                                  "border-red-500":
                                    formik.touched.squallDirection &&
                                    formik.errors.squallDirection,
                                }
                              )}
                            />
                            {renderErrorMessage("squallDirection")}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="squallTime">{t('squallMeasurements.time')}</Label>
                            <select
                              id="squallTime"
                              name="squallTime"
                              value={formik.values.squallTime || ""}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  "squallTime",
                                  e.target.value
                                )
                              }
                              onBlur={formik.handleBlur}
                              className={cn(
                                "w-full border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-fuchsia-500 focus:ring-fuchsia-500/30",
                                {
                                  "border-red-500":
                                    formik.touched.squallTime &&
                                    formik.errors.squallTime,
                                }
                              )}
                            >
                              <option value="">-- {t('squallMeasurements.selectTime')} --</option>
                              <option value="0">
                                0 → 0 to ½ hour before observation
                              </option>
                              <option value="1">
                                1 → ½ to 1 hour before observation
                              </option>
                              <option value="2">
                                2 → 1 to 1¼ hour before observation
                              </option>
                              <option value="3">
                                3 → 1¼ to 2 hour before observation
                              </option>
                              <option value="4">
                                4 → 2 to 2½ hour before observation
                              </option>
                              <option value="5">
                                5 → 2½ to 3 hour before observation
                              </option>
                              <option value="6">
                                6 → 3 to 4 hour before observation
                              </option>
                              <option value="7">
                                7 → 4 to 5 hour before observation
                              </option>
                              <option value="8">
                                8 → 5 to 6 hour before observation
                              </option>
                              <option value="9">
                                9 → More than 6 hour before observation
                              </option>
                            </select>
                            {renderErrorMessage("squallTime")}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center">
                          <p className="text-slate-600">
                           {t("squallMeasurements.squallMeasurementsSkipped")}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              formik.setFieldValue("squallConfirmed", true);
                            }}
                          >
                           {t("squallMeasurements.fillMeasurements")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between p-6">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> {t('buttons.previous')}
                      </Button>
                      <Button
                        type="button"
                        onClick={nextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {t('buttons.next')} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* VV Tab */}
                <TabsContent
                  value="visibility"
                  className="mt-6 transition-all duration-500"
                >
                  <Card
                    className={cn("overflow-hidden", tabStyles["visibility"].card)}
                  >
                    <div className="p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Eye className="mr-2" /> {t('visibilityMeasurements.title')}
                      </h3>
                    </div>
                    <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="horizontalVisibility">
                         {t('visibilityMeasurements.horizontalVisibility')}
                        </Label>
                        <Input
                          id="horizontalVisibility"
                          name="horizontalVisibility"
                          value={formik.values.horizontalVisibility || ""}
                          onChange={handleNumericInput}
                          onBlur={formik.handleBlur}
                          className={cn(
                            "border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30",
                            {
                              "border-red-500":
                                formik.touched.horizontalVisibility &&
                                formik.errors.horizontalVisibility,
                            }
                          )}
                        />
                        {renderErrorMessage("horizontalVisibility")}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-6">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> {t('buttons.previous')}
                      </Button>
                      <Button
                        type="button"
                        onClick={nextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                       {t('buttons.next')} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Mice Meteors */}
                <TabsContent
                  value="meteors"
                  className="mt-6 transition-all duration-500"
                >
                  <Card
                    className={cn("overflow-hidden", tabStyles["meteors"].card)}
                  >
                    <div className="p-4 bg-gradient-to-r from-emerald-100 to-emerald-200 text-blue-800">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Thermometer className="mr-2" /> {t('miscMeteors.title')}
                      </h3>
                    </div>
                    <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="miscMeteors">{t('miscMeteors.inputLabel')}</Label>
                        <Input
                          id="miscMeteors"
                          name="miscMeteors"
                          value={formik.values.miscMeteors || ""}
                          onChange={handleChange}
                          className="border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-6">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> {t('buttons.previous')}
                      </Button>
                      <Button
                        type="button"
                        onClick={nextTab}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {t('buttons.next')} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Weather Tab */}
                <TabsContent
                  value="weather"
                  className="mt-6 transition-all duration-500"
                >
                  <Card
                    className={cn("overflow-hidden", tabStyles.weather.card)}
                  >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-cyan-200 to-cyan-300 text-cyan-800">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Cloud className="mr-2" /> {t('weatherConditions.title')}
                      </h3>
                    </div>

                    {/* Form Fields */}
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                      {/* Past Weather W1 */}
                      <div className="space-y-2">
                        <Label htmlFor="pastWeatherW1">{t('weatherConditions.pastWeatherW1.label')}</Label>
                        <Input
                          id="pastWeatherW1"
                          name="pastWeatherW1"
                          placeholder={t('weatherConditions.pastWeatherW1.placeholder')}
                          value={formik.values.pastWeatherW1 || ""}
                          onChange={handleChange}
                          onBlur={formik.handleBlur}
                          className={cn(
                            "border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30",
                            {
                              "border-red-500":
                                formik.touched.pastWeatherW1 &&
                                formik.errors.pastWeatherW1,
                            }
                          )}
                        />
                        {renderErrorMessage("pastWeatherW1")}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('weatherConditions.pastWeatherW1.description')}
                        </p>
                      </div>

                      {/* Past Weather W2 */}
                      <div className="space-y-2">
                        <Label htmlFor="pastWeatherW2">{t('weatherConditions.pastWeatherW2.label')}</Label>
                        <Input
                          id="pastWeatherW2"
                          name="pastWeatherW2"
                          placeholder={t('weatherConditions.pastWeatherW2.placeholder')}
                          value={formik.values.pastWeatherW2 || ""}
                          onChange={handleChange}
                          onBlur={formik.handleBlur}
                          className={cn(
                            "border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30",
                            {
                              "border-red-500":
                                formik.touched.pastWeatherW2 &&
                                formik.errors.pastWeatherW2,
                            }
                          )}
                        />
                        {renderErrorMessage("pastWeatherW2")}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('weatherConditions.pastWeatherW2.description')}
                        </p>
                      </div>

                      {/* Present Weather WW (full width on small) */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="presentWeatherWW">
                          {t('weatherConditions.presentWeatherWW.label')}
                        </Label>
                        <Input
                          id="presentWeatherWW"
                          name="presentWeatherWW"
                          placeholder= {t('weatherConditions.presentWeatherWW.placeholder')}
                          value={formik.values.presentWeatherWW || ""}
                          onChange={handleNumericInput}
                          onBlur={formik.handleBlur}
                          className={cn("border-slate-600 text-gray-700", {
                            "border-red-500":
                              formik.touched.presentWeatherWW &&
                              formik.errors.presentWeatherWW,
                          })}
                        />
                        {renderErrorMessage("presentWeatherWW")}
                        <p className="text-xs text-muted-foreground mt-1">
                         {t('weatherConditions.presentWeatherWW.description')}
                        </p>
                      </div>
                    </CardContent>

                    {/* Footer */}
                    <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 p-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevTab}
                        className="w-full sm:w-auto"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> {t('buttons.previous')}
                      </Button>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto border-slate-600 hover:bg-slate-100 transition-all duration-300"
                          onClick={handleReset}
                        >
                          {t('buttons.reset')}
                        </Button>
                        <Button
                          type="submit"
                          className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Saving..." : t("buttons.submit")}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}
