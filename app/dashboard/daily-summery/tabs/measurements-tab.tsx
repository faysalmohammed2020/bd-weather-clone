"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MeasurementsTab() {
  const { values, errors, touched, setFieldValue } = useFormikContext<{
    measurements: string[]
  }>()

  const measurements = [
    { id: 0, label: "Av. Station Pressure", range: "14-18" },
    { id: 1, label: "Av. Sea-Level Pressure", range: "19-23" },
    { id: 2, label: "Av. Dry-Bulb Temperature", range: "24-26" },
    { id: 3, label: "Av. Wet Bulb Temperature", range: "27-28" },
    { id: 4, label: "Max. Temperature", range: "30-32" },
    { id: 5, label: "Min Temperature", range: "33-35" },
    { id: 6, label: "Total Precipitation", range: "36-39" },
    { id: 7, label: "Av. Dew. Point Temperature", range: "40-42" },
    { id: 8, label: "Av. Rel Humidity", range: "43-45" },
    { id: 9, label: "Av. Wind Speed", range: "46-48" },
    { id: 10, label: "Prevailing Wind Direction (16Pts)", range: "49-50" },
    { id: 11, label: "Max Wind Speed", range: "51-53" },
    { id: 12, label: "Direction of Max Wind (16Pts)", range: "54-55" },
    { id: 13, label: "Av. Total Cloud", range: "56" },
    { id: 14, label: "Lowest visibility", range: "57-59" },
    { id: 15, label: "Total Duration of Rain (H-M)", range: "60-63" },
  ]

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
        Weather Measurements
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
            <CardTitle className="text-sm font-medium text-green-700">Measurements 1-8</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-7">
                    <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
                      {item.label} ({item.range})
                    </Label>
                  </div>
                  {/* <div className="col-span-1 text-xs text-green-600 font-mono bg-green-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div> */}
                  <div className="col-span-3">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      className="border-green-200 focus:border-green-500"
                      onChange={(e) => {
                        const newMeasurements = [...values.measurements]
                        newMeasurements[item.id] = e.target.value
                        setFieldValue("measurements", newMeasurements)
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
            <CardTitle className="text-sm font-medium text-green-700">Measurements 9-16</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-7">
                    <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
                      {item.label} ({item.range})
                    </Label>
                  </div>
                  {/* <div className="col-span-1 text-xs text-green-600 font-mono bg-green-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div> */}
                  <div className="col-span-3">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      className="border-green-200 focus:border-green-500"
                      onChange={(e) => {
                        const newMeasurements = [...values.measurements]
                        newMeasurements[item.id] = e.target.value
                        setFieldValue("measurements", newMeasurements)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
