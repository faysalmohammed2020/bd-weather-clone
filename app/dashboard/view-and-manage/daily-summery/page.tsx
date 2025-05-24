"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Card, CardContent } from "@/components/ui/card";
import MeasurementsTab from "./tabs/measurements-tab";
import { useState } from "react";

import { toast } from "sonner";
import { weatherFormSchema } from "./validation-schema";
import { useRouter } from "next/navigation";

// Define validation schema using Yup
const validationSchema = Yup.object({
  dataType: Yup.string().max(2, "Maximum 2 characters"),
  stationNo: Yup.string().max(5, "Maximum 5 characters"),
  year: Yup.string().max(2, "Maximum 2 characters"),
  month: Yup.string().max(2, "Maximum 2 characters"),
  day: Yup.string().max(2, "Maximum 2 characters"),
  measurements: Yup.array().of(Yup.string().nullable()),
  meteorCodes: Yup.array().of(Yup.string().nullable()),
  characterCodes: Yup.object(),
  windDirection: Yup.string().nullable(),
  windTime: Yup.string().nullable(),
});

export default function WeatherDataForm() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [submitResult, setSubmitResult] = useState<{
    success?: boolean;
    message?: string;
    filename?: string;
  } | null>(null);

  const initialValues = {
    dataType: "",
    stationNo: "",
    year: "",
    month: "",
    day: "",
    measurements: Array(16).fill(""),
    meteorCodes: Array(8).fill(""),
    characterCodes: {},
    windDirection: "",
    windTime: "",
  };


  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      setSubmitting(true);

      const {
        dataType,
        stationNo,
        year,
        month,
        day,
        measurements,
        windDirection,
        characterCodes,
      } = values;

      const payload = {
        dataType,
        stationNo,
        year,
        month,
        day,

        avStationPressure: measurements?.[0] || "",
        avSeaLevelPressure: measurements?.[1] || "",
        avDryBulbTemperature: measurements?.[2] || "",
        avWetBulbTemperature: measurements?.[3] || "",
        maxTemperature: measurements?.[4] || "",
        minTemperature: measurements?.[5] || "",
        totalPrecipitation: measurements?.[6] || "",
        avDewPointTemperature: measurements?.[7] || "",
        avRelativeHumidity: measurements?.[8] || "",
        windSpeed: measurements?.[9] || "",
        windDirectionCode: windDirection || "",
        maxWindSpeed: measurements?.[11] || "",
        maxWindDirection: measurements?.[12] || "",
        avTotalCloud: measurements?.[13] || "",
        lowestVisibility: measurements?.[14] || "",
        totalRainDuration: measurements?.[15] || "",
      };

      const response = await fetch("/api/daily-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(errorText || "❌ Failed to save weather data");
        return;
      }

      toast.success("✅ Weather data saved successfully");
      resetForm();
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("🚨 An unexpected error occurred while submitting the form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={weatherFormSchema}
      onSubmit={(values, actions) => handleSubmit(values, actions)}
    >
      {({ values, errors, touched, isSubmitting }) => (
        <Form>
          <Card className="shadow-lg border-t-4 border-t-blue-500">
            <CardContent className="pt-6">
              <div className="mt-0 border-2 border-green-100 rounded-md p-4 bg-green-50/30">
                <MeasurementsTab />
              </div>
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
}
