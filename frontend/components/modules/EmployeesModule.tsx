"use client";

import { useState } from "react";

export default function EmployeesModule() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
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
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Employee
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Add Employee</h2>

          <div className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Name" />
            <input className="border p-2 rounded" placeholder="Email" />
            <input className="border p-2 rounded" placeholder="Department" />
            <input className="border p-2 rounded" placeholder="Password" />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => alert("Employee saved")}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
               Save
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

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-slate-800">
            <tr>
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Department</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="px-6 py-6 text-gray-500" colSpan={5}>
                No Employees Found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}