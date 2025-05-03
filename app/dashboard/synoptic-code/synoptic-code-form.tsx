"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../daily-summery/tabs/tabs-summery";
import BasicInfoTab from "../daily-summery/tabs/basic-info-tab";
import SynopticMeasurementsTab from "./synoptic-components/synoptic-measurement";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveSynopticCodeData } from "@/app/actions/synoptic-code-data";
import { useRouter } from "next/navigation";

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

export default function WeatherDataForm() {
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
  const [activeStep, setActiveStep] = useState<"basic-info" | "measurements">(
    "basic-info"
  );

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
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => handleSubmit(values, actions)}
    >
      {({ values, errors, touched, isSubmitting, resetForm }) => (
        <Form>
          <Card className="shadow-lg border-t-4 border-t-blue-500">
            {/* <Tabs defaultValue="basic-info" className="w-full"> */}
            <Tabs
              value={activeStep}
              onValueChange={(value) =>
                setActiveStep(value as "basic-info" | "measurements")
              }
              className="w-full"
            >
              <TabsList className="w-full mx-6 p-0 h-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <TabsTrigger
                  value="basic-info"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-none flex-1 py-3 text-sm font-medium"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="measurements"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-none flex-1 py-3 text-sm font-medium"
                >
                  Measurements
                </TabsTrigger>
              </TabsList>

              <CardContent className="pt-6">
                <TabsContent
                  value="basic-info"
                  className="mt-0 border-2 border-blue-100 rounded-md p-4 bg-blue-50/30"
                >
                  <BasicInfoTab />
                </TabsContent>

                <TabsContent
                  value="measurements"
                  className="mt-0 border-2 border-green-100 rounded-md p-4 bg-green-50/30"
                >
                  <SynopticMeasurementsTab />
                </TabsContent>
              </CardContent>

              <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  {Object.keys(errors).length > 0 && (
                    <p className="text-sm text-destructive">
                      Please enter the field values before submitting
                    </p>
                  )}

                  {submitResult?.success && (
                    <p className="text-sm text-green-600">
                      Data saved successfully as {submitResult.filename}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      resetForm();
                      setSubmitResult(null);
                    }}
                  >
                    Reset
                  </Button>
                  
                  {activeStep === "basic-info" && (
                    <Button
                      type="button"
                      onClick={() => setActiveStep("measurements")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Next
                    </Button>
                  )}

                  {activeStep === "measurements" && (
                    <Button
                      type="submit"
                      disabled={isSubmitting || submitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting || submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Data"
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Tabs>
          </Card>
        </Form>
      )}
    </Formik>
  );
}
