"use client";

import { MeteorologicalEntry } from "@prisma/client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

type TimeData = {
  time: string;
  yesterday: {
    meteorologicalEntry: MeteorologicalEntry | null;
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
  firstCardError: string;
  secondCardError: string;
  isLoading: boolean;
  clearError: () => void;
  isHourSelected: boolean;
};

const HourContext = createContext<HourContextType | undefined>(undefined);

export function HourProvider({ children }: { children: ReactNode }) {
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [firstCardError, setFirstCardError] = useState<string>("");
  const [secondCardError, setSecondCardError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();
  
  // Fetching time data
  const fetchTime = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/time-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hour: selectedHour }),
      });
      
      const data = await response.json();

      if(data.error) {
        toast.error(data.message)
        setTimeData(null);
        return;
      }

      if(data.found) {
        setFirstCardError(data.message);
        setTimeData(null);
        return;
      }

      if(!data.found) {
        setSecondCardError(data.message);
        setTimeData(null);
        return;
      }

      if(data.hasWeatherObservation) {
        setSecondCardError("Weather observation already exists for this hour");
        setTimeData(null);
        return;
      }

      setTimeData(data);
    } catch (err) {
      setFirstCardError(err instanceof Error ? err.message : String(err));
      setSecondCardError(err instanceof Error ? err.message : String(err));
      setTimeData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHour]);


  // Call the fetch
  useEffect(() => {
    if (!selectedHour) {
      setTimeData(null);
      return;
    }

    fetchTime();
  }, [selectedHour, fetchTime]);

  // Reset stats 
  useEffect(() => {
    return () => {
      setSelectedHour("");
      setTimeData(null);
      setFirstCardError("");
      setSecondCardError("");
      setIsLoading(false);
    };
  }, [pathname]);

  const clearError = () => {
    setFirstCardError("");
    setSecondCardError("");
  };
  
  const value = {
    selectedHour,
    setSelectedHour,
    timeData,
    firstCardError,   
    secondCardError,
    isLoading,
    clearError,
    isHourSelected: selectedHour !== "",
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
