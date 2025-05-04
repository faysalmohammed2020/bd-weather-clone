"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, Filter, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Types
interface WeatherData {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
  measurements: string[];
  meteorCodes: string[];
  characterCodes: Record<string, string>;
  windDirection: string;
  windTime: string;
  submittedAt: string;
}

interface StationInfo {
  name: string;
  id: string;
}

// Mock user role - in a real app, this would come from authentication
const userRole = "super_admin"; // or "data_admin" or "viewer"

// Station data
const stations: StationInfo[] = [
  { name: "Dhaka", id: "41923" },
  { name: "Joydebpur", id: "41700" },
  { name: "Mymensingh", id: "41886" },
  { name: "Tangail", id: "41909" },
  { name: "Faridpur", id: "41929" },
  { name: "Madaripur", id: "41939" },
  { name: "Chittagong", id: "41978" },
  { name: "Sandwip", id: "41964" },
  { name: "Sitakunda", id: "41965" },
  { name: "Rangamati", id: "41966" },
  // Add more stations as needed
];

// Measurement labels
const measurementLabels = [
  "Av. Station Pressure",
  "Av. Sea-Level Pressure",
  "Av. Dry-Bulb Temperature",
  "Av. Wet Bulb Temperature",
  "Max. Temperature",
  "Min Temperature",
  "Total Precipitation",
  "Av. Dew. Point Temperature",
];

// Measurement ranges
const measurementRanges = [
  "14-18",
  "19-23",
  "24-26",
  "27-28",
  "30-32",
  "33-35",
  "36-39",
  "40-42",
];

// Second column measurement labels
const measurementLabels2 = [
  "Av. Rel Humidity",
  "Av. Wind Speed",
  "Prevailing Wind Direction (16Pts)",
  "Max Wind Speed",
  "Direction of Max Wind (16Pts)",
  "Av. Total Cloud",
  "Lowest visibility",
  "Total Duration of Rain (H-M)",
];

// Second column measurement ranges
const measurementRanges2 = [
  "43-45",
  "46-48",
  "49-50",
  "51-53",
  "54-55",
  "56",
  "57-59",
  "60-63",
];

// Meteor code labels
const meteorLabels = [
  "Lightning",
  "Thunder-Storm",
  "Squall",
  "Dust Storm",
  "Fog",
  "Mist",
  "Haze",
  "Hail",
];
const meteorCodes = ["64", "65", "66", "67", "68", "69", "70", "71"];

// Wind direction data
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
];

// Character code data
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
      { id: "lightContRain", label: "Light Cont.Rain", code: "04" },
      { id: "modContRain", label: "Mod Con. Rain", code: "05" },
      { id: "heavyContRain", label: "Heavy Cont. Rain", code: "06" },
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
];

export default function WeatherDataTable() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<WeatherData | null>(null);

  // Refs for data type inputs
  const dataTypeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const stationNoRefs = Array.from({ length: 5 }, () =>
    useRef<HTMLInputElement>(null)
  );
  const yearRefs = Array.from({ length: 2 }, () =>
    useRef<HTMLInputElement>(null)
  );
  const monthRefs = Array.from({ length: 2 }, () =>
    useRef<HTMLInputElement>(null)
  );
  const dayRefs = Array.from({ length: 2 }, () =>
    useRef<HTMLInputElement>(null)
  );

  // Fetch weather data
  const fetchData = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setLoading(true);

      // This is just for the demo - in a real app, you'd use an API call
      const sampleData = {
        dataType: "10",
        stationNo: "41923", // Dhaka
        year: "25",
        month: "05",
        day: "04",
        measurements: [
          "15",
          "20",
          "25",
          "26",
          "31",
          "32",
          "38",
          "41",
          "44",
          "47",
          "51",
          "52",
          "52",
          "54",
          "55",
          "61",
        ],
        meteorCodes: ["64", "65", "66", "67", "68", "69", "70", "71"],
        characterCodes: {
          drizzle: "lightDrizzle",
          contRain: "lightContRain",
          interRain: "lightInterRain",
          shower: "lightShower",
        },
        windDirection: "SE",
        windTime: "600",
        submittedAt: "2025-05-04T09:16:26.929Z",
      };

      setWeatherData(sampleData);
      setEditedData(JSON.parse(JSON.stringify(sampleData))); // Deep copy for editing
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error("Failed to load weather data");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if user can edit this record
  const canEdit = () => {
    if (!weatherData) return false;

    if (userRole === "super_admin") return true;

    if (userRole === "data_admin") {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recordDate = new Date();
      recordDate.setFullYear(2000 + Number.parseInt(weatherData.year));
      recordDate.setMonth(Number.parseInt(weatherData.month) - 1);
      recordDate.setDate(Number.parseInt(weatherData.day));

      const todayStr = format(today, "yyyy-MM-dd");
      const yesterdayStr = format(yesterday, "yyyy-MM-dd");
      const recordDateStr = format(recordDate, "yyyy-MM-dd");

      return recordDateStr === todayStr || recordDateStr === yesterdayStr;
    }

    return false;
  };

  // Handle edit toggle
  const toggleEdit = () => {
    if (isEditing) {
      // Save changes
      setWeatherData(editedData);
      toast.success("Changes saved successfully");
    } else {
      // Start editing - make a deep copy of the data
      setEditedData(JSON.parse(JSON.stringify(weatherData)));
    }
    setIsEditing(!isEditing);
  };

  // Handle input change for measurements
  const handleMeasurementChange = (index: number, value: string) => {
    if (!editedData) return;

    const newMeasurements = [...editedData.measurements];
    newMeasurements[index] = value;
    setEditedData({
      ...editedData,
      measurements: newMeasurements,
    });
  };

  // Handle input change for meteor codes
  const handleMeteorCodeChange = (index: number, value: string) => {
    if (!editedData) return;

    const newMeteorCodes = [...editedData.meteorCodes];
    newMeteorCodes[index] = value;
    setEditedData({
      ...editedData,
      meteorCodes: newMeteorCodes,
    });
  };

  // Handle character code change
  const handleCharacterCodeChange = (groupId: string, value: string) => {
    if (!editedData) return;

    setEditedData({
      ...editedData,
      characterCodes: {
        ...editedData.characterCodes,
        [groupId]: value,
      },
    });
  };

  // Handle wind direction change
  const handleWindDirectionChange = (direction: string) => {
    if (!editedData) return;

    setEditedData({
      ...editedData,
      windDirection: direction,
    });
  };

  // Handle wind time change
  const handleWindTimeChange = (time: string) => {
    if (!editedData) return;

    setEditedData({
      ...editedData,
      windTime: time,
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Daily Weather Summary Report", 14, 15);

      // Add filters info
      doc.setFontSize(10);
      if (selectedDate) {
        doc.text(`Date: ${format(selectedDate, "dd/MM/yyyy")}`, 14, 25);
      }
      if (selectedStation) {
        const station = stations.find((s) => s.id === selectedStation);
        doc.text(`Station: ${station?.name || selectedStation}`, 14, 30);
      }

      // Create table data
      // @ts-ignore - jspdf-autotable types are not included
      doc.autoTable({
        html: "#weather-data-table",
        startY: 35,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      });

      doc.save("weather-data-report.pdf");
      toast.success("PDF report downloaded");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  // Get station name by ID
  const getStationName = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    return station ? station.name : stationId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          No weather data found for the selected filters
        </p>
      </div>
    );
  }

  // Use the actual data or the edited version based on isEditing state
  const displayData = isEditing ? editedData : weatherData;

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Daily Weather Summary Report</CardTitle>
            <div className="text-sm text-muted-foreground">
              {getStationName(weatherData.stationNo)} - {weatherData.day}/
              {weatherData.month}/{weatherData.year}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            {canEdit() && (
              <Button variant="outline" size="sm" onClick={toggleEdit}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Save Changes" : "Edit Data"}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-slate-100 rounded-md">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-1">
                <span className="text-sm font-medium">Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium">Station</span>
                <Select
                  value={selectedStation}
                  onValueChange={setSelectedStation}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(undefined);
                  setSelectedStation("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table
            id="weather-data-table"
            className="w-full border-collapse border border-gray-300"
          >
            {/* Header Row with DATA TYPE, STATION NO, YEAR, MONTH, DAY */}
            <thead>
              <tr>
                <th
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  DATA TYPE
                </th>
                <th
                  colSpan={5}
                  className="border border-gray-300 p-2 text-center"
                >
                  STATION NO.
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  YEAR
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  MONTH
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  DAY
                </th>
              </tr>
              <tr>
                <td
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  {isEditing ? (
                    <div className="flex gap-1 justify-center">
                      {[0, 1].map((i) => (
                        <Input
                          key={i}
                          maxLength={1}
                          ref={dataTypeRefs[i]}
                          className="w-8 h-8 text-center p-0"
                          value={editedData?.dataType.substring(i, i + 1) || ""}
                          onChange={(e) => {
                            if (!editedData) return;
                            const newValue =
                              editedData.dataType.substring(0, i) +
                              e.target.value +
                              editedData.dataType.substring(i + 1);
                            setEditedData({
                              ...editedData,
                              dataType: newValue,
                            });
                            if (
                              e.target.value.length === 1 &&
                              i < dataTypeRefs.length - 1
                            ) {
                              dataTypeRefs[i + 1]?.current?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    displayData?.dataType || ""
                  )}
                </td>
                <td
                  colSpan={5}
                  className="border border-gray-300 p-2 text-center"
                >
                  {isEditing ? (
                    <div className="flex gap-1 justify-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Input
                          key={i}
                          maxLength={1}
                          ref={stationNoRefs[i]}
                          className="w-8 h-8 text-center p-0"
                          value={
                            editedData?.stationNo.substring(i, i + 1) || ""
                          }
                          onChange={(e) => {
                            if (!editedData) return;
                            const newValue =
                              editedData.stationNo.substring(0, i) +
                              e.target.value +
                              editedData.stationNo.substring(i + 1);
                            setEditedData({
                              ...editedData,
                              stationNo: newValue,
                            });
                            if (
                              e.target.value.length === 1 &&
                              i < stationNoRefs.length - 1
                            ) {
                              stationNoRefs[i + 1]?.current?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    displayData?.stationNo || ""
                  )}
                </td>
                <td
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  {isEditing ? (
                    <div className="flex gap-1 justify-center">
                      {[0, 1].map((i) => (
                        <Input
                          key={i}
                          maxLength={1}
                          ref={yearRefs[i]}
                          className="w-8 h-8 text-center p-0"
                          value={editedData?.year.substring(i, i + 1) || ""}
                          onChange={(e) => {
                            if (!editedData) return;
                            const newValue =
                              editedData.year.substring(0, i) +
                              e.target.value +
                              editedData.year.substring(i + 1);
                            setEditedData({
                              ...editedData,
                              year: newValue,
                            });
                            if (
                              e.target.value.length === 1 &&
                              i < yearRefs.length - 1
                            ) {
                              yearRefs[i + 1]?.current?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    displayData?.year || ""
                  )}
                </td>
                <td
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  {isEditing ? (
                    <div className="flex gap-1 justify-center">
                      {[0, 1].map((i) => (
                        <Input
                          key={i}
                          maxLength={1}
                          ref={monthRefs[i]}
                          className="w-8 h-8 text-center p-0"
                          value={editedData?.month.substring(i, i + 1) || ""}
                          onChange={(e) => {
                            if (!editedData) return;
                            const newValue =
                              editedData.month.substring(0, i) +
                              e.target.value +
                              editedData.month.substring(i + 1);
                            setEditedData({
                              ...editedData,
                              month: newValue,
                            });
                            if (
                              e.target.value.length === 1 &&
                              i < monthRefs.length - 1
                            ) {
                              monthRefs[i + 1]?.current?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    displayData?.month || ""
                  )}
                </td>
                <td
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  {isEditing ? (
                    <div className="flex gap-1 justify-center">
                      {[0, 1].map((i) => (
                        <Input
                          key={i}
                          maxLength={1}
                          ref={dayRefs[i]}
                          className="w-8 h-8 text-center p-0"
                          value={editedData?.day.substring(i, i + 1) || ""}
                          onChange={(e) => {
                            if (!editedData) return;
                            const newValue =
                              editedData.day.substring(0, i) +
                              e.target.value +
                              editedData.day.substring(i + 1);
                            setEditedData({
                              ...editedData,
                              day: newValue,
                            });
                            if (
                              e.target.value.length === 1 &&
                              i < dayRefs.length - 1
                            ) {
                              dayRefs[i + 1]?.current?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    displayData?.day || ""
                  )}
                </td>
              </tr>
            </thead>
            <tbody>
              {/* Measurements - First 8 rows */}
              {measurementLabels.map((label, index) => (
                <tr key={`measurement-${index}`}>
                  <td className="border border-gray-300 p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 p-2">{label}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    {measurementRanges[index]}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    {isEditing ? (
                      <Input
                        className="w-full h-8 text-center p-0"
                        value={editedData?.measurements[index] || ""}
                        onChange={(e) =>
                          handleMeasurementChange(index, e.target.value)
                        }
                      />
                    ) : (
                      displayData?.measurements[index] || ""
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {index + 9}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {measurementLabels2[index]}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {measurementRanges2[index]}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    {isEditing ? (
                      <Input
                        className="w-full h-8 text-center p-0"
                        value={editedData?.measurements[index + 8] || ""}
                        onChange={(e) =>
                          handleMeasurementChange(index + 8, e.target.value)
                        }
                      />
                    ) : (
                      displayData?.measurements[index + 8] || ""
                    )}
                  </td>
                  {index === 0 && (
                    <>
                      <td
                        rowSpan={8}
                        className="border border-gray-300 p-2 text-center align-middle"
                      >
                        Wind Direction Code
                        <br />
                        For Punching only
                      </td>
                      <td
                        rowSpan={8}
                        className="border border-gray-300 p-2 text-center align-middle"
                      >
                        14-15
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* Meteor Codes Row */}
              <tr>
                <td colSpan={2} className="border border-gray-300 p-2">
                  17. Misc.
                  <br />
                  Meteors Cods
                </td>
                <td className="border border-gray-300 p-2 text-center">1</td>
                <td className="border border-gray-300 p-2 text-center">2</td>
                <td className="border border-gray-300 p-2 text-center">3</td>
                <td className="border border-gray-300 p-2 text-center">4</td>
                <td className="border border-gray-300 p-2 text-center">5</td>
                <td className="border border-gray-300 p-2 text-center">6</td>
                <td className="border border-gray-300 p-2 text-center">7</td>
                <td className="border border-gray-300 p-2 text-center">8</td>
                <td
                  rowSpan={3}
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center align-middle"
                >
                  {/* Wind Direction Table */}
                  <table className="w-full border-collapse">
                    <tbody>
                      {windDirections.slice(0, 8).map((wind, idx) => (
                        <tr key={`wind-${idx}`}>
                          <td className="border-b border-gray-200 p-1">
                            {isEditing ? (
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id={`wind-${wind.direction}`}
                                  name="windDirection"
                                  value={wind.direction}
                                  checked={
                                    editedData?.windDirection === wind.direction
                                  }
                                  onChange={() =>
                                    handleWindDirectionChange(wind.direction)
                                  }
                                  className="mr-2"
                                />
                                <label htmlFor={`wind-${wind.direction}`}>
                                  {wind.direction}
                                </label>
                              </div>
                            ) : (
                              wind.direction
                            )}
                          </td>
                          <td className="border-b border-gray-200 p-1 text-xs">
                            {wind.degrees}
                          </td>
                          <td className="border-b border-gray-200 p-1 text-xs">
                            {wind.code}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Meteor Labels Row */}
              <tr>
                <td colSpan={2} className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2 text-center">
                  Light-
                  <br />
                  ning
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Thunder-
                  <br />
                  Storm
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Squall
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Dust
                  <br />
                  Storm
                </td>
                <td className="border border-gray-300 p-2 text-center">Fog</td>
                <td className="border border-gray-300 p-2 text-center">Mist</td>
                <td className="border border-gray-300 p-2 text-center">Haze</td>
                <td className="border border-gray-300 p-2 text-center">Hail</td>
              </tr>

              {/* Meteor Codes Row */}
              <tr>
                <td colSpan={2} className="border border-gray-300 p-2"></td>
                {meteorCodes.map((code, idx) => (
                  <td
                    key={`meteor-code-${idx}`}
                    className="border border-gray-300 p-2 text-center"
                  >
                    {code}
                  </td>
                ))}
              </tr>

              {/* Meteor Values Row */}
              <tr>
                <td colSpan={2} className="border border-gray-300 p-2"></td>
                {meteorCodes.map((_, idx) => (
                  <td
                    key={`meteor-value-${idx}`}
                    className="border border-gray-300 p-2 text-center"
                  >
                    {isEditing ? (
                      <Input
                        className="w-full h-8 text-center p-0"
                        value={editedData?.meteorCodes[idx] || ""}
                        onChange={(e) =>
                          handleMeteorCodeChange(idx, e.target.value)
                        }
                      />
                    ) : (
                      displayData?.meteorCodes[idx] || ""
                    )}
                  </td>
                ))}
                <td
                  rowSpan={8}
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center align-middle"
                >
                  {/* Wind Direction Table Continued */}
                  <table className="w-full border-collapse">
                    <tbody>
                      {windDirections.slice(8, 16).map((wind, idx) => (
                        <tr key={`wind-${idx + 8}`}>
                          <td className="border-b border-gray-200 p-1">
                            {isEditing ? (
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id={`wind-${wind.direction}`}
                                  name="windDirection"
                                  value={wind.direction}
                                  checked={
                                    editedData?.windDirection === wind.direction
                                  }
                                  onChange={() =>
                                    handleWindDirectionChange(wind.direction)
                                  }
                                  className="mr-2"
                                />
                                <label htmlFor={`wind-${wind.direction}`}>
                                  {wind.direction}
                                </label>
                              </div>
                            ) : (
                              wind.direction
                            )}
                          </td>
                          <td className="border-b border-gray-200 p-1 text-xs">
                            {wind.degrees}
                          </td>
                          <td className="border-b border-gray-200 p-1 text-xs">
                            {wind.code}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Character Codes Header Row */}
              <tr>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2 text-center">
                  Character
                </td>
                <td
                  className="border border-gray-300 p-2 text-center"
                  colSpan={2}
                >
                  {characterGroups[0].range}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Character
                </td>
                <td
                  className="border border-gray-300 p-2 text-center"
                  colSpan={2}
                >
                  {characterGroups[1].range}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Character
                </td>
                <td
                  className="border border-gray-300 p-2 text-center"
                  colSpan={2}
                >
                  {characterGroups[2].range}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Character
                </td>
                <td
                  className="border border-gray-300 p-2 text-center"
                  colSpan={2}
                >
                  {characterGroups[3].range}
                </td>
              </tr>

              {/* Character Codes Rows */}
              {[0, 1, 2].map((rowIdx) => (
                <tr key={`char-row-${rowIdx}`}>
                  <td className="border border-gray-300 p-2 text-center">
                    {rowIdx + 1}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {characterGroups[0].items[rowIdx].label}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    {characterGroups[0].items[rowIdx].code}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {characterGroups[1].items[rowIdx].label}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    {characterGroups[1].items[rowIdx].code}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {characterGroups[2].items[rowIdx].label}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    {characterGroups[2].items[rowIdx].code}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {characterGroups[3].items[rowIdx].label}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    {characterGroups[3].items[rowIdx].code}
                  </td>
                </tr>
              ))}

              {/* Character Code Selection Row */}
              <tr>
                <td
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  Selected Character Codes
                </td>
                <td colSpan={3} className="border border-gray-300 p-2">
                  {isEditing ? (
                    <Select
                      value={editedData?.characterCodes.drizzle || ""}
                      onValueChange={(value) =>
                        handleCharacterCodeChange("drizzle", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select drizzle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {characterGroups[0].items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    characterGroups[0].items.find(
                      (item) => item.id === displayData?.characterCodes.drizzle
                    )?.label || "None"
                  )}
                </td>
                <td colSpan={3} className="border border-gray-300 p-2">
                  {isEditing ? (
                    <Select
                      value={editedData?.characterCodes.contRain || ""}
                      onValueChange={(value) =>
                        handleCharacterCodeChange("contRain", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select cont. rain type" />
                      </SelectTrigger>
                      <SelectContent>
                        {characterGroups[1].items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    characterGroups[1].items.find(
                      (item) => item.id === displayData?.characterCodes.contRain
                    )?.label || "None"
                  )}
                </td>
                <td colSpan={3} className="border border-gray-300 p-2">
                  {isEditing ? (
                    <Select
                      value={editedData?.characterCodes.interRain || ""}
                      onValueChange={(value) =>
                        handleCharacterCodeChange("interRain", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select inter. rain type" />
                      </SelectTrigger>
                      <SelectContent>
                        {characterGroups[2].items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    characterGroups[2].items.find(
                      (item) =>
                        item.id === displayData?.characterCodes.interRain
                    )?.label || "None"
                  )}
                </td>
                <td colSpan={3} className="border border-gray-300 p-2">
                  {isEditing ? (
                    <Select
                      value={editedData?.characterCodes.shower || ""}
                      onValueChange={(value) =>
                        handleCharacterCodeChange("shower", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select shower type" />
                      </SelectTrigger>
                      <SelectContent>
                        {characterGroups[3].items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    characterGroups[3].items.find(
                      (item) => item.id === displayData?.characterCodes.shower
                    )?.label || "None"
                  )}
                </td>
              </tr>

              {/* Wind Time Row */}
              <tr>
                <td
                  colSpan={10}
                  className="border border-gray-300 p-2 text-right font-medium"
                >
                  Wind Time (UTC):
                </td>
                <td colSpan={3} className="border border-gray-300 p-2">
                  {isEditing ? (
                    <Input
                      className="w-full h-8 p-1"
                      value={editedData?.windTime || ""}
                      onChange={(e) => handleWindTimeChange(e.target.value)}
                    />
                  ) : (
                    displayData?.windTime || ""
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
