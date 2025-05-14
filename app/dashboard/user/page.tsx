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

// Define the User type
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  createdAt: string;
  division: string;
  district: string;
  upazila: string;
  stationName: string | null;
  stationId: string | null;
}

// Define the role type
type UserRole = "super_admin" | "station_admin" | "observer";

const UserManagement = () => {
  // Use the location context for division, district, and upazila
  const { 
    divisions, 
    districts, 
    upazilas, 
    selectedDivision, 
    setSelectedDivision,
    selectedDistrict, 
    setSelectedDistrict,
    setSelectedUpazila,
    loading: locationLoading
  } = useLocation();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "observer" as UserRole,
    division: "",
    district: "",
    upazila: "",
    stationName: "",
    stationId: "",
    securityCode: "",
  });
  
  // Loading states for dependent data
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);
  
  // Fetch stations from the API
  const fetchStations = useCallback(async () => {
    setLoadingStations(true);
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoadingStations(false);
    }
  }, []);

  // Use useCallback to memoize the fetchUsers function
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use our custom API endpoint for listing users
      const response = await fetch(`/api/users?limit=${pageSize}&offset=${pageIndex * pageSize}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      // Set users and total from the API response
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize]);

  // Fetch stations when component mounts
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);
  
  // Update loading states based on location context loading state
  useEffect(() => {
    setLoadingDivisions(locationLoading);
    setLoadingDistricts(locationLoading);
    setLoadingUpazilas(locationLoading);
  }, [locationLoading]);
  
  // Fetch users when page changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handle station selection
  const handleStationChange = (stationName: string) => {
    const selectedStation = stations.find(station => station.name === stationName);
    if (selectedStation) {
      setFormData(prevData => ({
        ...prevData,
        stationName: selectedStation.name,
        stationId: selectedStation.stationId,
        securityCode: selectedStation.securityCode
      }));
    }
  };
  
  // We're now handling form data updates directly in the select onValueChange handlers
  // This ensures the form data and location context stay in sync

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (!formData.email || !formData.password || !formData.role || 
          !formData.division || !formData.district || !formData.upazila) {
        toast.error("Please fill all required fields");
        return;
      }

      // Use the API to create a user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          stationName: formData.stationName || null,
          stationId: formData.stationId || null,
          securityCode: formData.securityCode || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      toast.success("User created successfully");
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error(typeof error === 'object' && error instanceof Error ? error.message : "Failed to create user");
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;

    try {
      // Validate required fields
      if (!formData.email || !formData.role || !formData.division || !formData.district || !formData.upazila) {
        toast.error("Please fill all required fields");
        return;
      }

      // Use the custom API endpoint for updating users
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editUser.id,
          name: formData.name,
          email: formData.email,
          password: formData.password, // Include password - API will only update if not empty
          role: formData.role,
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          stationName: formData.stationName || null,
          stationId: formData.stationId || null,
          securityCode: formData.securityCode || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      toast.success("User updated successfully");
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(typeof error === 'object' && error instanceof Error ? error.message : "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      // Use the API to delete a user
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(typeof error === 'object' && error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "observer",
      division: "",
      district: "",
      upazila: "",
      stationName: "",
      stationId: "",
      securityCode: "",
    });
    setEditUser(null);
  };

  const openEditDialog = (user: User) => {
    setEditUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "", // Don't set password when editing
      role: (user.role as UserRole) || "observer",
      division: user.division,
      district: user.district,
      upazila: user.upazila,
      stationName: user.stationName || "",
      stationId: user.stationId || "",
      securityCode: "", // Security code is not returned in user data
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>Create User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editUser ? "Edit User" : "Create New User"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Name and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name">Name</label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email">Email <span className="text-red-500">*</span></label>
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
                </div>
                
                {/* Role and Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="role">Role <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value as UserRole })
                      }
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="station_admin">Station Admin</SelectItem>
                        <SelectItem value="observer">Observer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="password">
                      {editUser ? "New Password (leave blank to keep current)" : "Password"} 
                      {!editUser && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editUser}
                    />
                  </div>
                </div>
                
                {/* Station Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="stationName">Station Name</label>
                  <Select
                    value={formData.stationName}
                    onValueChange={handleStationChange}
                  >
                    <SelectTrigger id="stationName" className="w-full">
                      <SelectValue placeholder={loadingStations ? "Loading..." : "Select Station"} />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.stationId} value={station.name}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Station ID */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="stationId">Station ID</label>
                  <Input
                    id="stationId"
                    value={formData.stationId}
                    className="bg-gray-100"
                    disabled
                    readOnly
                  />
                </div>
                
                {/* Station Code (Security Code) */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="securityCode">Station Code (Security Code)</label>
                  <Input
                    id="securityCode"
                    value={formData.securityCode}
                    className="bg-gray-100"
                    disabled
                    readOnly
                  />
                </div>
                
                {/* Division, District, Upazila */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="division">Division <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.division}
                      onValueChange={(value) => {
                        console.log("Division selected:", value);
                        const division = divisions.find(d => d.name === value);
                        if (division) {
                          // First update form data
                          setFormData(prevData => ({
                            ...prevData,
                            division: value,
                            district: '',
                            upazila: ''
                          }));
                          // Then update selected division which will trigger district loading
                          setSelectedDivision(division);
                          // Reset other selections
                          setSelectedDistrict(null);
                          setSelectedUpazila(null);
                        }
                      }}
                      disabled={loadingDivisions}
                    >
                      <SelectTrigger id="division" className="w-full">
                        <SelectValue placeholder={loadingDivisions ? "Loading..." : "Select Division"} />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((division) => (
                          <SelectItem key={division.osmId} value={division.name}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="district">District <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => {
                        console.log("District selected:", value);
                        const district = districts.find(d => d.name === value);
                        if (district) {
                          // First update form data
                          setFormData(prevData => ({
                            ...prevData,
                            district: value,
                            upazila: ''
                          }));
                          // Then update selected district which will trigger upazila loading
                          setSelectedDistrict(district);
                          // Reset upazila selection
                          setSelectedUpazila(null);
                        }
                      }}
                      disabled={!selectedDivision || districts.length === 0}
                    >
                      <SelectTrigger id="district" className="w-full">
                        <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select District"} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.osmId} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="upazila">Upazila <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.upazila}
                      onValueChange={(value) => {
                        console.log("Upazila selected:", value);
                        const upazila = upazilas.find(u => u.name === value);
                        if (upazila) {
                          // Update form data
                          setFormData(prevData => ({
                            ...prevData,
                            upazila: value
                          }));
                          // Then update selected upazila
                          setSelectedUpazila(upazila);
                        }
                      }}
                      disabled={!selectedDistrict || upazilas.length === 0}
                    >
                      <SelectTrigger id="upazila" className="w-full">
                        <SelectValue placeholder={loadingUpazilas ? "Loading..." : "Select Upazila"} />
                      </SelectTrigger>
                      <SelectContent>
                        {upazilas.map((upazila) => (
                          <SelectItem key={upazila.osmId} value={upazila.name}>
                            {upazila.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={editUser ? handleUpdateUser : handleCreateUser}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editUser ? "Update User" : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role || "N/A"}</TableCell>
                  <TableCell>{user.stationName || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalUsers > 0 && (
            <>
              Showing {pageIndex * pageSize + 1} to{" "}
              {Math.min((pageIndex + 1) * pageSize, totalUsers)} of {totalUsers}{" "}
              users
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
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={(pageIndex + 1) * pageSize >= totalUsers}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;