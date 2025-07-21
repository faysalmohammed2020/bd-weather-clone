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
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiCheck,
  FiMapPin,
} from "react-icons/fi";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Station {
  id: string;
  stationId: string;
  name: string;
  securityCode: string;
  latitude: number;
  longitude: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StationManagementProps {
  initialStations?: Station[];
}

export function StationManagement({
  initialStations = [],
}: StationManagementProps) {
  const t = useTranslations("StationManagement");
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStation, setNewStation] = useState<Partial<Station>>({
    name: "",
    stationId: "",
    securityCode: "",
    latitude: 23.685,
    longitude: 90.3563,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editData, setEditData] = useState<Partial<Station>>({});
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/stations");
        if (response.ok) {
          const data = await response.json();
          setStations(data);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || t("errors.fetchFailed"));
        }
      } catch (error) {
        console.error("Failed to fetch stations:", error);
        toast.error(t("errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [t]);

  const handleAddStation = async () => {
    if (!newStation.name || !newStation.stationId || !newStation.securityCode) {
      toast.error(t("errors.requiredFields"));
      return;
    }

    setLoading(true);
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
        setNewStation({
          name: "",
          stationId: "",
          securityCode: "",
          latitude: 23.685,
          longitude: 90.3563,
        });
        setIsAdding(false);
        toast.success(t("success.added"));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errors.addFailed"));
      }
    } catch (error) {
      console.error("Error adding station:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.addFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStation = async () => {
    if (!editData.name || !editData.securityCode) {
      toast.error(t("errors.requiredFields"));
      return;
    }

    if (!editingId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/stations/${editingId}`, {
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
            station.id === updatedStation.id ? updatedStation : station
          )
        );
        setEditingId(null);
        toast.success(t("success.updated"));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errors.updateFailed"));
      }
    } catch (error) {
      console.error("Error updating station:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.updateFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm(t("deleteConfirmation"))) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStations(stations.filter((station) => station.id !== id));
        toast.success(t("success.deleted"));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errors.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting station:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.deleteFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (station: Station) => {
    setEditingId(station.id);
    setEditData({ ...station });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">{t("title")}</h2>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button
            onClick={() => setIsAdding(true)}
            disabled={isAdding || loading}
            className="bg-sky-600 hover:bg-sky-400 w-full sm:w-auto"
          >
            <FiPlus className="ml-2" />
            <span className="whitespace-nowrap">{t("addStation")}</span>
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("form.name")}*</label>
              <Input
                value={newStation.name || ""}
                onChange={(e) =>
                  setNewStation({ ...newStation, name: e.target.value })
                }
                placeholder={t("form.namePlaceholder")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.stationId")}*
              </label>
              <Input
                value={newStation.stationId || ""}
                onChange={(e) =>
                  setNewStation({ ...newStation, stationId: e.target.value })
                }
                placeholder={t("form.stationIdPlaceholder")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.securityCode")}*
              </label>
              <Input
                value={newStation.securityCode || ""}
                onChange={(e) =>
                  setNewStation({ ...newStation, securityCode: e.target.value })
                }
                placeholder={t("form.securityCodePlaceholder")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("form.latitude")}</label>
              <Input
                type="number"
                step="0.0001"
                value={newStation.latitude || ""}
                onChange={(e) =>
                  setNewStation({
                    ...newStation,
                    latitude: Number.parseFloat(e.target.value),
                  })
                }
                placeholder={t("form.latitudePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.longitude")}
              </label>
              <Input
                type="number"
                step="0.0001"
                value={newStation.longitude || ""}
                onChange={(e) =>
                  setNewStation({
                    ...newStation,
                    longitude: Number.parseFloat(e.target.value),
                  })
                }
                placeholder={t("form.longitudePlaceholder")}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddStation} disabled={loading}>
              <FiSave className="ml-2" />
              {t("buttons.save")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAdding(false)}
              disabled={loading}
            >
              <FiX className="ml-2" />
              {t("buttons.cancel")}
            </Button>
          </div>
        </div>
      )}

      {loading && !isAdding && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.name")}</TableHead>
              <TableHead>{t("table.stationId")}</TableHead>
              <TableHead>{t("table.securityCode")}</TableHead>
              <TableHead>{t("table.location")}</TableHead>
              <TableHead>{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  {t("noStations")}
                </TableCell>
              </TableRow>
            ) : (
              stations
                .filter((station) => {
                  const lowerSearch = searchTerm.toLowerCase();
                  return (
                    station.name.toLowerCase().includes(lowerSearch) ||
                    station.stationId.toLowerCase().includes(lowerSearch)
                  );
                })
                .map((station) => (
                  <TableRow key={`${station.id}-${station.stationId}`}>
                    <TableCell>
                      {editingId === station.id ? (
                        <Input
                          value={editData.name || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          required
                        />
                      ) : (
                        station.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === station.id ? (
                        <Input
                          value={editData.stationId || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              stationId: e.target.value,
                            })
                          }
                          required
                        />
                      ) : (
                        station.stationId
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === station.id ? (
                        <Input
                          value={editData.securityCode || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              securityCode: e.target.value,
                            })
                          }
                          required
                        />
                      ) : (
                        station.securityCode
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === station.id ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.0001"
                            value={editData.latitude || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                latitude: Number.parseFloat(e.target.value),
                              })
                            }
                            placeholder={t("form.latitudePlaceholder")}
                            className="w-24"
                          />
                          <Input
                            type="number"
                            step="0.0001"
                            value={editData.longitude || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                longitude: Number.parseFloat(e.target.value),
                              })
                            }
                            placeholder={t("form.longitudePlaceholder")}
                            className="w-24"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FiMapPin className="ml-1 text-gray-500" />
                          <span>
                            {station.latitude?.toFixed(4)},{" "}
                            {station.longitude?.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === station.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateStation}
                            disabled={loading}
                          >
                            <FiCheck className="ml-1" />
                            {t("buttons.save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={loading}
                          >
                            <FiX className="ml-1" />
                            {t("buttons.cancel")}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(station)}
                            disabled={loading || !!editingId}
                          >
                            <FiEdit className="ml-1" />
                            {t("buttons.edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteStation(station.id)}
                            disabled={loading || !!editingId}
                          >
                            <FiTrash2 className="ml-1" />
                            {t("buttons.delete")}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}