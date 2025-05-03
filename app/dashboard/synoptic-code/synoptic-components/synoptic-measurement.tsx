"use client";

import { useFormikContext } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface SynopticFormValues {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
  weatherRemark: string;
  measurements: string[];
}

export default function SynopticMeasurementsTab() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<SynopticFormValues>();

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
          IS<sub>n</sub>TTT
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
          <span style={{ display: "block", marginBottom: "2px" }}>
            3P.P.P.P
          </span>
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
          8N<sub>h</sub>C<sub>l</sub>C<sub>m</sub>C<sub>11</sub>
        </>
      ),
      range: "57-61",
    },
    // { id: 10, label: <>2S<sub>n</sub>I<sub>n</sub>I<sub>n</sub>I<sub>n</sub> / I<sub>n</sub>I<sub>n</sub>I<sub>n</sub>I<sub>n</sub> </>, range: "49-50" },
    {
      id: 10,
      label: (
        <span style={{ display: "inline-block", textAlign: "center" }}>
          <span>
            2S<sub>n</sub>I<sub>n</sub>I<sub>n</sub>I<sub>n</sub>
          </span>
          <br />
          <span style={{ borderTop: "1px solid black" }}>
            I<sub>n</sub>I<sub>n</sub>I<sub>n</sub>I<sub>n</sub>
          </span>
        </span>
      ),
      range: "49-50",
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
          8 N<sub>5</sub>C h<sub>5</sub>h<sub>5</sub>
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
                      className="border-green-200 focus:border-green-500"
                      onChange={(e) => {
                        const newMeasurements = [...values.measurements];
                        newMeasurements[item.id] = e.target.value;
                        setFieldValue("measurements", newMeasurements);
                      }}
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
                      className="border-green-200 focus:border-green-500"
                      onChange={(e) => {
                        const newMeasurements = [...values.measurements];
                        newMeasurements[item.id] = e.target.value;
                        setFieldValue("measurements", newMeasurements);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Weather Remark Field */}
            <div className="mt-4">
              <Card className="border-none bg-white">
                <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
                  <CardTitle className="text-sm font-medium text-green-700">
                    Weather Remark
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 border-none">
                  <textarea
                    rows={6}
                    className="border-green-200 focus:border-green-500 w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                    placeholder="Enter any additional weather observations or remarks..."
                    value={values.weatherRemark || ""}
                    onChange={(e) =>
                      setFieldValue("weatherRemark", e.target.value)
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
