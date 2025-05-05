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

// Import all data from the consolidated data store
import {
  type WeatherData,
  weatherData,
  selectedStations,
  measurementLabels,
  measurementLabels2,
  windDirections,
  characterGroups,
  userRole,
} from "@/data/weatherDataStore";

export default function WeatherDataTable() {
  const [data, setData] = useState<WeatherData[]>(weatherData);
  const [filteredData, setFilteredData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date("2025-05-04")
  );
  const [selectedStation, setSelectedStation] = useState<string>("41923"); // Default to Dhaka
  const [showFilters, setShowFilters] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<WeatherData | null>(null);

  // Refs for data type inputs
  const dataTypeRefs = useRef<(HTMLInputElement | null)[]>([null, null]);
  const stationNoRefs = useRef<(HTMLInputElement | null)[]>(
    Array.from({ length: 5 }, () => null)
  );
  const yearRefs = useRef<(HTMLInputElement | null)[]>([null, null]);
  const monthRefs = useRef<(HTMLInputElement | null)[]>([null, null]);
  const dayRefs = useRef<(HTMLInputElement | null)[]>([null, null]);

  // Filter data based on selected date and station
  const filterData = useCallback(() => {
    setLoading(true);

    try {
      let result = null;

      if (selectedDate && selectedStation) {
        const day = selectedDate.getDate().toString().padStart(2, "0");
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        const year = selectedDate.getFullYear().toString().slice(-2);

        result =
          data.find(
            (item) =>
              item.day === day.slice(-2) &&
              item.month === month.slice(-2) &&
              item.year === year &&
              item.stationNo === selectedStation
          ) || null;
      }

      setFilteredData(result);
      if (result) {
        setEditedData(JSON.parse(JSON.stringify(result))); // Deep copy for editing
      }
    } catch (error) {
      console.error("Error filtering weather data:", error);
      toast.error("Failed to filter weather data");
      setFilteredData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStation, data]);

  // Run filter when dependencies change
  useEffect(() => {
    filterData();
  }, [filterData]);

  // Check if user can edit this record
  const canEdit = useCallback(() => {
    if (!filteredData) return false;

    if (userRole === "super_admin") return true;

    if (userRole === "data_admin") {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recordDate = new Date();
      recordDate.setFullYear(2000 + Number.parseInt(filteredData.year));
      recordDate.setMonth(Number.parseInt(filteredData.month) - 1);
      recordDate.setDate(Number.parseInt(filteredData.day));

      const todayStr = format(today, "yyyy-MM-dd");
      const yesterdayStr = format(yesterday, "yyyy-MM-dd");
      const recordDateStr = format(recordDate, "yyyy-MM-dd");

      return recordDateStr === todayStr || recordDateStr === yesterdayStr;
    }

    return false;
  }, [filteredData]);

  // Handle edit toggle
  const toggleEdit = () => {
    if (isEditing) {
      // Save changes
      if (editedData && filteredData) {
        // Update the data in the main array
        const updatedData = data.map((item) =>
          item.id === filteredData.id ? editedData : item
        );
        setData(updatedData);
        setFilteredData(editedData);
        toast.success("Changes saved successfully");
      }
    } else {
      // Start editing - make a deep copy of the data
      setEditedData(
        filteredData ? JSON.parse(JSON.stringify(filteredData)) : null
      );
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
        const station = selectedStations.find((s) => s.id === selectedStation);
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
    const station = selectedStations.find((s) => s.id === stationId);
    return station ? station.name : stationId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use the actual data or the edited version based on isEditing state
  const displayData = isEditing && editedData ? editedData : filteredData;

  return (
    <div className="text-center py-10">
      <div className="flex justify-between w-full">
        <div>
          <CardTitle>Daily Weather Summary Report</CardTitle>
          {filteredData && (
            <div className="text-sm text-muted-foreground">
              {getStationName(filteredData.stationNo)} - {filteredData.day}/
              {filteredData.month}/{filteredData.year}
            </div>
          )}
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

          {filteredData && canEdit() && (
            <Button variant="outline" size="sm" onClick={toggleEdit}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Data"}
            </Button>
          )}

          {filteredData && (
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          )}
        </div>
      </div>

      {/* Always show filters section */}
      <div className="bg-slate-50">
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
                    <SelectValue placeholder="Select Station" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStations.map((station) => (
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
                  setSelectedDate(new Date("2025-05-04"));
                  setSelectedStation("41923");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Show data or "no data" message */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredData ? (
        <div className="mt-4">
          <Card className="shadow-lg">
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
                        DAILY SUMMERY
                      </th>
                      <th
                        colSpan={11}
                        className="border border-gray-300 p-2 text-center"
                      ></th>
                    </tr>
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
                                ref={(el) => (dataTypeRefs.current[i] = el)}
                                className="w-8 h-8 text-center p-0"
                                value={
                                  editedData?.dataType.substring(i, i + 1) || ""
                                }
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
                                    i < dataTypeRefs.current.length - 1 &&
                                    dataTypeRefs.current[i + 1]
                                  ) {
                                    dataTypeRefs.current[i + 1]?.focus();
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
                                ref={(el) => (stationNoRefs.current[i] = el)}
                                className="w-8 h-8 text-center p-0"
                                value={
                                  editedData?.stationNo.substring(i, i + 1) ||
                                  ""
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
                                    i < stationNoRefs.current.length - 1 &&
                                    stationNoRefs.current[i + 1]
                                  ) {
                                    stationNoRefs.current[i + 1]?.focus();
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
                                ref={(el) => (yearRefs.current[i] = el)}
                                className="w-8 h-8 text-center p-0"
                                value={
                                  editedData?.year.substring(i, i + 1) || ""
                                }
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
                                    i < yearRefs.current.length - 1 &&
                                    yearRefs.current[i + 1]
                                  ) {
                                    yearRefs.current[i + 1]?.focus();
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
                                ref={(el) => (monthRefs.current[i] = el)}
                                className="w-8 h-8 text-center p-0"
                                value={
                                  editedData?.month.substring(i, i + 1) || ""
                                }
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
                                    i < monthRefs.current.length - 1 &&
                                    monthRefs.current[i + 1]
                                  ) {
                                    monthRefs.current[i + 1]?.focus();
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
                                ref={(el) => (dayRefs.current[i] = el)}
                                className="w-8 h-8 text-center p-0"
                                value={
                                  editedData?.day.substring(i, i + 1) || ""
                                }
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
                                    i < dayRefs.current.length - 1 &&
                                    dayRefs.current[i + 1]
                                  ) {
                                    dayRefs.current[i + 1]?.focus();
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
                          {index === 0 && "14-18"}
                          {index === 1 && "19-23"}
                          {index === 2 && "24-26"}
                          {index === 3 && "27-28"}
                          {index === 4 && "30-32"}
                          {index === 5 && "33-35"}
                          {index === 6 && "36-39"}
                          {index === 7 && "40-42"}
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
                          {index === 0 && "43-45"}
                          {index === 1 && "46-48"}
                          {index === 2 && "49-50"}
                          {index === 3 && "51-53"}
                          {index === 4 && "54-55"}
                          {index === 5 && "56"}
                          {index === 6 && "57-59"}
                          {index === 7 && "60-63"}
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
                                handleMeasurementChange(
                                  index + 8,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            displayData?.measurements[index + 8] || ""
                          )}
                        </td>
                        {index === 0 && (
                          <>
                            <td className="border border-gray-300 p-2 text-center">
                              Wind Direction Code
                              <br />
                              For Punching only
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              14-15
                            </td>
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <td className="border border-gray-300 p-2 text-center">
                              Time
                              <br />
                              (UTC)
                            </td>
                          </>
                        )}
                      </tr>
                    ))}

                    {/* Rest of the table content remains the same as in the original component */}
                    {/* Meteor Codes Row */}
                    <tr>
                      <td colSpan={2} className="border border-gray-300 p-2">
                        17. Misc.
                        <br />
                        Meteors Cods
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        1
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        2
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        3
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        4
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        5
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        6
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        7
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        8
                      </td>
                      <td
                        colSpan={3}
                        className="border border-gray-300 p-2 text-center align-middle"
                      >
                        {/* Wind Direction Table - Top Section */}
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
                                          editedData?.windDirection ===
                                          wind.direction
                                        }
                                        onChange={() =>
                                          handleWindDirectionChange(
                                            wind.direction
                                          )
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
                      <td
                        colSpan={2}
                        className="border border-gray-300 p-2"
                      ></td>
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
                      <td className="border border-gray-300 p-2 text-center">
                        Fog
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        Mist
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        Haze
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        Hail
                      </td>
                      <td
                        colSpan={3}
                        className="border border-gray-300 p-2 text-center align-middle"
                      >
                        {/* Continue Wind Direction Table */}
                      </td>
                    </tr>

                    {/* Meteor Codes Row */}
                    <tr>
                      <td
                        colSpan={2}
                        className="border border-gray-300 p-2"
                      ></td>
                      <td className="border border-gray-300 p-2 text-center">
                        64
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        65
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        66
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        67
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        68
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        69
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        70
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        71
                      </td>
                      <td
                        colSpan={3}
                        className="border border-gray-300 p-2 text-center align-middle"
                      >
                        {/* Continue Wind Direction Table */}
                      </td>
                    </tr>

                    {/* Meteor Values Row */}
                    <tr>
                      <td
                        colSpan={2}
                        className="border border-gray-300 p-2"
                      ></td>
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
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
                        colSpan={3}
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
                                          editedData?.windDirection ===
                                          wind.direction
                                        }
                                        onChange={() =>
                                          handleWindDirectionChange(
                                            wind.direction
                                          )
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
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        Character
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center font-bold"
                        colSpan={2}
                      >
                        72-73
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        Character
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center font-bold"
                        colSpan={2}
                      >
                        74-75
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        Character
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center font-bold"
                        colSpan={2}
                      >
                        76-77
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold">
                        Character
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center font-bold"
                        colSpan={2}
                      >
                        78-80
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
                            (item) =>
                              item.id === displayData?.characterCodes.drizzle
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
                            (item) =>
                              item.id === displayData?.characterCodes.contRain
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
                            (item) =>
                              item.id === displayData?.characterCodes.shower
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
                            onChange={(e) =>
                              handleWindTimeChange(e.target.value)
                            }
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
        </div>
      ) : (
        <div className="py-10">
          <p className="text-muted-foreground">
            No weather data found for the selected filters
          </p>
        </div>
      )}
    </div>
  );
}
