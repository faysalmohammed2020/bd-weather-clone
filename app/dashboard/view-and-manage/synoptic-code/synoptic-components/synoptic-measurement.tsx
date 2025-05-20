"use client";

import { useFormikContext } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type SynopticFormValues } from "@/lib/generateSynopticCode";
import { getRemarksFromPresentWeather } from "@/lib/generateSynopticCode";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ... (keep your existing measurements array exactly as is) ...

const measurements = [
  { id: 0, label: "C1", range: "16" },
  { id: 1, label: "Iliii", range: "17-21" },
  {
    id: 2,
    label: (
      <>
        i<sub>R</sub>i<sub>X</sub>h<sub>vv</sub>
      </>
    ),
    range: "22-26",
  },
  { id: 3, label: "Nddff", range: "27-31" },
  {
    id: 4,
    label: (
      <>
        1S<sub>n</sub>TTT
      </>
    ),
    range: "32-36",
  },
  {
    id: 5,
    label: (
      <>
        2S<sub>n</sub>T<sub>d</sub>T<sub>d</sub>T<sub>d</sub>
      </>
    ),
    range: "37-41",
  },
  {
    id: 6,
    label: (
      <span style={{ display: "inline-block", textAlign: "center" }}>
        <span style={{ display: "block", marginBottom: "2px" }}>3P.P.P.P</span>
        <span style={{ display: "block", borderTop: "1px solid black" }}>
          4PPPP
        </span>
      </span>
    ),
    range: "42-46",
  },
  {
    id: 7,
    label: (
      <>
        6RRRt<sub>R</sub>
      </>
    ),
    range: "47-51",
  },
  {
    id: 8,
    label: (
      <>
        7<sub>ww</sub>W<sub>1</sub>W<sub>2</sub>
      </>
    ),
    range: "52-56",
  },
  {
    id: 9,
    label: (
      <>
        8N<sub>h</sub>C<sub>l</sub>C<sub>m</sub>C<sub>h</sub>
      </>
    ),
    range: "57-61",
  },
  {
    id: 10,
    label: (
      <span style={{ display: "inline-block", textAlign: "center" }}>
        <span>
          2S<sub>n</sub>T<sub>n</sub>T<sub>n</sub>T<sub>n</sub>
        </span>
        <br />
        <span style={{ borderTop: "1px solid black" }}>
          I<sub>n</sub>I<sub>n</sub>I<sub>n</sub>I<sub>n</sub>
        </span>
      </span>
    ),
    range: "62-66",
  },
  {
    id: 11,
    label: (
      <>
        56D<sub>L</sub>D<sub>M</sub>D<sub>H</sub>
      </>
    ),
    range: "67-71",
  },
  {
    id: 12,
    label: (
      <>
        57CD<sub>a</sub>E<sub>c</sub>
      </>
    ),
    range: "72-76",
  },
  { id: 13, label: "Av. Total Cloud", range: "56" },
  { id: 14, label: "C2", range: "16" },
  { id: 15, label: "GG", range: "17-18" },
  {
    id: 16,
    label: (
      <span style={{ display: "inline-block", textAlign: "center" }}>
        <span>
          58 P<sub>24</sub>P<sub>24</sub>P<sub>24</sub>
        </span>
        <br />
        <span style={{ borderTop: "1px solid black" }}>
          59 P<sub>24</sub>P<sub>24</sub>P<sub>24</sub>
        </span>
      </span>
    ),
    range: "19-23",
  },
  {
    id: 17,
    label: (
      <span style={{ display: "inline-block", textAlign: "center" }}>
        <span>
          ( 6 R R R t<sub>R</sub> )
        </span>
        <br />
        <span style={{ borderTop: "1px solid black" }}>
          7 R<sub>24</sub>R<sub>24</sub>R<sub>24</sub>
        </span>
      </span>
    ),
    range: "24-28",
  },
  {
    id: 18,
    label: (
      <>
        8 N<sub>s</sub>C h<sub>s</sub>h<sub>s</sub>
      </>
    ),
    range: "29-33",
  },
  {
    id: 19,
    label: (
      <>
        90dqqq<sub>t</sub>
      </>
    ),
    range: "34-38",
  },
  {
    id: 20,
    label: (
      <>
        91 f<sub>q</sub>f<sub>q</sub>f<sub>q</sub>
      </>
    ),
    range: "39-43",
  },
];

export default function SynopticMeasurementsTab() {
  const { values, setFieldValue } = useFormikContext<SynopticFormValues>();
  const [dataStatus, setDataStatus] = useState<{
    hasToday: boolean;
    message: string;
    isLoading: boolean;
    error?: string;
  }>({
    hasToday: true,
    message: "",
    isLoading: true,
  });

  useEffect(() => {
    const fetchSynopticData = async () => {
      try {
        setDataStatus((prev) => ({
          ...prev,
          isLoading: true,
          error: undefined,
        }));

        const response = await fetch("/api/synoptic");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const generatedValues = await response.json();

        // Check if today's date matches the generated values
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const valuesDateStr = `${generatedValues.year}-${generatedValues.month}-${generatedValues.day}`;

        const isToday = todayStr === valuesDateStr;

        setDataStatus({
          hasToday: isToday,
          message: isToday
            ? "Using today's weather data"
            : "No data available for today, using most recent data",
          isLoading: false,
        });

        // Update all form fields
        setFieldValue("measurements", generatedValues.measurements);
        setFieldValue("stationNo", generatedValues.stationNo);
        setFieldValue("weatherRemark", generatedValues.weatherRemark);
        setFieldValue("dataType", generatedValues.dataType);
        setFieldValue("year", generatedValues.year);
        setFieldValue("month", generatedValues.month);
        setFieldValue("day", generatedValues.day);
        const presentWeather = generatedValues.measurements[8].substring(1, 3); // '7' বাদ দিয়ে শুধু 'ww' নেওয়া
        const weatherRemark = getRemarksFromPresentWeather(presentWeather);

        // Form এর weatherRemark মান সেট করুন
        setFieldValue("weatherRemark", weatherRemark);
      } catch (error) {
        console.error("Error fetching synoptic data:", error);
        setDataStatus({
          hasToday: false,
          message: "Error loading weather data",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Set default values on error
        const now = new Date();
        setFieldValue("measurements", Array(21).fill(""));
        setFieldValue("stationNo", "00000");
        setFieldValue("weatherRemark", "");
        setFieldValue("dataType", "SYNOP");
        setFieldValue("year", now.getFullYear().toString());
        setFieldValue("month", String(now.getMonth() + 1).padStart(2, "0"));
        setFieldValue("day", String(now.getDate()).padStart(2, "0"));
      }
    };

    fetchSynopticData();
  }, [setFieldValue]);

  if (dataStatus.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        stationNo: values.stationNo,
        year: values.year,
        month: values.month,
        day: values.day,
        dataType: values.dataType || "SYNOP",
        weatherRemark: values.weatherRemark,

        // Individual measurement fields
        C1: values.measurements[0] || null,
        Iliii: values.measurements[1] || null,
        iRiXhvv: values.measurements[2] || null,
        Nddff: values.measurements[3] || null,
        S1nTTT: values.measurements[4] || null,
        S2nTddTddTdd: values.measurements[5] || null,
        P3PPP4PPPP: values.measurements[6] || null,
        RRRtR6: values.measurements[7] || null,
        wwW1W2: values.measurements[8] || null,
        NhClCmCh: values.measurements[9] || null,
        S2nTnTnTnInInInIn: values.measurements[10] || null,
        D56DLDMDH: values.measurements[11] || null,
        CD57DaEc: values.measurements[12] || null,
        avgTotalCloud: values.measurements[13] || null,
        C2: values.measurements[14] || null,
        GG: values.measurements[15] || null,
        P24Group58_59: values.measurements[16] || null,
        R24Group6_7: values.measurements[17] || null,
        NsChshs: values.measurements[18] || null,
        dqqqt90: values.measurements[19] || null,
        fqfqfq91: values.measurements[20] || null,
      };

      const response = await fetch("/api/synoptic-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("✅ Synoptic data saved successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "❌ Failed to save data");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("❌ Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-green-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        </span>
        Synoptic Code Measurements
      </h2>

      {dataStatus.error ? (
        <div className="p-3 rounded-md bg-red-100 text-red-800 text-sm">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Error: {dataStatus.error}
          </div>
        </div>
      ) : (
        dataStatus.message && (
          <div
            className={`p-3 rounded-md text-sm ${
              dataStatus.hasToday
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            <div className="flex items-center">
              {dataStatus.hasToday ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
              {dataStatus.message}
            </div>
          </div>
        )
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
            <CardTitle className="text-sm font-medium text-green-700">
              Measurements 1-11
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(0, 11).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-6">
                    <Label
                      htmlFor={`measurement-${item.id}`}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </Label>
                  </div>
                  <div className="col-span-2 text-xs text-green-600 font-mono bg-green-50 px-1 py-0.5">
                    {item.range}
                  </div>
                  <div className="col-span-3">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      className="border-green-200 bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
            <CardTitle className="text-sm font-medium text-green-700">
              Measurements 12-21
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(11).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-6">
                    <Label
                      htmlFor={`measurement-${item.id}`}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </Label>
                  </div>
                  <div className="col-span-2 text-xs text-green-600 font-mono bg-green-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div>
                  <div className="col-span-3">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      className="border-green-200 bg-gray-50 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Weather Remark Field */}
            <div className="mt-4">
              <Card className="border border-green-100  shadow-sm rounded-xl">
                <CardHeader className="pb-2 pt-4 px-4 bg-green-100 rounded-t-xl">
                  <CardTitle className="text-sm font-semibold text-green-800">
                    Weather Remark
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-6 text-center">
                  {values.weatherRemark ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-6xl">
                        {values.weatherRemark.split(" - ")[0]}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        {values.weatherRemark.split(" - ")[1]}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No remark available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end mt-6">
        <Button
          type="button"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md shadow-sm text-lg"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
