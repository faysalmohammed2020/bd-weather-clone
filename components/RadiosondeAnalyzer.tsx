"use client";

import type React from "react";
import Tephigram from "@/components/Tephigram";
import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Cloud,
  Wind,
  Thermometer,
  Droplets,
  Upload,
  FileText,
  File,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

interface DecodedLevel {
  pressure: number;
  height: number | null;
  temperature: number | null;
  dewpoint: number | null;
  windDirection: number | null;
  windSpeed: number | null;
  dewpointDepression: number | null;
}

interface DecodedData {
  station: string;
  date: number;
  time: number;
  surfacePressure: number;
  surfaceTemperature: number;
  surfaceDewpointDepression: number;
  surfaceWindDirection: number;
  surfaceWindSpeed: number;
  mandatoryLevels: DecodedLevel[];
  significantLevels: DecodedLevel[];
  tropopause: {
    pressure: number;
    temperature: number;
    dewpoint: number;
    windDirection: number;
    windSpeed: number;
  } | null;
  maxWind: {
    pressure: number;
    windDirection: number;
    windSpeed: number;
  } | null;
}

export default function RadiosondeAnalyzer() {
  const t = useTranslations("RadiosondeAnalyzer");
  const [ttaaData, setTtaaData] = useState("");
  const [ttbbData, setTtbbData] = useState("");
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // File processing function
  const processFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };

      if (file.type === "application/pdf") {
        reader.readAsText(file);
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setIsLoading(true);
      setErrors([]);

      try {
        const fileArray = Array.from(files);
        setUploadedFiles(fileArray);

        let combinedContent = "";

        for (const file of fileArray) {
          try {
            const content = await processFile(file);

            if (file.type === "text/csv" || file.name.endsWith(".csv")) {
              const lines = content.split("\n").filter((line) => line.trim());
              combinedContent += lines.join(" ") + "\n";
            } else {
              combinedContent += content + "\n";
            }
          } catch (error) {
            setErrors((prev) => [
              ...prev,
              `Error processing ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            ]);
          }
        }

        const lines = combinedContent.split("\n").filter((line) => line.trim());
        let ttaaContent = "";
        let ttbbContent = "";
        let currentSection = "";

        for (const line of lines) {
          if (line.includes("TTAA")) {
            currentSection = "TTAA";
            ttaaContent += line + "\n";
          } else if (line.includes("TTBB")) {
            currentSection = "TTBB";
            ttbbContent += line + "\n";
          } else if (currentSection === "TTAA") {
            ttaaContent += line + "\n";
          } else if (currentSection === "TTBB") {
            ttbbContent += line + "\n";
          } else {
            ttaaContent += line + "\n";
          }
        }

        setTtaaData(ttaaContent.trim() || combinedContent.trim());
        setTtbbData(ttbbContent.trim());
      } catch (error) {
        setErrors([
          `File processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const fakeEvent = {
          target: { files },
        } as React.ChangeEvent<HTMLInputElement>;
        await handleFileUpload(fakeEvent);
      }
    },
    [handleFileUpload]
  );

  // Height conversion based on pressure level
  const convertHeightByPressure = (
    heightCode: string,
    pressureLevel: number
  ): number | null => {
    if (heightCode === "/////" || !heightCode) return null;

    const height = Number.parseInt(heightCode);
    if (isNaN(height)) return null;

    if (pressureLevel > 850) {
      return height;
    } else if (pressureLevel === 850) {
      return 1000 + height;
    } else if (pressureLevel === 700) {
      return 2000 + height;
    } else if (pressureLevel >= 300 && pressureLevel <= 500) {
      return height * 10;
    } else if (pressureLevel >= 100 && pressureLevel <= 250) {
      return 10000 + height * 10;
    }

    return height;
  };

  // Decode temperature (TTTa format)
  const decodeTemperature = (tempCode: string): number | null => {
    if (tempCode === "/////" || !tempCode || tempCode.length < 3) return null;

    const temp = Number.parseInt(tempCode.substring(0, 3));
    if (isNaN(temp)) return null;

    const lastDigit = temp % 10;
    const tempValue = Math.floor(temp / 10);

    return lastDigit % 2 === 0 ? tempValue / 10 : -tempValue / 10;
  };

  // Decode dewpoint depression
  const decodeDewpointDepression = (ddCode: string): number | null => {
    if (!ddCode || ddCode === "//" || ddCode.length < 2) return null;

    const dd = Number.parseInt(ddCode);
    if (isNaN(dd)) return null;

    if (dd <= 50) {
      return dd / 10;
    } else {
      return dd - 50;
    }
  };

  // Decode wind direction and speed
  const decodeWind = (
    windCode: string
  ): { direction: number | null; speed: number | null } => {
    if (!windCode || windCode === "/////" || windCode.length < 5) {
      return { direction: null, speed: null };
    }

    const direction = Number.parseInt(windCode.substring(0, 3));
    const speed = Number.parseInt(windCode.substring(3, 5));

    if (isNaN(direction) || isNaN(speed)) {
      return { direction: null, speed: null };
    }

    let actualDirection = direction;
    let actualSpeed = speed;

    if (direction % 10 === 1 || direction % 10 === 6) {
      actualDirection = direction % 10 === 1 ? direction - 1 : direction - 6;
      actualSpeed = speed + 100;
    }

    return {
      direction: actualDirection * 10,
      speed: actualSpeed,
    };
  };

  const decodeTTAA = (data: string): Partial<DecodedData> => {
    const parts = data.trim().split(/\s+/);
    const errors: string[] = [];

    if (parts.length < 4) {
      errors.push("Invalid TTAA format - insufficient data");
      return { mandatoryLevels: [] };
    }

    const header = parts[1];
    const station = parts[2];

    const date = Number.parseInt(header.substring(0, 2)) - 50;
    const time = Number.parseInt(header.substring(2, 4));

    const decodeCluster = (
      pphhhCode: string,
      tttaddCode: string,
      dddffCode: string
    ) => {
      const pp = Number.parseInt(pphhhCode.substring(0, 2));
      const hhh = Number.parseInt(pphhhCode.substring(2, 5));

      let pressure = 0;
      let height = null;

      if (pp === 99)
        pressure = 1000;
      else if (pp === 0) pressure = 1000;
      else if (pp === 92) pressure = 925;
      else if (pp === 85) pressure = 850;
      else if (pp === 70) pressure = 700;
      else if (pp === 50) pressure = 500;
      else if (pp === 40) pressure = 400;
      else if (pp === 30) pressure = 300;
      else if (pp === 25) pressure = 250;
      else if (pp === 20) pressure = 200;
      else if (pp === 15) pressure = 150;
      else if (pp === 10) pressure = 100;
      else if (pp === 88)
        pressure = Number.parseInt(pphhhCode.substring(2, 5));
      else if (pp === 77)
        pressure = Number.parseInt(pphhhCode.substring(2, 5));
      else pressure = pp * 10;

      if (!isNaN(hhh)) {
        height = convertHeightByPressure(hhh.toString(), pressure);
      }

      let temperature = null;
      let dewpointDepression = null;
      let dewpoint = null;

      if (tttaddCode && tttaddCode !== "/////") {
        const ttt = Number.parseInt(tttaddCode.substring(0, 3));
        const dd = Number.parseInt(tttaddCode.substring(3, 5));

        if (!isNaN(ttt)) {
          const tempValue = ttt / 10;
          const lastDigit = ttt % 10;
          temperature = lastDigit % 2 === 0 ? tempValue : -tempValue;
        }

        if (!isNaN(dd)) {
          dewpointDepression = decodeDewpointDepression(
            dd.toString().padStart(2, "0")
          );
          if (temperature !== null && dewpointDepression !== null) {
            dewpoint = temperature - dewpointDepression;
          }
        }
      }

      let windDirection = null;
      let windSpeed = null;

      if (dddffCode && dddffCode !== "/////") {
        const ddd = Number.parseInt(dddffCode.substring(0, 3));
        const ff = Number.parseInt(dddffCode.substring(3, 5));

        if (!isNaN(ddd)) {
          windDirection = ddd;
        }

        if (!isNaN(ff)) {
          windSpeed = ff;
        }
      }

      return {
        pressure,
        height,
        temperature,
        dewpoint,
        dewpointDepression,
        windDirection,
        windSpeed,
      };
    };

    let surfacePressure = 996;
    let surfaceTemperature = 0;
    let surfaceDewpointDepression = 0;
    let surfaceWindDirection = 0;
    let surfaceWindSpeed = 0;

    if (parts.length >= 6) {
      const surfacePressureCode = parts[3];
      const surfaceTempCode = parts[4];
      const surfaceWindCode = parts[5];

      surfacePressure = Number.parseInt(surfacePressureCode.substring(2));

      if (surfaceTempCode && surfaceTempCode !== "/////") {
        const surfaceTempValue = Number.parseInt(
          surfaceTempCode.substring(0, 3)
        );
        const surfaceDDValue = Number.parseInt(surfaceTempCode.substring(3, 5));

        if (!isNaN(surfaceTempValue)) {
          const tempInTenths = surfaceTempValue / 10;
          const lastDigit = surfaceTempValue % 10;
          surfaceTemperature =
            lastDigit % 2 === 0 ? tempInTenths : -tempInTenths;
        }

        if (!isNaN(surfaceDDValue)) {
          surfaceDewpointDepression = surfaceDDValue / 10;
        }
      }

      if (surfaceWindCode && surfaceWindCode !== "/////") {
        const windDir = Number.parseInt(surfaceWindCode.substring(0, 3));
        const windSpd = Number.parseInt(surfaceWindCode.substring(3, 5));

        if (!isNaN(windDir)) surfaceWindDirection = windDir;
        if (!isNaN(windSpd)) surfaceWindSpeed = windSpd;
      }
    }

    const mandatoryLevels: DecodedLevel[] = [];
    let tropopause = null;
    let maxWind = null;

    for (let i = 6; i < parts.length; i++) {
      const pphhhCode = parts[i];

      if (!pphhhCode) break;

      if (pphhhCode.startsWith("88")) {
        if (i + 2 >= parts.length) break;
        const tttaddCode = parts[i + 1];
        const dddffCode = parts[i + 2];

        const decoded = decodeCluster(pphhhCode, tttaddCode, dddffCode);
        tropopause = {
          pressure: decoded.pressure,
          temperature: decoded.temperature || 0,
          dewpoint: decoded.dewpoint || 0,
          windDirection: decoded.windDirection || 0,
          windSpeed: decoded.windSpeed || 0,
        };
        i += 2;
      } else if (pphhhCode.startsWith("77")) {
        if (i + 1 >= parts.length) break;
        const dddffCode = parts[i + 1];

        const pressureCode = pphhhCode.substring(2, 5);
        const pressure = Number.parseInt(pressureCode);

        let windDirection = null;
        let windSpeed = null;

        if (dddffCode && dddffCode !== "/////") {
          const ddd = Number.parseInt(dddffCode.substring(0, 3));
          const ff = Number.parseInt(dddffCode.substring(3, 5));

          if (!isNaN(ddd)) windDirection = ddd;
          if (!isNaN(ff)) windSpeed = ff;
        }

        maxWind = {
          pressure: pressure,
          windDirection: windDirection || 0,
          windSpeed: windSpeed || 0,
        };
        i += 1;
      } else if (pphhhCode.startsWith("31")) {
        break;
      } else {
        if (i + 2 >= parts.length) break;
        const tttaddCode = parts[i + 1];
        const dddffCode = parts[i + 2];

        const decoded = decodeCluster(pphhhCode, tttaddCode, dddffCode);
        mandatoryLevels.push(decoded);
        i += 2;
      }
    }

    return {
      station,
      date,
      time,
      surfacePressure,
      surfaceTemperature,
      surfaceDewpointDepression,
      surfaceWindDirection,
      surfaceWindSpeed,
      mandatoryLevels,
      tropopause,
      maxWind,
    };
  };

  const decodeTTBB = (data: string): { significantLevels: DecodedLevel[] } => {
    const parts = data.trim().split(/\s+/);
    const significantLevels: DecodedLevel[] = [];

    if (parts.length < 4) {
      return { significantLevels };
    }

    const header = parts[1];
    const station = parts[2];

    const day = Number.parseInt(header.substring(0, 2)) - 50;
    const time = Number.parseInt(header.substring(2, 4));

    let surfacePressureIndex = -1;
    for (let i = 3; i < parts.length; i++) {
      if (parts[i].startsWith("00") && parts[i].length === 5) {
        surfacePressureIndex = i;
        break;
      }
    }

    if (surfacePressureIndex === -1) {
      return { significantLevels };
    }

    const surfacePressure = Number.parseInt(
      parts[surfacePressureIndex].substring(2)
    );

    if (surfacePressureIndex + 1 < parts.length) {
      const surfaceTempCode = parts[surfacePressureIndex + 1];
      if (surfaceTempCode && surfaceTempCode.length === 5) {
        const tempValue = Number.parseInt(surfaceTempCode.substring(0, 3));
        const dewpointDepressionValue = Number.parseInt(
          surfaceTempCode.substring(3, 5)
        );

        let surfaceTemp = null;
        let surfaceDewpoint = null;
        let surfaceDewpointDepression = null;

        if (!isNaN(tempValue)) {
          const lastDigit = tempValue % 10;
          surfaceTemp = lastDigit % 2 === 0 ? tempValue / 10 : -tempValue / 10;
        }

        if (!isNaN(dewpointDepressionValue)) {
          surfaceDewpointDepression = dewpointDepressionValue / 10;
          if (surfaceTemp !== null) {
            surfaceDewpoint = surfaceTemp - surfaceDewpointDepression;
          }
        }

        significantLevels.push({
          pressure: surfacePressure,
          height: null,
          temperature: surfaceTemp,
          dewpoint: surfaceDewpoint,
          dewpointDepression: surfaceDewpointDepression,
          windDirection: null,
          windSpeed: null,
        });
      }
    }

    const separatorIndex = parts.findIndex((part) => part === "21212");

    let index = surfacePressureIndex + 2;

    while (
      index < (separatorIndex === -1 ? parts.length : separatorIndex) &&
      index + 1 < parts.length
    ) {
      const pressureCode = parts[index];
      const tempCode = parts[index + 1];

      if (!pressureCode || !tempCode) break;

      if (pressureCode.length === 5 && /^[1-9][1-9]\d{3}$/.test(pressureCode)) {
        const pressure = Number.parseInt(pressureCode.substring(2));

        if (!isNaN(pressure)) {
          let temperature = null;
          let dewpoint = null;
          let dewpointDepression = null;

          if (tempCode.length === 5) {
            const tempValue = Number.parseInt(tempCode.substring(0, 3));
            const dewpointDepressionValue = Number.parseInt(
              tempCode.substring(3, 5)
            );

            if (!isNaN(tempValue)) {
              const lastDigit = tempValue % 10;
              temperature =
                lastDigit % 2 === 0 ? tempValue / 10 : -tempValue / 10;
            }

            if (!isNaN(dewpointDepressionValue)) {
              dewpointDepression = dewpointDepressionValue / 10;
              if (temperature !== null) {
                dewpoint = temperature - dewpointDepression;
              }
            }
          }

          significantLevels.push({
            pressure,
            height: null,
            temperature,
            dewpoint,
            dewpointDepression,
            windDirection: null,
            windSpeed: null,
          });
        }
      }

      index += 2;
    }

    if (separatorIndex !== -1) {
      let windIndex = separatorIndex + 1;

      while (windIndex < parts.length && windIndex + 1 < parts.length) {
        const pressureCode = parts[windIndex];
        const windCode = parts[windIndex + 1];

        if (pressureCode === "31313") {
          break;
        }

        if (!pressureCode || !windCode) break;

        if (
          pressureCode.length === 5 &&
          (/^00\d{3}$/.test(pressureCode) ||
            /^[1-9][1-9]\d{3}$/.test(pressureCode))
        ) {
          const pressure = Number.parseInt(pressureCode.substring(2));

          if (!isNaN(pressure)) {
            let windDirection = null;
            let windSpeed = null;

            if (windCode.length === 5) {
              const direction = Number.parseInt(windCode.substring(0, 3));
              const speed = Number.parseInt(windCode.substring(3, 5));

              if (!isNaN(direction)) {
                windDirection = direction;
              }

              if (!isNaN(speed)) {
                windSpeed = speed;
              }
            }

            const existingLevel = significantLevels.find(
              (level) => level.pressure === pressure
            );

            if (existingLevel) {
              existingLevel.windDirection = windDirection;
              existingLevel.windSpeed = windSpeed;
            } else {
              significantLevels.push({
                pressure,
                height: null,
                temperature: null,
                dewpoint: null,
                dewpointDepression: null,
                windDirection,
                windSpeed,
              });
            }
          }
        }

        windIndex += 2;
      }
    }

    significantLevels.sort((a, b) => b.pressure - a.pressure);

    return { significantLevels };
  };

  const analyzeData = () => {
    setErrors([]);
    setIsLoading(true);

    if (!ttaaData.trim()) {
      setErrors([t("errors.ttaaRequired")]);
      setIsLoading(false);
      return;
    }

    try {
      const ttaaDecoded = decodeTTAA(ttaaData);
      const ttbbDecoded = ttbbData.trim()
        ? decodeTTBB(ttbbData)
        : { significantLevels: [] };

      const combined: DecodedData = {
        station: ttaaDecoded.station || "",
        date: ttaaDecoded.date || 0,
        time: ttaaDecoded.time || 0,
        surfacePressure: ttaaDecoded.surfacePressure || 0,
        surfaceTemperature: ttaaDecoded.surfaceTemperature || 0,
        surfaceDewpointDepression: ttaaDecoded.surfaceDewpointDepression || 0,
        surfaceWindDirection: ttaaDecoded.surfaceWindDirection || 0,
        surfaceWindSpeed: ttaaDecoded.surfaceWindSpeed || 0,
        mandatoryLevels: ttaaDecoded.mandatoryLevels || [],
        significantLevels: ttbbDecoded.significantLevels,
        tropopause: ttaaDecoded.tropopause,
        maxWind: ttaaDecoded.maxWind,
      };

      setDecodedData(combined);
    } catch (error) {
      setErrors([
        t("errors.decodingError", {
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (
    value: number | null,
    unit = "",
    decimals = 1
  ): string => {
    if (value === null) return "N/A";
    return `${value.toFixed(decimals)}${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Cloud className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Upload className="h-6 w-6" />
              {t("datainput")}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {t("filesupport")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-700">
                  {t("fileupload")}
                </span>
              </div>

              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isLoading ? t("processingfiles") : t("dropfiles")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("supportsfiles")}
                    </p>
                  </div>
                </div>
                <Input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".txt,.csv,.pdf,.dat"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {t("uploadedfiles")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        <File className="h-3 w-3 mr-1" />
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Manual Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-700">
                  {t("manualinput")}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    {t("ttaatadata")}
                  </label>
                  <Textarea
                    placeholder={t("exampledata")}
                    value={ttaaData}
                    onChange={(e) => setTtaaData(e.target.value)}
                    rows={4}
                    className="font-mono text-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    {t("ttbbdata")}
                  </label>
                  <Textarea
                    placeholder={t("exampledata")}
                    value={ttbbData}
                    onChange={(e) => setTtbbData(e.target.value)}
                    rows={4}
                    className="font-mono text-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={analyzeData}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("analyzing")}
                  </>
                ) : (
                  <>
                    <Cloud className="mr-2 h-4 w-4" />
                    {t("analyzabutton")}
                  </>
                )}
              </Button>
            </div>

            {errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {decodedData && (
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                {t("summary")}
              </TabsTrigger>
              <TabsTrigger
                value="mandatory"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                {t("mandatorylevels")}
              </TabsTrigger>
              <TabsTrigger
                value="significant"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                {t("significantlevels")}
              </TabsTrigger>
              <TabsTrigger
                value="tephigram"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                {t("tephigram")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">
                      {t("stationinfo")}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-blue-200 text-blue-800 border-blue-300"
                    >
                      {decodedData.station}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {t("day")} {decodedData.date}
                    </div>
                    <p className="text-xs text-blue-700">
                      {String(decodedData.time).padStart(2, "0")}:00 UTC
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-l-red-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">
                      {t("surfacepressure")}
                    </CardTitle>
                    <Thermometer className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-900">
                      {decodedData.surfacePressure} {t("pressuremb")}
                    </div>
                    <p className="text-xs text-red-700">
                      {t("temperature")}:{" "}
                      {formatValue(decodedData.surfaceTemperature, "°C")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">
                      {t("surfacewind")}
                    </CardTitle>
                    <Wind className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {decodedData.surfaceWindDirection}°
                    </div>
                    <p className="text-xs text-green-700">
                      {decodedData.surfaceWindSpeed} {t("windspeed")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border-l-4 border-l-cyan-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-cyan-800">
                      {t("humidity")}
                    </CardTitle>
                    <Droplets className="h-4 w-4 text-cyan-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cyan-900">
                      {formatValue(decodedData.surfaceDewpointDepression, "°C")}
                    </div>
                    <p className="text-xs text-cyan-700">
                      {t("dewpointdepression")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mandatory">
              <div>
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="text-xl">
                      {t("mandatorylevels")}
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      {t("standardlevels")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
                            <th className="text-left p-3 font-semibold text-green-800">
                              {t("pressuremb")}
                            </th>
                            <th className="text-left p-3 font-semibold text-green-800">
                              {t("heightm")}
                            </th>
                            <th className="text-left p-3 font-semibold text-green-800">
                              {t("temperaturec")}
                            </th>
                            <th className="text-left p-3 font-semibold text-green-800">
                              {t("dewpointc")}
                            </th>
                            <th className="text-left p-3 font-semibold text-green-800">
                              {t("winddir")}
                            </th>
                            <th className="text-left p-3 font-semibold text-green-800">
                              {t("windspeed")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {decodedData.mandatoryLevels
                            .filter((level) => level.pressure >= 100)
                            .map((level, index) => (
                              <tr
                                key={index}
                                className={`border-b hover:bg-green-50 transition-colors ${
                                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                              >
                                <td className="p-3 font-bold text-green-700">
                                  {level.pressure}
                                </td>
                                <td className="p-3">
                                  {formatValue(level.height, "", 0)}
                                </td>
                                <td className="p-3">
                                  {formatValue(level.temperature, "")}
                                </td>
                                <td className="p-3">
                                  {formatValue(level.dewpoint, "")}
                                </td>
                                <td className="p-3">
                                  {formatValue(level.windDirection, "", 0)}
                                </td>
                                <td className="p-3">
                                  {formatValue(level.windSpeed, "", 0)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>
                          {t("showinglevels", {
                            count: decodedData.mandatoryLevels.filter(
                              (level) => level.pressure >= 100
                            ).length,
                          })}
                        </span>
                      </div>
                      {decodedData.mandatoryLevels.filter(
                        (level) => level.pressure < 100
                      ).length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-500">
                            {t("filteredlevels", {
                              count: decodedData.mandatoryLevels.filter(
                                (level) => level.pressure < 100
                              ).length,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-100 border-l-4 border-l-emerald-500">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Cloud className="h-6 w-6" />
                        {t("tropopauselevel")}
                      </CardTitle>
                      <CardDescription className="text-emerald-100">
                        {t("tropopausedesc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {decodedData.tropopause ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-lg border border-blue-300">
                              <div className="text-xs font-medium text-blue-700 mb-1">
                                {t("pressure")}
                              </div>
                              <div className="text-lg font-bold text-blue-800">
                                {decodedData.tropopause.pressure}
                              </div>
                              <div className="text-xs text-blue-600">
                                {t("pressuremb")}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-lg border border-red-300">
                              <div className="text-xs font-medium text-red-700 mb-1">
                                {t("temperature")}
                              </div>
                              <div className="text-lg font-bold text-red-800">
                                {formatValue(
                                  decodedData.tropopause.temperature,
                                  ""
                                )}
                              </div>
                              <div className="text-xs text-red-600">°C</div>
                            </div>
                            <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 p-3 rounded-lg border border-cyan-300">
                              <div className="text-xs font-medium text-cyan-700 mb-1">
                                {t("dewpoint")}
                              </div>
                              <div className="text-lg font-bold text-cyan-800">
                                {formatValue(
                                  decodedData.tropopause.dewpoint,
                                  ""
                                )}
                              </div>
                              <div className="text-xs text-cyan-600">°C</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-lg border border-purple-300">
                              <div className="text-xs font-medium text-purple-700 mb-1">
                                {t("altitude")}
                              </div>
                              <div className="text-lg font-bold text-purple-800">
                                ~
                                {Math.round(
                                  44330 *
                                    (1 -
                                      Math.pow(
                                        decodedData.tropopause.pressure /
                                          1013.25,
                                        0.1903
                                      ))
                                )}
                              </div>
                              <div className="text-xs text-purple-600">
                                {t("heightm")}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg border border-green-300">
                              <div className="flex items-center gap-2 mb-2">
                                <Wind className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800">
                                  {t("windinfo")}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-green-700">
                                    {t("direction")}:
                                  </span>
                                  <span className="font-medium text-green-800">
                                    {decodedData.tropopause.windDirection}°
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-green-700">
                                    {t("speed")}:
                                  </span>
                                  <span className="font-medium text-green-800">
                                    {decodedData.tropopause.windSpeed}{" "}
                                    {t("windspeed")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-lg border border-amber-300">
                              <div className="flex items-center gap-2 mb-2">
                                <Thermometer className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-amber-800">
                                  {t("thermaldata")}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-amber-700">
                                    {t("depression")}:
                                  </span>
                                  <span className="font-medium text-amber-800">
                                    {formatValue(
                                      (decodedData.tropopause.temperature ||
                                        0) -
                                        (decodedData.tropopause.dewpoint || 0),
                                      "°C"
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-amber-700">
                                    {t("format")}:
                                  </span>
                                  <span className="font-mono text-xs text-amber-800 bg-amber-300 px-2 py-1 rounded">
                                    88
                                    {decodedData.tropopause.pressure
                                      .toString()
                                      .padStart(3, "0")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            {t("notropopause")}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t("looktropopause")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-l-blue-500">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Wind className="h-6 w-6" />
                        {t("maxwindlevel")}
                      </CardTitle>
                      <CardDescription className="text-blue-100">
                        {t("maxwinddesc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {decodedData.maxWind ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg border border-purple-300">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-purple-700">
                                  {t("pressure")}
                                </span>
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              </div>
                              <div className="text-2xl font-bold text-purple-800">
                                {decodedData.maxWind.pressure}
                              </div>
                              <div className="text-xs text-purple-600">
                                hPa (mb)
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-4 rounded-lg border border-green-300">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-700">
                                  {t("winddir")}
                                </span>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                              <div className="text-2xl font-bold text-green-800">
                                {decodedData.maxWind.windDirection}°
                              </div>
                              <div className="text-xs text-green-600">
                                {decodedData.maxWind.windDirection >= 337.5 ||
                                decodedData.maxWind.windDirection < 22.5
                                  ? "from N"
                                  : decodedData.maxWind.windDirection >= 22.5 &&
                                      decodedData.maxWind.windDirection < 67.5
                                    ? "from NE"
                                    : decodedData.maxWind.windDirection >=
                                          67.5 &&
                                        decodedData.maxWind.windDirection <
                                          112.5
                                      ? "from E"
                                      : decodedData.maxWind.windDirection >=
                                            112.5 &&
                                          decodedData.maxWind.windDirection <
                                            157.5
                                        ? "from SE"
                                        : decodedData.maxWind.windDirection >=
                                              157.5 &&
                                            decodedData.maxWind.windDirection <
                                              202.5
                                          ? "from S"
                                          : decodedData.maxWind.windDirection >=
                                                202.5 &&
                                              decodedData.maxWind
                                                .windDirection < 247.5
                                            ? "from SW"
                                            : decodedData.maxWind
                                                  .windDirection >= 247.5 &&
                                                decodedData.maxWind
                                                  .windDirection < 292.5
                                              ? "from W"
                                              : "from NW"}
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-100 to-red-200 p-4 rounded-lg border border-orange-300">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-orange-700">
                                  {t("windspeed")}
                                </span>
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              </div>
                              <div className="text-2xl font-bold text-orange-800">
                                {decodedData.maxWind.windSpeed}
                              </div>
                              <div className="text-xs text-orange-600">
                                {t("windspeed")}
                              </div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="bg-gradient-to-r from-slate-100 to-gray-200 p-4 rounded-lg border border-slate-300">
                            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                              {t("decodingdetails")}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    {t("clusterformat")}:
                                  </span>
                                  <span className="font-mono text-slate-800 bg-slate-300 px-2 py-1 rounded">
                                    77
                                    {decodedData.maxWind.pressure
                                      .toString()
                                      .padStart(3, "0")}{" "}
                                    {decodedData.maxWind.windDirection
                                      .toString()
                                      .padStart(3, "0")}
                                    {decodedData.maxWind.windSpeed
                                      .toString()
                                      .padStart(2, "0")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    {t("group")} 1:
                                  </span>
                                  <span className="font-mono text-blue-700 bg-blue-200 px-2 py-1 rounded">
                                    77
                                    {decodedData.maxWind.pressure
                                      .toString()
                                      .padStart(3, "0")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    {t("group")} 2:
                                  </span>
                                  <span className="font-mono text-green-700 bg-green-200 px-2 py-1 rounded">
                                    {decodedData.maxWind.windDirection
                                      .toString()
                                      .padStart(3, "0")}
                                    {decodedData.maxWind.windSpeed
                                      .toString()
                                      .padStart(2, "0")}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">77 →</span>
                                  <span className="text-blue-800 font-medium">
                                    {t("maxwindindicator")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    {decodedData.maxWind.pressure
                                      .toString()
                                      .padStart(3, "0")}{" "}
                                    →
                                  </span>
                                  <span className="text-purple-800 font-medium">
                                    {t("pressurelevel")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    {decodedData.maxWind.windDirection
                                      .toString()
                                      .padStart(3, "0")}{" "}
                                    →
                                  </span>
                                  <span className="text-green-800 font-medium">
                                    {t("winddir")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">
                                    {decodedData.maxWind.windSpeed
                                      .toString()
                                      .padStart(2, "0")}{" "}
                                    →
                                  </span>
                                  <span className="text-orange-800 font-medium">
                                    {t("windspeed")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Wind className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            {t("nomaxwind")}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t("lookmaxwind")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="significant">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl">
                    {t("significantlevels")}
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    {t("significantdesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {decodedData.significantLevels.length > 0 ? (
                    <Tabs defaultValue="temperature" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2 bg-orange-50 border border-orange-200">
                        <TabsTrigger
                          value="temperature"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
                        >
                          <Thermometer className="h-4 w-4 mr-2" />
                          {t("temperaturedata")}
                        </TabsTrigger>
                        <TabsTrigger
                          value="wind"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
                        >
                          <Wind className="h-4 w-4 mr-2" />
                          {t("winddata")}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="temperature" className="space-y-4">
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <Thermometer className="h-5 w-5" />
                            {t("temperaturedata")}
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b-2 border-red-200 bg-gradient-to-r from-red-100 to-orange-100">
                                  <th className="text-left p-3 font-semibold text-red-800">
                                    {t("pressuremb")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-red-800">
                                    {t("temperaturec")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-red-800">
                                    {t("dewpointc")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-red-800">
                                    {t("depression")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-red-800">
                                    {t("datasource")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {decodedData.significantLevels
                                  .filter(
                                    (level) =>
                                      level.temperature !== null ||
                                      level.dewpoint !== null
                                  )
                                  .map((level, index) => (
                                    <tr
                                      key={index}
                                      className={`border-b hover:bg-red-50 transition-colors ${
                                        index % 2 === 0
                                          ? "bg-gray-50"
                                          : "bg-white"
                                      }`}
                                    >
                                      <td className="p-3 font-bold text-red-700">
                                        {level.pressure}
                                      </td>
                                      <td className="p-3">
                                        {formatValue(level.temperature, "")}
                                      </td>
                                      <td className="p-3">
                                        {formatValue(level.dewpoint, "")}
                                      </td>
                                      <td className="p-3">
                                        {formatValue(
                                          level.dewpointDepression,
                                          ""
                                        )}
                                      </td>
                                      <td className="p-3">
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${
                                            level.pressure ===
                                            decodedData.surfacePressure
                                              ? "bg-blue-100 text-blue-800 border-blue-300"
                                              : "bg-orange-100 text-orange-800 border-orange-300"
                                          }`}
                                        >
                                          {level.pressure ===
                                          decodedData.surfacePressure
                                            ? t("surface")
                                            : t("significant")}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-4 text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>
                                  {t("temperaturelevels")}:{" "}
                                  {
                                    decodedData.significantLevels.filter(
                                      (l) => l.temperature !== null
                                    ).length
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                <span>
                                  {t("dewpointlevels")}:{" "}
                                  {
                                    decodedData.significantLevels.filter(
                                      (l) => l.dewpoint !== null
                                    ).length
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>
                                  {t("surfaceincluded")}:{" "}
                                  {decodedData.significantLevels.some(
                                    (l) =>
                                      l.pressure === decodedData.surfacePressure
                                  )
                                    ? t("yes")
                                    : t("no")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="wind" className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <Wind className="h-5 w-5" />
                            {t("winddata")}
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-100 to-cyan-100">
                                  <th className="text-left p-3 font-semibold text-blue-800">
                                    {t("pressuremb")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-blue-800">
                                    {t("winddir")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-blue-800">
                                    {t("windspeed")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-blue-800">
                                    {t("cardinaldir")}
                                  </th>
                                  <th className="text-left p-3 font-semibold text-blue-800">
                                    {t("datasource")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {decodedData.significantLevels
                                  .filter(
                                    (level) =>
                                      level.windDirection !== null ||
                                      level.windSpeed !== null
                                  )
                                  .map((level, index) => (
                                    <tr
                                      key={index}
                                      className={`border-b hover:bg-blue-50 transition-colors ${
                                        index % 2 === 0
                                          ? "bg-gray-50"
                                          : "bg-white"
                                      }`}
                                    >
                                      <td className="p-3 font-bold text-blue-700">
                                        {level.pressure}
                                      </td>
                                      <td className="p-3">
                                        {formatValue(
                                          level.windDirection,
                                          "",
                                          0
                                        )}
                                      </td>
                                      <td className="p-3">
                                        {formatValue(level.windSpeed, "", 0)}
                                      </td>
                                      <td className="p-3">
                                        {level.windDirection !== null ? (
                                          <span className="text-xs font-medium text-gray-600">
                                            {level.windDirection >= 337.5 ||
                                            level.windDirection < 22.5
                                              ? "N"
                                              : level.windDirection >= 22.5 &&
                                                  level.windDirection < 67.5
                                                ? "NE"
                                                : level.windDirection >= 67.5 &&
                                                    level.windDirection < 112.5
                                                  ? "E"
                                                  : level.windDirection >=
                                                        112.5 &&
                                                      level.windDirection <
                                                        157.5
                                                    ? "SE"
                                                    : level.windDirection >=
                                                          157.5 &&
                                                        level.windDirection <
                                                          202.5
                                                      ? "S"
                                                      : level.windDirection >=
                                                            202.5 &&
                                                          level.windDirection <
                                                            247.5
                                                        ? "SW"
                                                        : level.windDirection >=
                                                              247.5 &&
                                                            level.windDirection <
                                                              292.5
                                                          ? "W"
                                                          : "NW"}
                                          </span>
                                        ) : (
                                          "N/A"
                                        )}
                                      </td>
                                      <td className="p-3">
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${
                                            level.pressure ===
                                            decodedData.surfacePressure
                                              ? "bg-green-100 text-green-800 border-green-300"
                                              : "bg-blue-100 text-blue-800 border-blue-300"
                                          }`}
                                        >
                                          {level.pressure ===
                                          decodedData.surfacePressure
                                            ? t("surface")
                                            : t("significant")}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>
                                  {t("windlevels")}:{" "}
                                  {
                                    decodedData.significantLevels.filter(
                                      (l) => l.windSpeed !== null
                                    ).length
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>
                                  {t("maxspeed")}:{" "}
                                  {Math.max(
                                    ...decodedData.significantLevels.map(
                                      (l) => l.windSpeed || 0
                                    )
                                  )}{" "}
                                  {t("windspeed")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>
                                  {t("avgspeed")}:{" "}
                                  {Math.round(
                                    decodedData.significantLevels
                                      .filter((l) => l.windSpeed !== null)
                                      .reduce(
                                        (sum, l) => sum + (l.windSpeed || 0),
                                        0
                                      ) /
                                      decodedData.significantLevels.filter(
                                        (l) => l.windSpeed !== null
                                      ).length
                                  )}{" "}
                                  {t("windspeed")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>
                                  {t("surfaceincluded")}:{" "}
                                  {decodedData.significantLevels.some(
                                    (l) =>
                                      l.pressure ===
                                        decodedData.surfacePressure &&
                                      l.windSpeed !== null
                                  )
                                    ? t("yes")
                                    : t("no")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <FileText className="h-8 w-8 text-orange-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {t("nottbbdata")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("uploadttbb")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tephigram">
              {decodedData && (
                <Tephigram
                  width="100%"
                  height={800}
                  decodedData={decodedData}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}