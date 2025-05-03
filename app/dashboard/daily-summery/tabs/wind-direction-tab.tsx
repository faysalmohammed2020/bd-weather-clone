"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function WindDirectionTab() {
  const { values, setFieldValue } = useFormikContext<{
    windDirection: string
    windTime: string
  }>()

  const windDirections = [
    { direction: "N", degrees: "350°-010°", code: "35,36,01" },
    { direction: "NNE", degrees: "011°-034°", code: "02,03" },
    { direction: "NE", degrees: "035°-056°", code: "04,05" },
    { direction: "ENE", degrees: "057°-079°", code: "06,07" },
    { direction: "E", degrees: "080°-101°", code: "08,09,10" },
    { direction: "ESE", degrees: "102°-124°", code: "11,12" },
    { direction: "SE", degrees: "125°-146°", code: "13,14" },
    { direction: "SSE", degrees: "147°-169°", code: "15,16" },
    { direction: "S", degrees: "170°-190°", code: "17,18,19" },
    { direction: "SSW", degrees: "191°-214°", code: "20,21" },
    { direction: "SW", degrees: "215°-236°", code: "22,23" },
    { direction: "WSW", degrees: "237°-259°", code: "24,25" },
    { direction: "W", degrees: "260°-281°", code: "26,27,28" },
    { direction: "WNW", degrees: "282°-304°", code: "29,30" },
    { direction: "NW", degrees: "305°-326°", code: "31,32" },
    { direction: "NNW", degrees: "327°-349°", code: "33,34" },
    { direction: "VAR", degrees: "", code: "99" },
    { direction: "CALM", degrees: "-", code: "00" },
  ]

  const handleSelectDirection = (direction: string) => {
    setFieldValue("windDirection", direction)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-cyan-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mr-2">
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </span>
        Wind Direction Code
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-cyan-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-cyan-50">
              <CardTitle className="text-sm font-medium text-cyan-700">Wind Direction Code For Punching only</CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-auto">
              <Table>
                <TableHeader className="bg-cyan-50">
                  <TableRow>
                    <TableHead className="font-medium">Direction</TableHead>
                    <TableHead className="font-medium">Degrees</TableHead>
                    <TableHead className="font-medium">Code</TableHead>
                    <TableHead className="font-medium">Time (UTC)</TableHead>
                    <TableHead className="font-medium w-16">Select</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {windDirections.map((item, index) => (
                    <TableRow
                      key={index}
                      className={
                        values.windDirection === item.direction
                          ? "bg-cyan-50"
                          : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                      }
                    >
                      <TableCell className="font-medium">{item.direction}</TableCell>
                      <TableCell>{item.degrees}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`p-0 h-6 w-6 rounded-full ${values.windDirection === item.direction ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-100"}`}
                          onClick={() => handleSelectDirection(item.direction)}
                        >
                          {values.windDirection === item.direction && <Check className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-cyan-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-cyan-50">
              <CardTitle className="text-sm font-medium text-cyan-700">Selected Wind Data</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-cyan-700">Wind Direction</Label>
                  <RadioGroup
                    value={values.windDirection}
                    onValueChange={(value) => setFieldValue("windDirection", value)}
                    className="mt-2 grid grid-cols-3 gap-2"
                  >
                    {windDirections.map((item) => (
                      <div key={item.direction} className="flex items-center space-x-2">
                        <RadioGroupItem value={item.direction} id={`wind-${item.direction}`} />
                        <Label htmlFor={`wind-${item.direction}`} className="text-sm">
                          {item.direction}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="windTime" className="text-sm font-medium text-cyan-700">
                    Time (UTC)
                  </Label>
                  <Input
                    id="windTime"
                    value={values.windTime || ""}
                    className="mt-2 border-cyan-200 focus:border-cyan-500"
                    onChange={(e) => setFieldValue("windTime", e.target.value)}
                    placeholder="Enter time in UTC"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-cyan-700">Selected Direction Details</Label>
                  <div className="mt-2 p-3 bg-cyan-50 rounded-md">
                    {values.windDirection ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Direction:</span>
                          <span className="text-sm">{values.windDirection}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Degrees:</span>
                          <span className="text-sm">
                            {windDirections.find((item) => item.direction === values.windDirection)?.degrees || ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Code:</span>
                          <span className="text-sm">
                            {windDirections.find((item) => item.direction === values.windDirection)?.code || ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No direction selected</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
