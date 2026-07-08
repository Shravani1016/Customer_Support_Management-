"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Admin = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active?: boolean;
};

export default function AdminsModule() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");  

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [editingAdminId, setEditingAdminId] = useState<number | null>(null); 

  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/api/users/admins");
      setAdmins(res.data);
    } catch {
      toast.error("Failed to load admins");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
  setCurrentPage(1);
}, [search, statusFilter]);

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }

    try {
      setSaving(true);
      await api.post("/api/users/admins", form);
      toast.success("Admin created successfully");
      setForm({ full_name: "", email: "", password: "" });
      setShowForm(false);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = (admin: Admin) => {
  setEditingAdminId(admin.id);
  setForm({
    full_name: admin.full_name,
    email: admin.email,
    password: "",
  });
  setShowForm(true);
 };

const resetForm = () => {
  setForm({ full_name: "", email: "", password: "" });
  setEditingAdminId(null);
  setShowForm(false);
};

  const handleUpdate = async () => {
  if (!editingAdminId) return;

  try {
    setSaving(true);

    await api.put(`/api/users/admins/${editingAdminId}`, {
      full_name: form.full_name,
      email: form.email,
    });

    toast.success("Admin updated successfully");

    setEditingAdminId(null);
    setForm({ full_name: "", email: "", password: "" });
    setShowForm(false);
    fetchAdmins();
  } catch (error: any) {
    toast.error(error.response?.data?.detail || "Failed to update admin");
  } finally {
    setSaving(false);
  }
 };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this admin?")) return;

    try {
      await api.delete(`/api/users/admins/${id}`);
      toast.success("Admin deleted");
      fetchAdmins();
    } catch {
      toast.error("Failed to delete admin");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus?: boolean) => {
    try {
      await api.patch(`/api/users/admins/${id}/status`, null, {
        params: { is_active: !currentStatus },
      });
      toast.success("Admin status updated");
      fetchAdmins();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openResetModal = (id: number) => {
    setSelectedAdminId(id);
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!selectedAdminId) return;

    if (!newPassword) {
      toast.error("Please enter new password");
      return;
    }

    try {
      await api.patch(`/api/users/admins/${selectedAdminId}/reset-password`, {
        new_password: newPassword,
      });

      toast.success("Password updated");
      setShowResetModal(false);
      setSelectedAdminId(null);
      setNewPassword("");
    } catch {
      toast.error("Failed to reset password");
    }
  };

  const filteredAdmins = admins.filter((admin) => {
  const matchesSearch =
    admin.full_name.toLowerCase().includes(search.toLowerCase()) ||
    admin.email.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && admin.is_active) ||
    (statusFilter === "inactive" && !admin.is_active);

  return matchesSearch && matchesStatus;
});

const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Manage Admins
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create, update and manage CRM administrators.
          </p>
        </div>

        <button
          onClick={() => {resetForm();
          setShowForm(true)}}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Admin
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingAdminId ? "Edit Admin" : "Add Admin"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2 rounded text-black"
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />

            <input
              className="border p-2 rounded text-black"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="border p-2 rounded text-black"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={editingAdminId ? handleUpdate : handleCreate}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : editingAdminId ? "Update" : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex gap-4 items-center">
  <input
    type="text"
    placeholder="Search by name or email..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded-lg px-4 py-2 text-black w-80"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border rounded-lg px-4 py-2 text-black"
  >
    <option value="all">All Status</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-slate-800">
            <tr>
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Role</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>

<tbody>
  {filteredAdmins.length === 0 ? (
    <tr>
      <td className="px-4 py-6 text-gray-500" colSpan={5}>
        No Admins Found
      </td>
    </tr>
  ) : (
    paginatedAdmins.map((admin) => (
      <tr key={admin.id} className="border-t">
        <td className="px-4 py-4 truncate">{admin.full_name}</td>

        <td className="px-4 py-4 truncate">{admin.email}</td>

        <td className="px-4 py-4 truncate">{admin.role}</td>

        <td className="px-4 py-4">
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              admin.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {admin.is_active ? "Active" : "Inactive"}
          </span>
        </td>

        <td className="px-4 py-4">
          <div className="flex items-center gap-3 whitespace-nowrap text-sm">
            <button
              onClick={() => handleEdit(admin)}
              className="text-purple-600 hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() =>
                handleToggleStatus(admin.id, admin.is_active)
              }
              className="text-blue-600 hover:underline"
            >
              {admin.is_active ? "Deactivate" : "Activate"}
            </button>

            <button
              onClick={() => openResetModal(admin.id)}
              className="text-amber-500 hover:underline"
            >
              Reset
            </button>

            <button
              onClick={() => handleDelete(admin.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
        </table>
        {filteredAdmins.length > 0 && (
  <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50 dark:bg-slate-800">
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Showing {startIndex + 1} to{" "}
      {Math.min(endIndex, filteredAdmins.length)} of{" "}
      {filteredAdmins.length} admins
    </p>

    <div className="flex gap-2">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="px-3 py-1 border rounded">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
)}
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Reset Password
            </h2>

            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4 text-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedAdminId(null);
                  setNewPassword("");
                }}
                className="px-4 py-2 border rounded-lg text-black"
              >
                Cancel
              </button>

              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}