"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs/tabs-summery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import BasicInfoTab from "./tabs/basic-info-tab";
import MeasurementsTab from "./tabs/measurements-tab";
import MeteorCodesTab from "./tabs/meteor-codes-tab";
import CharacterCodesTab from "./tabs/character-codes-tab";
import WindDirectionTab from "./tabs/wind-direction-tab";
import { useState } from "react";
import { saveDailySummeryData } from "@/app/actions/weather-code-data";
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

  const [currentTab, setCurrentTab] = useState("basic-info");
  const tabOrder = [
    "basic-info",
    "measurements",
    "meteor-codes",
    "character-codes",
    "wind-direction",
  ];

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

  const handleSubmit = async (values: typeof initialValues, { resetForm }: { resetForm: () => void }) => {
    try {
      setSubmitting(true);
      const result = await saveDailySummeryData(values);
      setSubmitResult(result);
  
      if (result.success) {
        toast.success("✅ Weather data saved successfully");
  
        // Reset form and go to dashboard
        resetForm();                // clear all fields
        setCurrentTab("basic-info"); // go to first tab
        setTimeout(() => router.push("/dashboard"), 1000); // redirect after toast
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
      validationSchema={weatherFormSchema}
      onSubmit={(values, actions) => handleSubmit(values, actions)}
    >
      {({ values, errors, touched, isSubmitting }) => (
        <Form>
          <Card className="shadow-lg border-t-4 border-t-blue-500">
            {/* <Tabs defaultValue="basic-info" className="w-full"> */}
            <Tabs
              value={currentTab}
              onValueChange={setCurrentTab}
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
                <TabsTrigger
                  value="meteor-codes"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-none flex-1 py-3 text-sm font-medium"
                >
                  Meteor Codes
                </TabsTrigger>
                <TabsTrigger
                  value="character-codes"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-none flex-1 py-3 text-sm font-medium"
                >
                  Character Codes
                </TabsTrigger>
                <TabsTrigger
                  value="wind-direction"
                  className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-none flex-1 py-3 text-sm font-medium"
                >
                  Wind Direction
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
                  <MeasurementsTab />
                </TabsContent>

                <TabsContent
                  value="meteor-codes"
                  className="mt-0 border-2 border-amber-100 rounded-md p-4 bg-amber-50/30"
                >
                  <MeteorCodesTab />
                </TabsContent>

                <TabsContent
                  value="character-codes"
                  className="mt-0 border-2 border-purple-100 rounded-md p-4 bg-purple-50/30"
                >
                  <CharacterCodesTab />
                </TabsContent>

                <TabsContent
                  value="wind-direction"
                  className="mt-0 border-2 border-cyan-100 rounded-md p-4 bg-cyan-50/30"
                >
                  <WindDirectionTab />
                </TabsContent>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-between">
                <div>
                  {Object.keys(errors).length > 0 && (
                    <p className="text-sm text-destructive">
                      Please fill the input fields before proceeding
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" type="reset">
                    Reset
                  </Button>
                  {currentTab !== "wind-direction" ? (
                    <Button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabOrder.indexOf(currentTab);
                        const nextTab = tabOrder[currentIndex + 1];
                        if (nextTab) setCurrentTab(nextTab);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitting ? "Saving..." : "Submit Data"}
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
