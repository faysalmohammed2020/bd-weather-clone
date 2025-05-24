"use client";

import { MeteorologicalEntry } from "@prisma/client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type TimeData = {
  time: string;
  yesterday: {
    utcTime: string;
    meteorologicalEntry: MeteorologicalEntry;
  };
  hasMeteorologicalData: boolean;
  hasWeatherObservation: boolean;
  hasSynopticCode: boolean;
  hasDailySummary: boolean;
};

type HourContextType = {
  selectedHour: string;
  setSelectedHour: (hour: string) => void;
  timeData: TimeData | null;
  error: string;
  isLoading: boolean;
  clearError: () => void;
  hasDataForHour: (dataType: 'meteorological' | 'weather' | 'synoptic' | 'summary') => boolean;
  isHourSelected: boolean;
  getFormattedTime: () => string | null;
};

const HourContext = createContext<HourContextType | undefined>(undefined);

export function HourProvider({ children }: { children: ReactNode }) {
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedHour) {
      setTimeData(null);
      return;
    }
    
    setIsLoading(true);

    const fetchTime = async () => {
      try {
        const response = await fetch(`/api/time-check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hour: selectedHour }),
        });
        
        const data = await response.json();
        console.log("data", data)
        setTimeData(data);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setTimeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTime();
  }, [selectedHour]);

  const clearError = () => setError("");
  
  const hasDataForHour = (dataType: 'meteorological' | 'weather' | 'synoptic' | 'summary'): boolean => {
    if (!timeData) return false;
    
    switch (dataType) {
      case 'meteorological':
        return timeData.hasMeteorologicalData;
      case 'weather':
        return timeData.hasWeatherObservation;
      case 'synoptic':
        return timeData.hasSynopticCode;
      case 'summary':
        return timeData.hasDailySummary;
      default:
        return false;
    }
  };
  
  const isHourSelected = selectedHour !== "";
  
  const getFormattedTime = (): string | null => {
    if (!timeData?.time) return null;
    return timeData.time;
  };

  const value = {
    selectedHour,
    setSelectedHour,
    timeData,
    error,
    isLoading,
    clearError,
    hasDataForHour,
    isHourSelected,
    getFormattedTime,
  };

  return <HourContext.Provider value={value}>{children}</HourContext.Provider>;
}

export function useHour() {
  const context = useContext(HourContext);
  if (context === undefined) {
    throw new Error("useHour must be used within a HourProvider");
  }
  return context;
}
