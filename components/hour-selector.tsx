"use client";

import { useState } from "react";
import { useHour } from "@/contexts/hourContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { addTime } from "@/app/action/time";
import { toast } from "sonner";

const HourSelector = () => {
  const {
    selectedHour,
    setSelectedHour,
    error,
    isLoading,
    clearError,
    timeData,
  } = useHour();

  const [newHour, setNewHour] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleHourChange = (value: string) => {
    if (!value) {
      return;
    }
    clearError();
    setSelectedHour(value);
  };

  const handleAddHour = () => {
    if (newHour) {
      addTime(newHour).then((response) => {
        if (response.success) {
          toast.success("Hour added successfully!");
          setDialogOpen(false);
          setNewHour("");
        }

        if (!response.success) {
          toast.error(response.error);
        }
      });
    }
  };

  return (
    <div className="bg-white p-6 border rounded-lg shadow mb-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
      <label className="flex items-center text-lg font-bold text-amber-700">
        <Clock className="size-5 mr-2" />
        <span>UTC HOUR</span>
      </label>
      <div className="flex flex-col">
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
            <SelectValue
              placeholder={isLoading ? "Loading..." : "Select Hour"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="00" className="text-lg">
              00{" "}
              <span className="text-muted-foreground text-sm">(12:00 AM)</span>
            </SelectItem>
            <SelectItem value="03" className="text-lg">
              03{" "}
              <span className="text-muted-foreground text-sm">(3:00 AM)</span>
            </SelectItem>
            <SelectItem value="06" className="text-lg">
              06{" "}
              <span className="text-muted-foreground text-sm">(6:00 AM)</span>
            </SelectItem>
            <SelectItem value="09" className="text-lg">
              09{" "}
              <span className="text-muted-foreground text-sm">(9:00 AM)</span>
            </SelectItem>
            <SelectItem value="12" className="text-lg">
              12{" "}
              <span className="text-muted-foreground text-sm">(12:00 PM)</span>
            </SelectItem>
            <SelectItem value="15" className="text-lg">
              15{" "}
              <span className="text-muted-foreground text-sm">(3:00 PM)</span>
            </SelectItem>
            <SelectItem value="18" className="text-lg">
              18{" "}
              <span className="text-muted-foreground text-sm">(6:00 PM)</span>
            </SelectItem>
            <SelectItem value="21" className="text-lg">
              21{" "}
              <span className="text-muted-foreground text-sm">(9:00 PM)</span>
            </SelectItem>
          </SelectContent>
        </Select>

      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="text-lg font-medium py-6 !px-6 text-muted-foreground"
          >
            <Plus />
            <span>Add New Hour</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Observation Hour</DialogTitle>
            <DialogDescription>
              Create a new observation time slot in the database.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium mb-1 inline-block">Select Hour</label>
                <Select onValueChange={setNewHour} value={newHour}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an hour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00">00 (12:00 AM)</SelectItem>
                    <SelectItem value="03">03 (3:00 AM)</SelectItem>
                    <SelectItem value="06">06 (6:00 AM)</SelectItem>
                    <SelectItem value="09">09 (9:00 AM)</SelectItem>
                    <SelectItem value="12">12 (12:00 PM)</SelectItem>
                    <SelectItem value="15">15 (3:00 PM)</SelectItem>
                    <SelectItem value="18">18 (6:00 PM)</SelectItem>
                    <SelectItem value="21">21 (9:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHour} disabled={!newHour}>
              Add Hour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-amber-50 border rounded-sm border-amber-300 px-4 py-2.5">
      {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default HourSelector;
