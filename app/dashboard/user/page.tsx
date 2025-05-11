"use client";

import { useEffect, useState } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiPlus,
  FiLoader,
} from "react-icons/fi";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { useLocation } from "@/contexts/divisionContext";
import { stations } from "@/data/stations";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  stationId?: string;
  securityCode: string;
  stationName?: string;
  division?: string;
  district?: string;
  upazila?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User & { password?: string }>>(
    {
      name: "",
      email: "",
      password: "",
      role: "dataentry",
      stationId: "",
      securityCode: "",
      stationName: "",
      division: "",
      district: "",
      upazila: "",
    }
  );
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    divisions,
    districts,
    upazilas,
    selectedDivision,
    selectedDistrict,
    selectedUpazila,
    setSelectedDivision,
    setSelectedDistrict,
    setSelectedUpazila,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    const searchMatch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  const handleAddUser = async () => {
    setFormError("");

    const {
      name,
      email,
      password,
      role,
      stationId,
      stationName,
      securityCode,
    } = newUser;
    const division = selectedDivision?.name;
    const district = selectedDistrict?.name;
    const upazila = selectedUpazila?.name;

    if (!email || !password || !role || !division || !district || !upazila) {
      setFormError("All fields are required.");
      return;
    }

    // Check for super_admin limit
    if (role === "super_admin") {
      const superAdminCount = users.filter(
        (u) => u.role === "super_admin"
      ).length;
      if (superAdminCount >= 3) {
        setFormError("Maximum limit of 3 Super Admins reached");
        return;
      }
    }

    // Validate password length based on role
    const requiredLength =
      role === "super_admin" ? 12 : role === "station_admin" ? 11 : 10;
    if (password.length < requiredLength) {
      setFormError(
        `Password must be at least ${requiredLength} characters for ${role} role.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp.email(
        {
          name: name || "",
          email,
          password,
          role,
          division,
          district,
          upazila,
          stationId,
          securityCode: securityCode, // Use the correct field name from the schema
          stationName: stationName || "",
        },
        {
          onRequest: () => {},
          onSuccess: async () => {
            toast.success("User created successfully!");
            setShowCreateModal(false);
            await fetchUsers();
            resetForm();
          },
          onError: (ctx) => {
            setFormError(ctx.error.message);
            toast.error(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.error("User creation failed:", error);
      toast.error("Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStationName = (id: string) => {
    return stations.find((s) => s.id === id)?.name || "";
  };

  const handleEditUser = (user: User) => {
    setCurrentUser({
      ...user,
      stationName: getStationName(user.stationId || ""),
    });
    setShowEditModal(true);

    // Find and set the location selections based on user data
    const division = divisions.find((d) => d.name === user.division);
    const district = districts.find((d) => d.name === user.district);
    const upazila = upazilas.find((u) => u.name === user.upazila);

    setSelectedDivision(division || null);
    setSelectedDistrict(district || null);
    setSelectedUpazila(upazila || null);
  };

  const handleUpdateUser = async () => {
    if (!currentUser) return;

    setFormError("");
    const division = selectedDivision?.name;
    const district = selectedDistrict?.name;
    const upazila = selectedUpazila?.name;

    if (!division || !district || !upazila) {
      setFormError("Location fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentUser,
          division,
          district,
          upazila,
          securityCode: currentUser.securityCode, // Use the correct field name from the schema
        }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("User updated successfully!");
      setShowEditModal(false);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setIsDeleting(true);
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully!");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "dataentry",
      stationId: "",
      securityCode: "",
      stationName: "",
      division: "",
      district: "",
      upazila: "",
    });
    setSelectedDivision(null);
    setSelectedDistrict(null);
    setSelectedUpazila(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-red-100 text-red-800";
      case "divisionadmin":
        return "bg-purple-100 text-purple-800";
      case "districtadmin":
        return "bg-blue-100 text-blue-800";
      case "upazilaadmin":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage all system users and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <FiPlus size={16} />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="station_admin">Station Admin</option>
              <option value="data_admin">Data Entry</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station ID
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <FiLoader className="animate-spin h-5 w-5 text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || (
                        <span className="text-gray-400">Unnamed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {user.stationName || "No Station Name Found"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {user.stationId || "No Station ID Found"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <FiLoader className="animate-spin h-4 w-4" />
                        ) : (
                          <FiTrash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="text-gray-500 py-8">
                    <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No users found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter to find what you're
                      looking for.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-4 p-6 rounded-xl shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Create New User
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Name", key: "name", type: "text", required: false },
                { label: "Email", key: "email", type: "email", required: true },
                {
                  label: "Role",
                  key: "role",
                  type: "select",
                  required: true,
                  options: [
                    { value: "super_admin", label: "Super Admin" },
                    { value: "station_admin", label: "Station Admin" },
                    { value: "data_admin", label: "Data Admin" },
                  ],
                },
                {
                  label: "Password",
                  key: "password",
                  type: "password",
                  required: true,
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={(newUser as any)[field.key] || ""}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={(newUser as any)[field.key] || ""}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required={field.required}
                      placeholder={
                        field.type === "password" ? "Minimum 6 characters" : ""
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Name
              </label>
              <select
                value={newUser.stationName || ""}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const selectedStation = stations.find(
                    (s) => s.name === selectedName
                  );
                  setNewUser({
                    ...newUser,
                    stationName: selectedName,
                    stationId: selectedStation?.id || "",
                    securityCode: selectedStation?.securityCode || "",
                  });
                }}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.name}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station ID
              </label>
              <input
                type="text"
                value={newUser.stationId || ""}
                disabled
                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Code (Security Code)
              </label>
              <input
                type="text"
                value={newUser.securityCode || ""}
                disabled
                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Location Selects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDivision?.osmId || ""}
                  onChange={(e) => {
                    const div = divisions.find(
                      (d) => d.osmId === Number(e.target.value)
                    );
                    setSelectedDivision(div || null);
                    setSelectedDistrict(null);
                    setSelectedUpazila(null);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div.osmId} value={div.osmId}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrict?.osmId || ""}
                  onChange={(e) => {
                    const dist = districts.find(
                      (d) => d.osmId === Number(e.target.value)
                    );
                    setSelectedDistrict(dist || null);
                    setSelectedUpazila(null);
                  }}
                  disabled={!selectedDivision}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((dist) => (
                    <option key={dist.osmId} value={dist.osmId}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upazila <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUpazila?.osmId || ""}
                  onChange={(e) => {
                    const upz = upazilas.find(
                      (u) => u.osmId === Number(e.target.value)
                    );
                    setSelectedUpazila(upz || null);
                  }}
                  disabled={!selectedDistrict}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
                  required
                >
                  <option value="">Select Upazila</option>
                  {upazilas.map((upz) => (
                    <option key={upz.osmId} value={upz.osmId}>
                      {upz.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    Create User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-4 p-6 rounded-xl shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={currentUser.name || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, role: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="station_admin">Station Admin</option>
                  <option value="data_admin">Data Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Name
              </label>
              <select
                value={currentUser.stationName || ""}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const selectedStation = stations.find(
                    (s) => s.name === selectedName
                  );
                  setCurrentUser({
                    ...currentUser,
                    stationName: selectedName,
                    stationId: selectedStation?.id || "",
                    securityCode: selectedStation?.securityCode || "", // Keep this for UI display
                  });
                }}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.name}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station ID
              </label>
              <input
                type="text"
                value={currentUser.stationId || ""}
                disabled
                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Code (Security Code)
              </label>
              <input
                type="text"
                value={currentUser.securityCode || ""}
                readOnly
                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Location Selects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDivision?.osmId || ""}
                  onChange={(e) => {
                    const div = divisions.find(
                      (d) => d.osmId === Number(e.target.value)
                    );
                    setSelectedDivision(div || null);
                    setSelectedDistrict(null);
                    setSelectedUpazila(null);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div.osmId} value={div.osmId}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrict?.osmId || ""}
                  onChange={(e) => {
                    const dist = districts.find(
                      (d) => d.osmId === Number(e.target.value)
                    );
                    setSelectedDistrict(dist || null);
                    setSelectedUpazila(null);
                  }}
                  disabled={!selectedDivision}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((dist) => (
                    <option key={dist.osmId} value={dist.osmId}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upazila <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUpazila?.osmId || ""}
                  onChange={(e) => {
                    const upz = upazilas.find(
                      (u) => u.osmId === Number(e.target.value)
                    );
                    setSelectedUpazila(upz || null);
                  }}
                  disabled={!selectedDistrict}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
                  required
                >
                  <option value="">Select Upazila</option>
                  {upazilas.map((upz) => (
                    <option key={upz.osmId} value={upz.osmId}>
                      {upz.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    Update User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
