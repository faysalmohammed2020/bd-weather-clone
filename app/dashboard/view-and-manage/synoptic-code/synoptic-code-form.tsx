"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import SynopticMeasurementsTab from "./synoptic-components/synoptic-measurement";
import { toast } from "sonner";
import { saveSynopticCodeData } from "@/app/actions/synoptic-code-data";
import { useRouter } from "next/navigation";
import BasicInfoTab from "@/components/basic-info-tab";

// Define validation schema using Yup
const validationSchema = Yup.object({
  dataType: Yup.string().max(2, "Maximum 2 characters"),
  stationNo: Yup.string().max(5, "Maximum 5 characters"),
  year: Yup.string().max(2, "Maximum 2 characters"),
  month: Yup.string().max(2, "Maximum 2 characters"),
  day: Yup.string().max(2, "Maximum 2 characters"),

  measurements: Yup.array()
    .of(Yup.string().required("Required")) // All measurements must be filled
    .min(21, "Must provide 21 measurements")
    .max(21, "Cannot exceed 21 measurements")
    .required("Measurements are required"),
  weatherRemark: Yup.string().required("Weather remark is required"),
});

export default function SynopticCodeForm() {
  const [submitting, setSubmitting] = useState(false);
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
    measurements: Array(21).fill(""),
    weatherRemark: "",
  };

  const router = useRouter();

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      setSubmitting(true);
      const result = await saveSynopticCodeData(values);
      setSubmitResult(result);

      if (result.success) {
        toast.success("✅ Weather data saved successfully");

        // Reset the form
        resetForm();

        // Redirect to dashboard after short delay (optional)
        setTimeout(() => {
          router.push("/dashboard"); // change this path as needed
        }, 1000);
      } else {
        toast.error(result.message || "❌ Failed to save weather data");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("🚨 An unexpected error occurred while submitting the form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    
          <Card className="shadow-lg border-t-4 border-t-blue-500">
            <CardContent className="pt-6">
              <div>
                <div className="border-2 border-blue-100 rounded-md p-4 bg-blue-50/30">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Basic Information</h3>
                  <BasicInfoTab />
                </div>
                
                <div className="border-2 border-green-100 rounded-md p-4 bg-green-50/30">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Measurements</h3>
                  <SynopticMeasurementsTab />
                </div>
              </div>
            </CardContent>

          
          </Card>
        
  );
}