"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTimeCheck } from "@/hooks/useTimeCheck";
import {
  Thermometer,
  Wind,
  Eye,
  Cloud,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { hygrometricTable } from "@/data/hygrometric-table"; // Import the hygrometric table data

import { useSession } from "@/lib/auth-client";
import { stationDataMap } from "@/data/station-data-map";
import BasicInfoTab from "@/components/basic-info-tab";
import { useHour } from "@/contexts/hourContext";
import { useFormik } from "formik";
import * as Yup from "yup";

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
  stationNo?: string;
  year?: string;
  cloudCover?: string;
  visibility?: string;
  // Add any other fields you use in formData here
};

// Validation schemas for each tab
const observingTimeSchema = Yup.object({
  observationTime: Yup.string().required("সময় অবশ্যই নির্বাচন করতে হবে"),
});

const temperatureSchema = Yup.object({
  dryBulbAsRead: Yup.string()
    .required("Dry-bulb অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
  wetBulbAsRead: Yup.string()
    .required("Wet-bulb অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
  maxMinTempAsRead: Yup.string()
    .required("MAX/MIN অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
});

const pressureSchema = Yup.object({
  barAsRead: Yup.string()
    .required("Bar As Read অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10142 for 1014.2 hPa)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
  correctedForIndex: Yup.string()
    .required("Corrected for Index অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10142 for 1014.2 hPa)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
});

const squallSchema = Yup.object({
  // Conditional validation for squall fields
  squallForce: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Force অবশ্যই পূরণ করতে হবে")
        .test("is-numeric", "Only numeric values allowed", (value) =>
          /^\d+$/.test(value || "")
        ),
    otherwise: (schema) => schema,
  }),
  squallDirection: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Direction অবশ্যই পূরণ করতে হবে")
        .test("is-numeric", "Only numeric values allowed", (value) =>
          /^\d+$/.test(value || "")
        ),
    otherwise: (schema) => schema,
  }),
  squallTime: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) => schema.required("Squall Time অবশ্যই পূরণ করতে হবে"),
    otherwise: (schema) => schema,
  }),
});

const visibilitySchema = Yup.object({
  horizontalVisibility: Yup.string()
    .required("Horizontal Visibility অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 050, 999)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
});

const weatherSchema = Yup.object({
  pastWeatherW1: Yup.string()
    .required("Past Weather (W1) অবশ্যই পূরণ করতে হবে")
    .matches(/^[0-9]$/, "Past Weather (W1) শুধুমাত্র 0-9 সংখ্যা হতে হবে"),
  pastWeatherW2: Yup.string()
    .required("Past Weather (W2) অবশ্যই পূরণ করতে হবে")
    .matches(/^[0-9]$/, "Past Weather (W2) শুধুমাত্র 0-9 সংখ্যা হতে হবে"),
  presentWeatherWW: Yup.string()
    .required("Present Weather অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{2}$/, "Must be exactly 2 digits (e.g., 01, 23, 99)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
});

// Combined schema for the entire form
const validationSchema = Yup.object({
  ...observingTimeSchema.fields,
  ...temperatureSchema.fields,
  ...pressureSchema.fields,
  ...squallSchema.fields,
  ...visibilitySchema.fields,
  ...weatherSchema.fields,
});

export function MeteorologicalDataForm({ onDataSubmitted }) {
  const [activeTab, setActiveTab] = useState("Observing Time");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { time, error: timeError } = useTimeCheck();
  const {
    selectedHour,
    setSelectedHour,
    error,
    isLoading,
    clearError,
    timeData,
  } = useHour();
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
    "Observing Time",
    "temperature",
    "pressure",
    "squall",
    "V.V",
    "weather",
  ];

  // Tab styles with gradients and more vibrant colors
  const tabStyles = {
    "Observing Time": {
      tab: "border border-fuchsia-500 px-4 py-3 !bg-fuchsia-50 text-fuchsia-800 hover:opacity-90 shadow-sm shadow-fuchsia-500/50",
      card: "bg-gradient-to-br from-fuchsia-50 to-white border-l-4 border-fuchsia-200 shadow-sm",
      icon: <Clock className="size-5 mr-2" />,
    },
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
    "V.V": {
      tab: "border border-orange-500 px-4 py-3 !bg-orange-50 text-orange-800 hover:opacity-90 shadow-sm shadow-orange-500/50",
      card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
      icon: <Eye className="size-5 mr-2" />,
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
  const isTabValid = (tabName) => {
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
      case "V.V":
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
  const validateTab = (tabName) => {
    let fieldsToValidate = [];

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
      case "V.V":
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

  // Debug logging for formData changes
  useEffect(() => {
    console.log("Form data updated:", formik.values);
  }, [formik.values]);

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

    // Update state
    setHygrometricData({
      dryBulb: dryBulbValue.toFixed(1),
      wetBulb: wetBulbValue.toFixed(1),
      difference: difference.toString(),
      dewPoint: DpT.toString(),
      relativeHumidity: RH.toString(),
    });

    formik.setFieldValue("Td", DpT.toString());
    formik.setFieldValue("relativeHumidity", RH.toString());

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

  async function handleSubmit(values) {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save data");
      }

      const result = await response.json();

      toast.success("Data saved successfully!", {
        description: `Entry #${result.dataCount} saved`,
      });

      // Reset only measurement fields (preserves station info)
      const resetValues = {
        stationNo: values.stationNo,
        year: values.year,
        subIndicator: values.subIndicator,
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
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSelectChange = (name: string, value: string) => {
    formik.setFieldValue(name, value);
  };

  // Handle segmented input (for multi-box inputs like station number, year, etc.)
  const handleSegmentedInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    refs: React.RefObject<HTMLInputElement>[],
    key: string
  ) => {
    const value = e.target.value.slice(0, 1); // ensure single digit
    const updated = (formik.values[key] || "").split("");
    updated[index] = value;

    formik.setFieldValue(key, updated.join(""));

    // Auto-focus next input
    if (value && refs[index + 1]) {
      refs[index + 1]?.current?.focus();
    }
  };

  // Observing Time
  const handleHourChange = (value: string) => {
    if (!value) {
      return;
    }
    clearError();
    setSelectedHour(value);
    formik.setFieldValue("observationTime", value);
  };

  // Reset form function
  const handleReset = () => {
    // Clear all form data except station info
    const resetValues = {
      stationNo: formik.values.stationNo,
      year: formik.values.year,
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
    setActiveTab("temperature");
  };

  // Navigation functions
  const nextTab = () => {
    // Validate current tab before proceeding
    if (!validateTab(activeTab)) {
      toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন", {
        description:
          "পরবর্তী ট্যাবে যাওয়ার আগে বর্তমান ট্যাবের সকল তথ্য পূরণ করুন",
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
  const isLastTab = tabOrder.indexOf(activeTab) === tabOrder.length - 1;
  const isFirstTab = tabOrder.indexOf(activeTab) === 0;

  // Helper function to render error message
  const renderErrorMessage = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName] ? (
      <div className="text-red-500 text-sm mt-1 flex items-start">
        <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
        <span>{formik.errors[fieldName]}</span>
      </div>
    ) : null;
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="w-full mx-auto">
        {/* <BasicInfoTab /> */}
        <BasicInfoTab
          onFieldChange={(name, value) => {
            formik.setFieldValue(name, value);
          }}
        />
        {/*Card Body */}
        <div className="relative rounded-xl">
          {!time?.isPassed ||
            (!time && (
              <div className="absolute inset-0 bg-amber-50/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-xl ring-2 ring-amber-200 ring-offset-4">
                <div className="bg-white py-4 px-6 rounded-lg shadow-lg text-center border-2 border-amber-300">
                  <Clock className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                  <h3 className="text-lg font-medium text-amber-800">
                    3 Hours has not passed yet
                  </h3>
                  <p className="text-sm text-amber-600 mt-1">
                    Please wait a little longer
                  </p>
                </div>
              </div>
            ))}
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
                  disabled={Boolean(timeData?.time)}
                  className={cn("border border-gray-300", {
                    [style.tab]: activeTab === key,
                    "!border-red-500 !text-red-700":
                      !isTabValid(key) && formik.submitCount > 0,
                  })}
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

            {/* Indicators Tab */}
            <TabsContent
              value="Observing Time"
              className="mt-6 transition-all duration-500"
            >
              <Card
                className={cn(
                  "overflow-hidden",
                  tabStyles["Observing Time"].card
                )}
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
                      value={selectedHour}
                      onChange={(e) => handleHourChange(e.target.value)}
                      required
                      className={cn(
                        "w-full border rounded-md px-3 py-2 focus:outline-none",
                        {
                          "border-red-500":
                            (formik.touched.observationTime &&
                              formik.errors.observationTime) ||
                            timeData?.time,
                          "border-emerald-500":
                            !timeData?.time &&
                            formik.values.observationTime &&
                            !formik.errors.observationTime,
                        }
                      )}
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
                    {timeData?.time && (
                      <p className="text-red-500">Time Already Exist</p>
                    )}
                    {renderErrorMessage("observationTime")}
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
                    disabled={Boolean(timeData?.time)}
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Bar Pressure Tab */}
            <TabsContent
              value="pressure"
              className="mt-6 transition-all duration-500"
            >
              <Card className={cn("overflow-hidden", tabStyles.pressure.card)}>
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
                      value={formik.values.subIndicator || ""}
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
                      value={formik.values.alteredThermometer || ""}
                      onChange={handleChange}
                      className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barAsRead">Bar As Read(hPa)</Label>
                    <Input
                      id="barAsRead"
                      name="barAsRead"
                      value={formik.values.barAsRead || ""}
                      onChange={handleNumericInput}
                      className={cn(
                        "border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30",
                        {
                          "border-red-500":
                            formik.touched.barAsRead && formik.errors.barAsRead,
                        }
                      )}
                    />
                    {renderErrorMessage("barAsRead")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correctedForIndex">
                      Corrected for Index Temp-gravity(hPa)
                    </Label>
                    <Input
                      id="correctedForIndex"
                      name="correctedForIndex"
                      value={formik.values.correctedForIndex || ""}
                      onChange={handleNumericInput}
                      className={cn(
                        "border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30",
                        {
                          "border-red-500":
                            formik.touched.correctedForIndex &&
                            formik.errors.correctedForIndex,
                        }
                      )}
                    />
                    {renderErrorMessage("correctedForIndex")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heightDifference">
                      Height Difference Correction(hPa)
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
                      Station Level Pressure (P.P.P.P.hpa)
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
                      Sea Level Reduction Constant
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
                      Sea-Level Pressure(PPPP)hpa
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
                      Altimeter setting(QNH)
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
                      24-Hour Pressure Change
                    </Label>
                    <Input
                      id="pressureChange24h"
                      name="pressureChange24h"
                      value={formik.values.pressureChange24h || ""}
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
                                Wet-bulb (°C)
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
                                MAX/MIN (°C)
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
                                Dry-bulb (°C)
                              </Label>
                              <Input
                                id="dryBulbCorrected"
                                name="dryBulbCorrected"
                                value={formik.values.dryBulbCorrected || ""}
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
                                value={formik.values.wetBulbCorrected || ""}
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
                                value={formik.values.maxMinTempCorrected || ""}
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
                              Relative Humidity (%)
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
                  {formik.values.squallConfirmed === undefined ? (
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
                        <Label htmlFor="squallForce">Force (KTS)</Label>
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
                        <Label htmlFor="squallDirection">Direction (°d)</Label>
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
                        <Label htmlFor="squallTime">
                          GG: Time of Observation (UTC)
                        </Label>
                        <select
                          id="squallTime"
                          name="squallTime"
                          value={formik.values.squallTime || ""}
                          onChange={(e) =>
                            formik.setFieldValue("squallTime", e.target.value)
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
                        {renderErrorMessage("squallTime")}
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
                          formik.setFieldValue("squallConfirmed", true);
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

                  <div className="space-y-2">
                    <Label htmlFor="miscMeteors">Misc Meteors(Code)</Label>
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
                <CardContent className="grid grid-cols-2 gap-4 pt-6 space-y-4">
                  {/* Past Weather W1 */}
                  <div className="space-y-2">
                    <Label htmlFor="pastWeatherW1">Past Weather (W1)</Label>
                    <Input
                      id="pastWeatherW1"
                      name="pastWeatherW1"
                      placeholder="Enter past weather code (0-9)"
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
                      Weather code for the first part of the observation period
                    </p>
                  </div>

                  {/* Past Weather W2 */}
                  <div className="space-y-2">
                    <Label htmlFor="pastWeatherW2">Past Weather (W2)</Label>
                    <Input
                      id="pastWeatherW2"
                      name="pastWeatherW2"
                      placeholder="Enter past weather code (0-9)"
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
                      Weather code for the second part of the observation period
                    </p>
                  </div>

                  {/* Present Weather WW */}
                  <div className="space-y-2">
                    <Label htmlFor="presentWeatherWW">
                      Present Weather (WW)
                    </Label>
                    <Input
                      id="presentWeatherWW"
                      name="presentWeatherWW"
                      placeholder="Enter present weather"
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
                      Current weather conditions at time of observation
                    </p>
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
        </div>
      </form>
    </>
  );
}
