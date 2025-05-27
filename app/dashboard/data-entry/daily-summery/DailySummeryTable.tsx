"use client";

import { Fragment, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { utcToHour } from "@/lib/utils";

interface Data {
  id: string;
  utcTime: string;
  localTime: string;
  station: {
    stationId: string;
    stationName: string;
  };
  MeteorologicalEntry: Array<{
    id: string;
    stationLevelPressure: string;
    correctedSeaLevelPressure: string;
    dryBulbAsRead: string;
    wetBulbAsRead: string;
    maxMinTempAsRead: string;
    Td: string;
    relativeHumidity: string;
    horizontalVisibility: string;
  }>;
  WeatherObservation: Array<{
    id: string;
    windSpeed: string;
    windDirection: string;
    totalCloudAmount: string;
    rainfallLast24Hours: string;
    rainfallTimeStart: string;
    rainfallTimeEnd: string;
  }>;
  DailySummary: {
    id: string;
    dataType: string;
    avStationPressure: string;
    avSeaLevelPressure: string;
    avDryBulbTemperature: string;
    avWetBulbTemperature: string;
    maxTemperature: string;
    minTemperature: string;
    totalPrecipitation: string;
    avDewPointTemperature: string;
    avRelativeHumidity: string;
    windSpeed: string;
    windDirectionCode: string;
    maxWindSpeed: string;
    maxWindDirection: string;
    avTotalCloud: string;
    lowestVisibility: string;
    totalRainDuration: string;
    ObservingTime: {
      utcTime: string;
      station: {
        stationId: string;
        stationName: string;
      };
    };
  };
}

const observationTimes = ["00", "03", "06", "09", "12", "15", "18", "21"];

// State types
type ObservationState = {
  firstCardData: Data["MeteorologicalEntry"][];
  secondCardData: Data["WeatherObservation"][];
  dailySummary: Data["DailySummary"][];
};

export function WeatherDataTable() {
  const { data: session } = useSession();
  const [observations, setObservations] = useState<ObservationState>({
    firstCardData: [],
    secondCardData: [],
    dailySummary: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [firstCardPromise, secondCardPromise, dailySummaryPromise] =
        await Promise.all([
          fetch("/api/first-card-data"),
          fetch("/api/second-card-data"),
          fetch("/api/daily-summary"),
        ]);

      const [firstCardData, secondCardData, dailySummary] = await Promise.all([
        firstCardPromise.json(),
        secondCardPromise.json(),
        dailySummaryPromise.json(),
      ]);

      setObservations({
        firstCardData: firstCardData.entries,
        secondCardData,
        dailySummary,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  console.log(observations);

  const formatValue = (value: string | null | undefined, unit?: string) => {
    if (!value || value === "" || value === "null") return "--";
    const numValue = Number.parseFloat(value);
    if (isNaN(numValue)) return value;
    return `${numValue.toFixed(1)}${unit ? ` ${unit}` : ""}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Error: {error}</span>
          </div>
          <Button onClick={fetchData} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Time (UTC)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Station Pressure (hPa)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Sea Level Pressure (hPa)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Dry Bulb Temp (°C)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Wet Bulb Temp (°C)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Dew Point (°C)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Humidity (%)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Visibility (km)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Wind Speed (m/s)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Wind Dir
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Cloud (octas)
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Rainfall (mm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Determine the maximum length between both arrays */}
                {Array.from({
                  length: Math.max(
                    observations.firstCardData.length,
                    observations.secondCardData.length
                  ),
                }).map((_, index) => {
                  const firstData = observations.firstCardData[index];
                  const secondData = observations.secondCardData[index];

                  return (
                    <tr
                      key={index}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                    >
                      {/* First Card Data (if exists) */}
                      {firstData ? (
                        <>
                          <td className="px-4 py-3 text-center">
                            {utcToHour(firstData?.utcTime)}
                          </td>
                          {firstData.MeteorologicalEntry.map(
                            (meteoData, subIndex) => (
                              <Fragment key={`first-${index}-${subIndex}`}>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(meteoData?.stationLevelPressure)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(
                                    meteoData?.correctedSeaLevelPressure
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(meteoData?.dryBulbAsRead)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(meteoData?.wetBulbAsRead)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(meteoData?.Td)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(meteoData?.relativeHumidity)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(meteoData?.horizontalVisibility)}
                                </td>
                              </Fragment>
                            )
                          )}
                        </>
                      ) : (
                        // Render empty cells if firstData is missing
                        Array(8)
                          .fill(null)
                          .map((_, i) => (
                            <td
                              key={`empty-first-${i}`}
                              className="px-4 py-3 text-center"
                            >
                              -
                            </td>
                          ))
                      )}

                      {/* Second Card Data (if exists) */}
                      {secondData ? (
                        <>
                          {secondData.WeatherObservation.map(
                            (weatherData, subIndex) => (
                              <Fragment key={`second-${index}-${subIndex}`}>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(weatherData?.windSpeed)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(weatherData?.windDirection)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(weatherData?.totalCloudAmount)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {formatValue(
                                    weatherData?.rainfallLast24Hours
                                  )}
                                </td>
                              </Fragment>
                            )
                          )}
                        </>
                      ) : (
                        // Render empty cells if secondData is missing
                        Array(6)
                          .fill(null)
                          .map((_, i) => (
                            <td
                              key={`empty-second-${i}`}
                              className="px-4 py-3 text-center"
                            >
                              -
                            </td>
                          ))
                      )}
                    </tr>
                  );
                })}

                {/* Daily Summary Row */}
                {observations.dailySummary.map((data, index) => {
                  return (
                    <tr
                      key={`daily-${index}`}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                    >
                      <td className="px-4 py-3 text-center">Daily Summary</td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.avStationPressure)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.avSeaLevelPressure)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.avDryBulbTemperature)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.avWetBulbTemperature)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data.avDewPointTemperature)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.avRelativeHumidity)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.windSpeed)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.windDirectionCode)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.lowestVisibility)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.avTotalCloud)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatValue(data?.totalPrecipitation)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* No Data Message */}
      {observations.firstCardData.length === 0 &&
        observations.secondCardData.length === 0 &&
        observations.dailySummary.length === 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                No Data Available
              </h3>
              <p className="text-yellow-700">
                No weather observations or daily summary found for{" "}
                {selectedDate}. Please ensure both first card and second card
                data have been submitted.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
