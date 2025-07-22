"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "@/contexts/divisionContext";
import { Station } from "@/data/stations";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  emailVerified: boolean;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: number | null;
  division: string;
  district: string;
  upazila: string;
  stationId: string;
  twoFactorEnabled: boolean | null;
  createdAt: string;
  updatedAt: string;
  station?: {
    id: string;
    name: string;
    securityCode: string;
  } | null;
}

type UserRole = "super_admin" | "station_admin" | "observer";

export const UserTable = () => {
  const { data: session } = useSession();
  // const {
  //   divisions,
  //   districts,
  //   upazilas,
  //   selectedDivision,
  //   setSelectedDivision,
  //   selectedDistrict,
  //   setSelectedDistrict,
  //   setSelectedUpazila,
  //   loading: locationLoading,
  // } = useLocation();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRoleUpdateDialog, setOpenRoleUpdateDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [originalRole, setOriginalRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const t = useTranslations("UserManagement.userTable");

  interface FormData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    stationId: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "observer",
    stationId: "",
  });

  const [loadingStations, setLoadingStations] = useState(false);

  const fetchStations = useCallback(async () => {
    setLoadingStations(true);
    try {
      const response = await fetch("/api/stations");
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"));
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error("Error fetching stations:", error);
      toast.error(t("errors.fetchFailed"));
    } finally {
      setLoadingStations(false);
    }
  }, [t]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/users?limit=${pageSize}&offset=${pageIndex * pageSize}`
      );

      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"));
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, t]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStationChange = (stationId: string) => {
    const selectedStation = stations.find((station) => station.id === stationId);
    if (selectedStation) {
      setFormData((prevData) => ({
        ...prevData,
        stationId: selectedStation?.id || "",
      }));
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!formData.role) {
        toast.error(t("createEditDialog.errors.fillAllFields"));
        return;
      }

      if (
        !formData.email ||
        !formData.password ||
        !formData.stationId
      ) {
        toast.error(t("createEditDialog.errors.fillAllFields"));
        return;
      }

      const passwordMinLength = {
        super_admin: 12,
        station_admin: 11,
        observer: 10,
      };

      const requiredLength = passwordMinLength[formData.role as UserRole];

      if (formData.password.length < requiredLength) {
        toast.error(t("createEditDialog.errors.passwordLength", {
          minLength: requiredLength,
          role: formData.role
        }));
        return;
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          stationId: formData.stationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errors.addFailed"));
      }

      toast.success(t("success.added"));
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.addFailed")
      );
    }
  };

  const confirmRoleUpdate = () => {
    if (!editUser) return;

    if (!formData.role) {
      toast.error(t("createEditDialog.errors.fillAllFields"));
      return;
    }

    if (editUser.role === formData.role) {
      handleUpdateUser();
      return;
    }

    setOriginalRole(editUser.role);
    setNewRole(formData.role);
    setOpenRoleUpdateDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;

    try {
      if (!formData.role) {
        toast.error(t("createEditDialog.errors.fillAllFields"));
        return;
      }

      if (
        !formData.email
      ) {
        toast.error(t("createEditDialog.errors.fillAllFields"));
        return;
      }

      if (formData.password && formData.password.trim() !== "") {
        const passwordMinLength = {
          super_admin: 12,
          station_admin: 11,
          observer: 10,
        };

        const requiredLength = passwordMinLength[formData.role as UserRole];

        if (formData.password.length < requiredLength) {
          toast.error(t("createEditDialog.errors.passwordLength", {
            minLength: requiredLength,
            role: formData.role
          }));
          return;
        }
      }

      setOpenRoleUpdateDialog(false);

      const updateData = {
        id: editUser.id,
        name: formData.name || "",
        email: formData.email,
        password:
          formData.password && formData.password.trim() !== ""
            ? formData.password
            : undefined,
        role: formData.role,
        stationId: formData.stationId,
      };

      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errors.updateFailed"));
      }

      toast.success(t("success.updated"));
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.updateFailed")
      );
    }
  };

  const openDeleteConfirmation = (userId: string, userRole: string | null) => {
    if (session?.user?.id === userId) {
      toast.error(t("errors.selfDelete"));
      return;
    }

    if (userRole === "super_admin") {
      toast.error(t("errors.superAdminDelete"));
      return;
    }

    setUserToDelete(userId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users?id=${userToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errors.deleteFailed"));
      }

      toast.success(t("success.deleted"));
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.deleteFailed")
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "observer",
      stationId: "",
    });
    setEditUser(null);
  };

  const openEditDialog = async (user: User) => {
    if (user.role === "super_admin") {
      toast.error(t("createEditDialog.errors.superAdminEdit"));
      return;
    }
    setEditUser(user);

    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: (user.role as UserRole) || "observer",
      stationId: user.stationId || "",
    });
    setOpenDialog(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const nextPage = () => {
    if ((pageIndex + 1) * pageSize < totalUsers) {
      setPageIndex(pageIndex + 1);
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          {session?.user.role === "super_admin" && (
            <DialogTrigger asChild>
              <Button
                className="bg-sky-600 hover:bg-sky-400"
                onClick={openCreateDialog}
              >
                {t("createUser")}
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editUser ? t("createEditDialog.editTitle") : t("createEditDialog.createTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="name">{t("createEditDialog.fields.name")}</label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {session?.user.role === "super_admin" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="role">
                    {t("createEditDialog.fields.role")}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => {
                      const role = value as UserRole;
                      setFormData({ ...formData, role });
                      toast.info(t("createEditDialog.passwordRequirements", {
                        minLength: role === "super_admin" ? 12 : role === "station_admin" ? 11 : 10,
                        role
                      }));
                    }}
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder={t("createEditDialog.placeholders.selectRole")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">{t("roles.superAdmin")}</SelectItem>
                      <SelectItem value="station_admin">{t("roles.stationAdmin")}</SelectItem>
                      <SelectItem value="observer">{t("roles.observer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email">
                    {t("createEditDialog.fields.email")}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="flex items-center gap-1">
                    {editUser ? t("createEditDialog.fields.newPassword") : t("createEditDialog.fields.password")}
                    {!editUser && <span className="text-red-500">*</span>}
                    {formData.role && (
                      <span className="text-xs text-blue-600 block">
                        {t("createEditDialog.passwordRequirements", {
                          minLength: formData.role === "super_admin" ? 12 : 
                                    formData.role === "station_admin" ? 11 : 10,
                          role: formData.role
                        })}
                      </span>
                    )}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={
                      formData.role
                        ? t("createEditDialog.passwordRequirements", {
                            minLength: formData.role === "super_admin" ? 12 : 
                                      formData.role === "station_admin" ? 11 : 10,
                            role: formData.role
                          })
                        : t("createEditDialog.placeholders.selectRole")
                    }
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editUser}
                    disabled={!formData.role}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="stationName">{t("createEditDialog.fields.stationName")}</label>
                <Select
                  value={formData.stationId}
                  onValueChange={handleStationChange}
                  disabled={session?.user.role !== "super_admin"}
                >
                  <SelectTrigger id="stationName" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingStations ? t("loading") : t("createEditDialog.placeholders.selectStation")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="stationId">{t("createEditDialog.fields.stationId")}</label>
                <Input
                  id="stationId"
                  value={
                    stations.find((station) => station.id === formData.stationId)
                      ?.stationId
                  }
                  className="bg-gray-100"
                  disabled
                  readOnly
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="securityCode">
                  {t("createEditDialog.fields.securityCode")}
                </label>
                <Input
                  id="securityCode"
                  value={
                    stations.find((station) => station.id === formData.stationId)
                      ?.securityCode
                  }
                  className="bg-gray-100"
                  disabled
                  readOnly
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                {t("buttons.cancel")}
              </Button>
              <Button
                onClick={editUser ? confirmRoleUpdate : handleCreateUser}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editUser ? t("createEditDialog.buttons.update") : t("createEditDialog.buttons.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white py-6 rounded-xl border shadow">
        <Table>
          <TableHeader className="border-b-2 border-slate-300 bg-slate-100">
            <TableRow>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-right">
                {t("columns.name")}
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-right">
                {t("columns.email")}
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-right">
                {t("columns.role")}
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-right">
                {t("columns.station")}
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-right">
                {t("columns.joined")}
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-right">
                {t("columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="p-3 text-right truncate max-w-[250px] text-base">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell className="p-3 text-right truncate max-w-[250px] text-base">
                    {user.email}
                  </TableCell>
                  <TableCell className="p-3 text-right truncate max-w-[250px] text-base">
                    {user.role ? t(`roles.${user.role}`) : "N/A"}
                  </TableCell>
                  <TableCell className="p-3 text-right truncate max-w-[250px] text-base">
                    {stations.find((station) => station.id === user.stationId)
                      ?.name || "N/A"}
                  </TableCell>
                  <TableCell className="p-3 text-right truncate max-w-[250px] text-base">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        {t("actions.edit")}
                      </Button>
                      {session?.user.role === "super_admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            openDeleteConfirmation(user.id, user.role)
                          }
                        >
                          {t("actions.delete")}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("noUsers")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between space-x-2 px-3 border-t pt-5">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalUsers > 0 && (
              <>
                {t("pagination.showing")} {pageIndex * pageSize + 1} {t("pagination.to")}{" "}
                {Math.min((pageIndex + 1) * pageSize, totalUsers)} {t("pagination.of")}{" "}
                {totalUsers} {t("pagination.users")}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pageIndex === 0}
            >
              {t("pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={(pageIndex + 1) * pageSize >= totalUsers}
            >
              {t("pagination.next")}
            </Button>
          </div>
        </div>
      </div>

      {session?.user?.role === "super_admin" && (
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                {t("deleteDialog.title")}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center">
              <p className="mb-4">
                {t("deleteDialog.message")}
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenDeleteDialog(false)}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser}>
                  {t("buttons.delete")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={openRoleUpdateDialog}
        onOpenChange={setOpenRoleUpdateDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t("roleChangeDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="mb-4">
              {t("roleChangeDialog.message", {
                originalRole: originalRole ? t(`roles.${originalRole}`) : originalRole,
                newRole: newRole ? t(`roles.${newRole}`) : newRole
              })}
            </p>
            <p className="mb-4 text-amber-600">
              {t("roleChangeDialog.warning")}
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setOpenRoleUpdateDialog(false)}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setOpenRoleUpdateDialog(false);
                  setTimeout(() => handleUpdateUser(), 100);
                }}
              >
                {t("roleChangeDialog.confirm")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};