"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CharacterCodesTab() {
  const { values, setFieldValue } = useFormikContext<{
    characterCodes: Record<string, string>
  }>()

  const characterGroups = [
    {
      title: "Drizzle",
      range: "72-73",
      groupId: "drizzle",
      items: [
        { id: "lightDrizzle", label: "Light Drizzle", code: "01" },
        { id: "modDrizzle", label: "Mod Drizzle", code: "02" },
        { id: "heavyDrizzle", label: "Heavy Drizzle", code: "03" },
      ],
    },
    {
      title: "Cont. Rain",
      range: "74-75",
      groupId: "contRain",
      items: [
        { id: "lightContRain", label: "Light Cont. Rain", code: "04" },
        { id: "modContRain", label: "Mod Con. Rain", code: "05" },
        { id: "heavyContRain", label: "Heavy Cont. Rain", code: "05" },
      ],
    },
    {
      title: "Inter. Rain",
      range: "76-77",
      groupId: "interRain",
      items: [
        { id: "lightInterRain", label: "Light Inter. Rain", code: "07" },
        { id: "modInterRain", label: "Mod. Inter. Rain", code: "08" },
        { id: "heavyInterRain", label: "Heavy Inter. Rain", code: "09" },
      ],
    },
    {
      title: "Shower",
      range: "78-80",
      groupId: "shower",
      items: [
        { id: "lightShower", label: "Light Shower", code: "10" },
        { id: "modShower", label: "Mod Shower", code: "11" },
        { id: "heavyShower", label: "Heavy Shower", code: "12" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-purple-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-2">
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
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m8 17 4 4 4-4" />
          </svg>
        </span>
        Character Codes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {characterGroups.map((group) => (
          <Card key={group.groupId} className="border-purple-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-purple-50 flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-purple-700">{group.title}</CardTitle>
              <span className="text-xs text-purple-600 font-mono bg-purple-100 px-2 py-0.5 rounded">{group.range}</span>
            </CardHeader>
            <CardContent className="p-4">
              <RadioGroup
                value={values.characterCodes[group.groupId] || ""}
                onValueChange={(value) => {
                  setFieldValue("characterCodes", {
                    ...values.characterCodes,
                    [group.groupId]: value,
                  })
                }}
              >
                {group.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-purple-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <Label htmlFor={item.id} className="text-sm cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{item.code}</span>
                      <RadioGroupItem value={item.id} id={item.id} className="text-purple-600" />
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
