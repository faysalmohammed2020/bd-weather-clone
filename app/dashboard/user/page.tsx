// "use client";

// import { useState, useEffect } from "react";
// import { FiSearch, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";

// interface User {
//   id: string;
//   name?: string;
//   email: string;
//   role: string;
//   stationId?: string;
//   division?: string;
//   district?: string;
//   upazila?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export default function UserTable() {
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [newUser, setNewUser] = useState<Partial<User>>({
//     name: "",
//     email: "",
//     role: "dataentry",
//     stationId: "",
//     division: "",
//     district: "",
//     upazila: "",
//   });

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/users");
//       if (!res.ok) {
//         throw new Error("Failed to fetch users");
//       }
//       const data = await res.json();
//       setUsers(data);
//     } catch (err) {
//       console.error("Failed to fetch users", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const filteredUsers = users.filter((user) => {
//     const roleMatch = roleFilter === "all" || user.role === roleFilter;
//     const searchMatch =
//       user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     return roleMatch && searchMatch;
//   });

//   const handleEdit = (user: User) => {
//     setIsEditing(true);
//     setCurrentUser({ ...user });
//   };

//   const handleUpdate = async () => {
//     if (!currentUser) return;

//     try {
//       const res = await fetch("/api/users", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(currentUser),
//       });

//       if (!res.ok) {
//         throw new Error("Failed to update user");
//       }

//       await fetchUsers();
//       setIsEditing(false);
//       setCurrentUser(null);
//     } catch (error) {
//       console.error("Error updating user:", error);
//       alert("Failed to update user");
//     }
//   };

//   const handleDelete = async (userId: string) => {
//     if (confirm("Are you sure you want to delete this user?")) {
//       try {
//         const res = await fetch("/api/users", {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ userId }),
//         });

//         if (!res.ok) {
//           throw new Error("Failed to delete user");
//         }

//         await fetchUsers();
//       } catch (error) {
//         console.error("Error deleting user:", error);
//         alert("Failed to delete user");
//       }
//     }
//   };

//   const handleCreate = async () => {
//     try {
//       const res = await fetch("/api/users", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newUser),
//       });

//       if (!res.ok) {
//         throw new Error("Failed to create user");
//       }

//       await fetchUsers();
//       setNewUser({
//         name: "",
//         email: "",
//         role: "dataentry",
//         stationId: "",
//         division: "",
//         district: "",
//         upazila: "",
//       });
//     } catch (error) {
//       console.error("Error creating user:", error);
//       alert("Failed to create user");
//     }
//   };
//   return (
//     <div className="p-6 bg-white shadow rounded-lg">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">User Management</h2>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
//         <div className="flex items-center gap-2">
//           <label htmlFor="role" className="text-sm font-medium text-gray-700">
//             Filter by Role:
//           </label>
//           <select
//             id="role"
//             value={roleFilter}
//             onChange={(e) => setRoleFilter(e.target.value)}
//             className="border border-gray-300 rounded-md p-2 text-sm"
//           >
//             <option value="all">All</option>
//             <option value="stationadmin">Station Admin</option>
//             <option value="dataentry">Data Entry</option>
//           </select>
//         </div>

//         <div className="relative w-full sm:w-64">
//           <input
//             type="text"
//             placeholder="Search by name or email"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm"
//           />
//           <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
//         </div>
//       </div>

//       {/* Edit User Form */}
//       {isEditing && currentUser && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70">
//           <div className="bg-white w-full max-w-3xl mx-4 p-6 rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
//             <h3 className="text-xl font-semibold mb-4">Edit User</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   value={currentUser.name || ""}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, name: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm"
//                 />
//               </div>
//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   value={currentUser.email}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, email: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm"
//                 />
//               </div>
//               {/* Role */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Role
//                 </label>
//                 <select
//                   value={currentUser.role}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, role: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm"
//                 >
//                   <option value="station_admin">Station Admin</option>
//                   <option value="data_admin">Data Entry</option>
//                 </select>
//               </div>
//               {/* Station ID */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Station ID
//                 </label>
//                 <input
//                   type="text"
//                   value={currentUser.stationId || ""}
//                   onChange={(e) =>
//                     setCurrentUser({
//                       ...currentUser,
//                       stationId: e.target.value,
//                     })
//                   }
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm"
//                 />
//               </div>
//               {/* Division */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Division
//                 </label>
//                 <input
//                   type="text"
//                   value={currentUser.division || ""}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, division: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm"
//                 />
//               </div>
//               {/* District */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   District
//                 </label>
//                 <input
//                   type="text"
//                   value={currentUser.district || ""}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, district: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm"
//                 />
//               </div>
//               {/* Upazila */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Upazila
//                 </label>
//                 <input
//                   type="text"
//                   value={currentUser.upazila || ""}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, upazila: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm"
//                 />
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setIsEditing(false)}
//                 className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
//               >
//                 <FiX /> Cancel
//               </button>
//               <button
//                 onClick={handleUpdate}
//                 className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 <FiCheck /> Update User
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* User Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                 Name
//               </th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                 Email
//               </th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                 Role
//               </th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                 Station
//               </th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                 Location
//               </th>
//               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="text-center py-6 text-gray-500 text-sm"
//                 >
//                   Loading users...
//                 </td>
//               </tr>
//             ) : filteredUsers.length > 0 ? (
//               filteredUsers.map((user) => (
//                 <tr key={user.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-2 text-sm text-gray-900">
//                     {user.name || "-"}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-600">
//                     {user.email}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-blue-700 font-medium capitalize">
//                     {user.role}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-700">
//                     {user.stationId || "N/A"}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-700">
//                     {[user.upazila, user.district, user.division]
//                       .filter(Boolean)
//                       .join(", ")}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-700">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleEdit(user)}
//                         className="text-blue-600 hover:text-blue-800"
//                         title="Edit"
//                       >
//                         <FiEdit2 />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(user.id)}
//                         className="text-red-600 hover:text-red-800"
//                         title="Delete"
//                       >
//                         <FiTrash2 />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="text-center py-6 text-gray-500 text-sm"
//                 >
//                   No users found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

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

    const { name, email, password, role, stationId } = newUser;
    const division = selectedDivision?.name;
    const district = selectedDistrict?.name;
    const upazila = selectedUpazila?.name;

    if (!email || !password || !role || !division || !district || !upazila) {
      setFormError("All fields are required.");
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

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
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
              <option value="superadmin">Super Admin</option>
              <option value="divisionadmin">Division Admin</option>
              <option value="districtadmin">District Admin</option>
              <option value="upazilaadmin">Upazila Admin</option>
              <option value="dataentry">Data Entry</option>
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
                Location
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
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role === "superadmin" && "Super Admin"}
                      {user.role === "divisionadmin" && "Division Admin"}
                      {user.role === "districtadmin" && "District Admin"}
                      {user.role === "upazilaadmin" && "Upazila Admin"}
                      {user.role === "dataentry" && "Data Entry"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {[user.upazila, user.district, user.division]
                        .filter(Boolean)
                        .join(", ") || (
                        <span className="text-gray-400">Not specified</span>
                      )}
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
                    { value: "superadmin", label: "Super Admin" },
                    { value: "divisionadmin", label: "Division Admin" },
                    { value: "districtadmin", label: "District Admin" },
                    { value: "upazilaadmin", label: "Upazila Admin" },
                    { value: "dataentry", label: "Data Entry" },
                  ],
                },
                {
                  label: "Password",
                  key: "password",
                  type: "password",
                  required: true,
                },
                {
                  label: "Station ID",
                  key: "stationId",
                  type: "text",
                  required: false,
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
                  <option value="superadmin">Super Admin</option>
                  <option value="divisionadmin">Division Admin</option>
                  <option value="districtadmin">District Admin</option>
                  <option value="upazilaadmin">Upazila Admin</option>
                  <option value="dataentry">Data Entry</option>
                </select>
              </div>
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
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
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
