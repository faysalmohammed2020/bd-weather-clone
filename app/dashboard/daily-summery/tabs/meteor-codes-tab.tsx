"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MeteorCodesTab() {
  const { values, setFieldValue } = useFormikContext<{
    meteorCodes: string[]
  }>()

  const meteorCodes = [
    { id: 0, label: "Lightning", code: "64" },
    { id: 1, label: "Thunder-Storm", code: "65" },
    { id: 2, label: "Squall", code: "66" },
    { id: 3, label: "Dust Storm", code: "67" },
    { id: 4, label: "Fog", code: "68" },
    { id: 5, label: "Mist", code: "69" },
    { id: 6, label: "Haze", code: "70" },
    { id: 7, label: "Hail", code: "71" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-amber-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-2">
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
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            <path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5" />
          </svg>
        </span>
        17. Misc. Meteors Codes
      </h2>

      <Card className="border-amber-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-amber-50">
          <CardTitle className="text-sm font-medium text-amber-700">Weather Phenomena</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meteorCodes.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-3 rounded-md border border-amber-100 hover:bg-amber-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-2 text-xs font-medium">
                  {item.id + 1}
                </div>
                <Label htmlFor={`meteor-${item.id}`} className="flex-1 text-sm font-medium flex items-center">
                  {item.label}
                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{item.code}</span>
                </Label>
                <Input
                  id={`meteor-${item.id}`}
                  value={values.meteorCodes[item.id] || ""}
                  className="w-20 border-amber-200 focus:border-amber-500"
                  onChange={(e) => {
                    const newMeteorCodes = [...values.meteorCodes]
                    newMeteorCodes[item.id] = e.target.value
                    setFieldValue("meteorCodes", newMeteorCodes)
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
