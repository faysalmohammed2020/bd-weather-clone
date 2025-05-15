"use client"

import { useRef } from "react"
import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function BasicInfoTab() {
  const { values, errors, touched, setFieldValue } = useFormikContext<{
    dataType: string
    stationNo: string
    year: string
    month: string
    day: string
  }>()

  const dataTypeRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const stationNoRefs = Array.from({ length: 5 }, () => useRef<HTMLInputElement>(null))
  const yearRefs = Array.from({ length: 2 }, () => useRef<HTMLInputElement>(null))
  const monthRefs = Array.from({ length: 2 }, () => useRef<HTMLInputElement>(null))
  const dayRefs = Array.from({ length: 2 }, () => useRef<HTMLInputElement>(null))

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-blue-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2">
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
            <path d="M14 4h6v6h-6z" />
            <path d="M4 14h6v6H4z" />
            <path d="M17 17h3v3h-3z" />
            <path d="M4 4h6v6H4z" />
          </svg>
        </span>
        Basic Information
      </h2>

      <Card className="border border-blue-200 bg-white shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between gap-8">

            {/* Data Type */}
            <div className="flex flex-col">
              <Label htmlFor="dataType" className="text-sm font-medium text-blue-700 mb-2">
                DATA TYPE
              </Label>
              <div className="flex gap-1">
                {[0, 1].map((i) => (
                  <Input
                    key={i}
                    id={`dataType-${i}`}
                    maxLength={1}
                    ref={dataTypeRefs[i]}
                    className="w-12 border-blue-200 focus:border-blue-500"
                    value={values.dataType.substring(i, i + 1)}
                    onChange={(e) => {
                      const newValue =
                        values.dataType.substring(0, i) + e.target.value + values.dataType.substring(i + 1)
                      setFieldValue("dataType", newValue)
                      if (e.target.value.length === 1 && i < dataTypeRefs.length - 1) {
                        dataTypeRefs[i + 1]?.current?.focus()
                      }
                    }}
                  />
                ))}
              </div>
              {errors.dataType && touched.dataType && (
                <p className="text-sm text-destructive mt-1">{errors.dataType}</p>
              )}
            </div>

            {/* Station No */}
            <div className="flex flex-col">
              <Label htmlFor="stationNo" className="text-sm font-medium text-blue-700 mb-2">
                STATION NO.
              </Label>
              <div className="flex gap-1">
                {stationNoRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`stationNo-${i}`}
                    maxLength={1}
                    ref={ref}
                    className="w-12 border-blue-200 focus:border-blue-500"
                    value={values.stationNo.substring(i, i + 1)}
                    onChange={(e) => {
                      const newValue =
                        values.stationNo.substring(0, i) + e.target.value + values.stationNo.substring(i + 1)
                      setFieldValue("stationNo", newValue)
                      if (e.target.value.length === 1 && i < stationNoRefs.length - 1) {
                        stationNoRefs[i + 1]?.current?.focus()
                      }
                    }}
                  />
                ))}
              </div>
              {errors.stationNo && touched.stationNo && (
                <p className="text-sm text-destructive mt-1">{errors.stationNo}</p>
              )}
            </div>

            {/* Year */}
            <div className="flex flex-col">
              <Label htmlFor="year" className="text-sm font-medium text-blue-700 mb-2">
                YEAR
              </Label>
              <div className="flex gap-1">
                {yearRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`year-${i}`}
                    maxLength={1}
                    ref={ref}
                    className="w-12 border-blue-200 focus:border-blue-500"
                    value={values.year.substring(i, i + 1)}
                    onChange={(e) => {
                      const newValue =
                        values.year.substring(0, i) + e.target.value + values.year.substring(i + 1)
                      setFieldValue("year", newValue)
                      if (e.target.value.length === 1 && i < yearRefs.length - 1) {
                        yearRefs[i + 1]?.current?.focus()
                      }
                    }}
                  />
                ))}
              </div>
              {errors.year && touched.year && (
                <p className="text-sm text-destructive mt-1">{errors.year}</p>
              )}
            </div>

            {/* Month */}
            <div className="flex flex-col">
              <Label htmlFor="month" className="text-sm font-medium text-blue-700 mb-2">
                MONTH
              </Label>
              <div className="flex gap-1">
                {monthRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`month-${i}`}
                    maxLength={1}
                    ref={ref}
                    className="w-12 border-blue-200 focus:border-blue-500"
                    value={values.month.substring(i, i + 1)}
                    onChange={(e) => {
                      const newValue =
                        values.month.substring(0, i) + e.target.value + values.month.substring(i + 1)
                      setFieldValue("month", newValue)
                      if (e.target.value.length === 1 && i < monthRefs.length - 1) {
                        monthRefs[i + 1]?.current?.focus()
                      }
                    }}
                  />
                ))}
              </div>
              {errors.month && touched.month && (
                <p className="text-sm text-destructive mt-1">{errors.month}</p>
              )}
            </div>

            {/* Day */}
            <div className="flex flex-col">
              <Label htmlFor="day" className="text-sm font-medium text-blue-700 mb-2">
                DAY
              </Label>
              <div className="flex gap-1">
                {dayRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`day-${i}`}
                    maxLength={1}
                    ref={ref}
                    className="w-12 border-blue-200 focus:border-blue-500"
                    value={values.day.substring(i, i + 1)}
                    onChange={(e) => {
                      const newValue =
                        values.day.substring(0, i) + e.target.value + values.day.substring(i + 1)
                      setFieldValue("day", newValue)
                      if (e.target.value.length === 1 && i < dayRefs.length - 1) {
                        dayRefs[i + 1]?.current?.focus()
                      }
                    }}
                  />
                ))}
              </div>
              {errors.day && touched.day && (
                <p className="text-sm text-destructive mt-1">{errors.day}</p>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
