// components/station-management.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { Station } from "@/data/stations";

interface StationManagementProps {
  initialStations: Station[];
}

export function StationManagement({ initialStations }: StationManagementProps) {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStation, setNewStation] = useState<Partial<Station>>({
    name: "",
    stationId: "",
    securityCode: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editData, setEditData] = useState<Station>({
    stationId: "",
    name: "",
    securityCode: "",
  });

  // Load stations from API on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("/api/stations");
        if (response.ok) {
          const data = await response.json();
          setStations(data);
        }
      } catch (error) {
        console.error("Failed to fetch stations:", error);
      }
    };
    fetchStations();
  }, []);

  const handleAddStation = async () => {
    if (!newStation.name || !newStation.securityCode) {
      toast.error("Name and Security Code are required");
      return;
    }

    try {
      const response = await fetch("/api/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStation),
      });

      if (response.ok) {
        const addedStation = await response.json();
        setStations([...stations, addedStation]);
        setNewStation({ name: "", securityCode: "" });
        setIsAdding(false);
        toast.success("Station added successfully");
      } else {
        throw new Error("Failed to add station");
      }
    } catch (error) {
      console.error("Error adding station:", error);
      toast.error("Failed to add station");
    }
  };

  const handleUpdateStation = async () => {
    if (!editData.name || !editData.securityCode) {
      toast.error("Name and Security Code are required");
      return;
    }

    try {
      const response = await fetch(`/api/stations/${editData.stationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedStation = await response.json();
        setStations(
          stations.map((station) =>
            station.stationId === updatedStation.id ? updatedStation : station
          )
        );
        setEditingId(null);
        toast.success("Station updated successfully");
      } else {
        throw new Error("Failed to update station");
      }
    } catch (error) {
      console.error("Error updating station:", error);
      toast.error("Failed to update station");
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this station?")) return;

    try {
      const response = await fetch(`/api/stations/${stationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStations(
          stations.filter((station) => station.stationId !== stationId)
        );
        toast.success("Station deleted successfully");
      } else {
        throw new Error("Failed to delete station");
      }
    } catch (error) {
      console.error("Error deleting station:", error);
      toast.error("Failed to delete station");
    }
  };

  const startEditing = (station: Station) => {
    setEditingId(station.stationId);
    setEditData({ ...station });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Station Management</h2>
        <Button onClick={() => setIsAdding(true)}>
          <FiPlus className="mr-2" />
          Add New Station
        </Button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={newStation.name}
                onChange={(e) =>
                  setNewStation({ ...newStation, name: e.target.value })
                }
                placeholder="Station name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ID</label>
              <Input
                value={newStation.stationId || ""}
                onChange={(e) =>
                  setNewStation({ ...newStation, stationId: e.target.value })
                }
                placeholder="Station ID (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Security Code
              </label>
              <Input
                value={newStation.securityCode}
                onChange={(e) =>
                  setNewStation({ ...newStation, securityCode: e.target.value })
                }
                placeholder="Security code"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddStation}>
              <FiSave className="mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              <FiX className="mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Security Code</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map((station) => (
              <TableRow key={station.stationId}>
                <TableCell>
                  {editingId === station.stationId ? (
                    <Input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  ) : (
                    station.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === station.stationId ? (
                    <Input
                      value={editData.stationId}
                      onChange={(e) =>
                        setEditData({ ...editData, stationId: e.target.value })
                      }
                    />
                  ) : (
                    station.stationId
                  )}
                </TableCell>
                <TableCell>
                  {editingId === station.stationId ? (
                    <Input
                      value={editData.securityCode}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          securityCode: e.target.value,
                        })
                      }
                    />
                  ) : (
                    station.securityCode
                  )}
                </TableCell>
                <TableCell>
                  {editingId === station.stationId ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateStation}>
                        <FiCheck className="mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        <FiX className="mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(station)}
                      >
                        <FiEdit className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteStation(station.stationId)}
                      >
                        <FiTrash2 className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
