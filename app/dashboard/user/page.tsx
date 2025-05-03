"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  stationId?: string;
  division?: string;
  district?: string;
  upazila?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserTable() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "dataentry",
    stationId: "",
    division: "",
    district: "",
    upazila: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
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

  const handleEdit = (user: User) => {
    setIsEditing(true);
    setCurrentUser({ ...user });
  };

  const handleUpdate = async () => {
    if (!currentUser) return;

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentUser),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      await fetchUsers();
      setIsEditing(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch("/api/users", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          throw new Error("Failed to delete user");
        }

        await fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        throw new Error("Failed to create user");
      }

      await fetchUsers();
      setNewUser({
        name: "",
        email: "",
        role: "dataentry",
        stationId: "",
        division: "",
        district: "",
        upazila: "",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="role" className="text-sm font-medium text-gray-700">
            Filter by Role:
          </label>
          <select
            id="role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="all">All</option>
            <option value="stationadmin">Station Admin</option>
            <option value="dataentry">Data Entry</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Edit User Form */}
      {isEditing && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70">
          <div className="bg-white w-full max-w-3xl mx-4 p-6 rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Name */}
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
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, role: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="station_admin">Station Admin</option>
                  <option value="data_admin">Data Entry</option>
                </select>
              </div>
              {/* Station ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station ID
                </label>
                <input
                  type="text"
                  value={currentUser.stationId || ""}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      stationId: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              {/* Division */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                <input
                  type="text"
                  value={currentUser.division || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, division: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={currentUser.district || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, district: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              {/* Upazila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upazila
                </label>
                <input
                  type="text"
                  value={currentUser.upazila || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, upazila: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                <FiX /> Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiCheck /> Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Station
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500 text-sm"
                >
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {user.name || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-2 text-sm text-blue-700 font-medium capitalize">
                    {user.role}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {user.stationId || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {[user.upazila, user.district, user.division]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500 text-sm"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
