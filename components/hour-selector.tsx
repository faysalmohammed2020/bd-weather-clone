"use client";

import { useHour } from "@/contexts/hourContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const HourSelector = () => {
  const {
    selectedHour,
    setSelectedHour,
    error,
    isLoading,
    clearError,
    timeData,
  } = useHour();

  const handleHourChange = (value: string) => {
    if (!value) {
      return;
    }
    clearError();
    setSelectedHour(value);
  };

  return (
    <div className="bg-white p-6 border rounded-lg shadow mb-4">
      <label className="flex items-center text-lg font-bold mb-3 text-amber-700">
        <Clock className="size-5 mr-2" />
        <span>UTC HOUR</span>
      </label>
      <Select
        onValueChange={handleHourChange}
        disabled={isLoading}
        value={selectedHour}
      >
        <SelectTrigger
          className={cn("text-lg font-medium py-6 px-8", {
            "border-red-500": error,
            "border-emerald-500": timeData?.time,
          })}
        >
          <SelectValue placeholder={isLoading ? "Loading..." : "Select Hour"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="00" className="text-lg">
            00 <span className="text-muted-foreground text-sm">(12:00 AM)</span>
          </SelectItem>
          <SelectItem value="03" className="text-lg">
            03 <span className="text-muted-foreground text-sm">(3:00 AM)</span>
          </SelectItem>
          <SelectItem value="06" className="text-lg">
            06 <span className="text-muted-foreground text-sm">(6:00 AM)</span>
          </SelectItem>
          <SelectItem value="09" className="text-lg">
            09 <span className="text-muted-foreground text-sm">(9:00 AM)</span>
          </SelectItem>
          <SelectItem value="12" className="text-lg">
            12 <span className="text-muted-foreground text-sm">(12:00 PM)</span>
          </SelectItem>
          <SelectItem value="15" className="text-lg">
            15 <span className="text-muted-foreground text-sm">(3:00 PM)</span>
          </SelectItem>
          <SelectItem value="18" className="text-lg">
            18 <span className="text-muted-foreground text-sm">(6:00 PM)</span>
          </SelectItem>
          <SelectItem value="21" className="text-lg">
            21 <span className="text-muted-foreground text-sm">(9:00 PM)</span>
          </SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-red-500 mt-2 text-sm font-medium">{error}</p>
      )}
    </div>
  );
};

export default HourSelector;
