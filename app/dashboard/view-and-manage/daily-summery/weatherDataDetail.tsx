"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface WeatherDataDetailProps {
  data: WeatherData;
  stations: StationInfo[];
}

export default function WeatherDataDetail({
  data,
  stations,
}: WeatherDataDetailProps) {
  const [open, setOpen] = useState(false);

  // Get station name by ID
  const getStationName = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    return station ? station.name : stationId;
  };

  // Character code labels
  const characterLabels = {
    drizzle: {
      lightDrizzle: "Light Drizzle",
      modDrizzle: "Mod Drizzle",
      heavyDrizzle: "Heavy Drizzle",
    },
    contRain: {
      lightContRain: "Light Cont. Rain",
      modContRain: "Mod Con. Rain",
      heavyContRain: "Heavy Cont. Rain",
    },
    interRain: {
      lightInterRain: "Light Inter. Rain",
      modInterRain: "Mod. Inter. Rain",
      heavyInterRain: "Heavy Inter. Rain",
    },
    shower: {
      lightShower: "Light Shower",
      modShower: "Mod Shower",
      heavyShower: "Heavy Shower",
    },
  };

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
    "Av. Rel Humidity",
    "Av. Wind Speed",
    "Prevailing Wind Direction (16Pts)",
    "Max Wind Speed",
    "Direction of Max Wind (16Pts)",
    "Av. Total Cloud",
    "Lowest visibility",
    "Total Duration of Rain (H-M)",
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

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Weather Data Details</DialogTitle>
            <DialogDescription>
              Detailed view of weather data for {getStationName(data.stationNo)}{" "}
              on {data.day}/{data.month}/{data.year}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="meteor">Meteor Codes</TabsTrigger>
              <TabsTrigger value="character">Character Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Data Type
                  </h3>
                  <p className="text-lg font-semibold">{data.dataType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Station
                  </h3>
                  <p className="text-lg font-semibold">
                    {getStationName(data.stationNo)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Date
                  </h3>
                  <p className="text-lg font-semibold">
                    {data.day}/{data.month}/{data.year}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Wind Direction
                  </h3>
                  <p className="text-lg font-semibold">
                    {data.windDirection || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Wind Time (UTC)
                  </h3>
                  <p className="text-lg font-semibold">
                    {data.windTime || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Submitted At
                  </h3>
                  <p className="text-lg font-semibold">
                    {new Date(data.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="measurements">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Measurement</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measurementLabels.map((label, index) => (
                    <TableRow key={index}>
                      <TableCell>{label}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {index === 0 && "14-18"}
                        {index === 1 && "19-23"}
                        {index === 2 && "24-26"}
                        {index === 3 && "27-28"}
                        {index === 4 && "30-32"}
                        {index === 5 && "33-35"}
                        {index === 6 && "36-39"}
                        {index === 7 && "40-42"}
                        {index === 8 && "43-45"}
                        {index === 9 && "46-48"}
                        {index === 10 && "49-50"}
                        {index === 11 && "51-53"}
                        {index === 12 && "54-55"}
                        {index === 13 && "56"}
                        {index === 14 && "57-59"}
                        {index === 15 && "60-63"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {data.measurements[index] || "N/A"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="meteor">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meteor</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meteorLabels.map((label, index) => (
                    <TableRow key={index}>
                      <TableCell>{label}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {index === 0 && "64"}
                        {index === 1 && "65"}
                        {index === 2 && "66"}
                        {index === 3 && "67"}
                        {index === 4 && "68"}
                        {index === 5 && "69"}
                        {index === 6 && "70"}
                        {index === 7 && "71"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {data.meteorCodes[index] || "N/A"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="character">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-md">
                    <h3 className="font-medium text-purple-700 mb-2">
                      Drizzle (72-73)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Selected:</span>
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-700"
                        >
                          {characterLabels.drizzle[
                            data.characterCodes
                              .drizzle as keyof typeof characterLabels.drizzle
                          ] || "None"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Code:</span>
                        <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {data.characterCodes.drizzle === "lightDrizzle" &&
                            "01"}
                          {data.characterCodes.drizzle === "modDrizzle" && "02"}
                          {data.characterCodes.drizzle === "heavyDrizzle" &&
                            "03"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-md">
                    <h3 className="font-medium text-purple-700 mb-2">
                      Cont. Rain (74-75)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Selected:</span>
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-700"
                        >
                          {characterLabels.contRain[
                            data.characterCodes
                              .contRain as keyof typeof characterLabels.contRain
                          ] || "None"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Code:</span>
                        <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {data.characterCodes.contRain === "lightContRain" &&
                            "04"}
                          {data.characterCodes.contRain === "modContRain" &&
                            "05"}
                          {data.characterCodes.contRain === "heavyContRain" &&
                            "06"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-md">
                    <h3 className="font-medium text-purple-700 mb-2">
                      Inter. Rain (76-77)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Selected:</span>
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-700"
                        >
                          {characterLabels.interRain[
                            data.characterCodes
                              .interRain as keyof typeof characterLabels.interRain
                          ] || "None"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Code:</span>
                        <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {data.characterCodes.interRain === "lightInterRain" &&
                            "07"}
                          {data.characterCodes.interRain === "modInterRain" &&
                            "08"}
                          {data.characterCodes.interRain === "heavyInterRain" &&
                            "09"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-md">
                    <h3 className="font-medium text-purple-700 mb-2">
                      Shower (78-80)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Selected:</span>
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-700"
                        >
                          {characterLabels.shower[
                            data.characterCodes
                              .shower as keyof typeof characterLabels.shower
                          ] || "None"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Code:</span>
                        <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {data.characterCodes.shower === "lightShower" && "10"}
                          {data.characterCodes.shower === "modShower" && "11"}
                          {data.characterCodes.shower === "heavyShower" && "12"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
