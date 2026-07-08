"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Employee = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active?: boolean;
};

export default function EmployeesModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");   

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
  });

  const resetForm = () => {
    setForm({ full_name: "", email: "", password: "", department: "" });
    setEditingEmployeeId(null);
    setShowForm(false);
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/users/employees");
      setEmployees(res.data);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
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
      await api.post("/api/users/employees", form);
      toast.success("Employee created successfully");
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setForm({
      full_name: employee.full_name,
      email: employee.email,
      password: "",
      department: "",
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!editingEmployeeId) return;

    try {
      setSaving(true);
      await api.put(`/api/users/employees/${editingEmployeeId}`, {
        full_name: form.full_name,
        email: form.email,
        department: form.department,
      });

      toast.success("Employee updated successfully");
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this employee?")) return;

    try {
      await api.delete(`/api/users/employees/${id}`);
      toast.success("Employee deleted");
      fetchEmployees();
    } catch {
      toast.error("Failed to delete employee");
    }
  };
  
  const handleToggleStatus = async (id: number, currentStatus?: boolean) => {
    try {
      await api.patch(`/api/users/employees/${id}/status`, null, {
        params: { is_active: !currentStatus },
      });
      toast.success("Employee status updated");
      fetchEmployees();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openResetModal = (id: number) => {
    setSelectedEmployeeId(id);
    setNewPassword("");
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!selectedEmployeeId) return;

    if (!newPassword) {
      toast.error("Please enter new password");
      return;
    }

    try {
      await api.patch(`/api/users/employees/${selectedEmployeeId}/reset-password`, {
        new_password: newPassword,
      });

      toast.success("Password updated");
      setShowResetModal(false);
      setSelectedEmployeeId(null);
      setNewPassword("");
    } catch {
      toast.error("Failed to reset password");
    }
  };

   const filteredEmployees = employees.filter((employee) => {
   const matchesSearch =
    employee.full_name.toLowerCase().includes(search.toLowerCase()) ||
    employee.email.toLowerCase().includes(search.toLowerCase());
 

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && employee.is_active) ||
    (statusFilter === "inactive" && !employee.is_active);

  return matchesSearch && matchesStatus;
   }); 

const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);   

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Manage Employees
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create, update, assign and manage employees.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Employee
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingEmployeeId ? "Edit Employee" : "Add Employee"}
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
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />

            {!editingEmployeeId && (
              <input
                className="border p-2 rounded text-black"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={editingEmployeeId ? handleUpdate : handleCreate}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : editingEmployeeId ? "Update" : "Save"}
            </button>

            <button onClick={resetForm} className="border px-4 py-2 rounded">
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
        <table className="w-full table-fixed">
          <thead className="bg-gray-100 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-4 text-left w-[18%]">Name</th>
              <th className="px-4 py-4 text-left w-[32%]">Email</th>
              <th className="px-4 py-4 text-left w-[13%]">Role</th>
              <th className="px-4 py-4 text-left w-[13%]">Status</th>
              <th className="px-4 py-4 text-left w-[24%]">Actions</th>
            </tr>
          </thead>

         <tbody>
  {filteredEmployees.length === 0 ? (
    <tr>
      <td className="px-4 py-6 text-gray-500" colSpan={5}>
        No Employees Found
      </td>
    </tr>
  ) : (
    paginatedEmployees.map((employee) => (
      <tr key={employee.id} className="border-t">
        <td className="px-4 py-4 truncate">{employee.full_name}</td>

        <td className="px-4 py-4 truncate">{employee.email}</td>

        <td className="px-4 py-4 truncate">{employee.role}</td>

        <td className="px-4 py-4">
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              employee.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {employee.is_active ? "Active" : "Inactive"}
          </span>
        </td>

        <td className="px-4 py-4">
          <div className="flex items-center gap-3 whitespace-nowrap text-sm">
            <button
              onClick={() => handleEdit(employee)}
              className="text-purple-600 hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() =>
                handleToggleStatus(employee.id, employee.is_active)
              }
              className="text-blue-600 hover:underline"
            >
              {employee.is_active ? "Deactivate" : "Activate"}
            </button>

            <button
              onClick={() => openResetModal(employee.id)}
              className="text-amber-500 hover:underline"
            >
              Reset
            </button>

            <button
              onClick={() => handleDelete(employee.id)}
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


        {filteredEmployees.length > 0 && (
  <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50 dark:bg-slate-800">
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Showing {startIndex + 1} to{" "}
      {Math.min(endIndex, filteredEmployees.length)} of{" "}
      {filteredEmployees.length} employees
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
                  setSelectedEmployeeId(null);
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