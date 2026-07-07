"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type AuditLog = {
  id: number;
  action: string;
  target_type: string;
  target_id: number | null;
  performed_by: number | null;
  description: string | null;
  created_at: string;
};

export default function AuditLogsModule() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/api/audit-logs/");
      setLogs(res.data);
    } catch {
      toast.error("Failed to load audit logs");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track all important actions performed in the CRM.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-100 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-4 text-left w-[22%]">Time</th>
              <th className="px-4 py-4 text-left w-[18%]">User</th>
              <th className="px-4 py-4 text-left w-[20%]">Action</th>
              <th className="px-4 py-4 text-left w-[15%]">Target</th>
              <th className="px-4 py-4 text-left w-[25%]">Description</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-4">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">{log.performed_by ?? "-"}</td>
                  <td className="px-4 py-4">{log.action}</td>
                  <td className="px-4 py-4">
                    {log.target_type} #{log.target_id ?? "-"}
                  </td>
                  <td className="px-4 py-4 truncate">
                    {log.description ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}