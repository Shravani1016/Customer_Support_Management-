'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from "@/types/activity";

const dealStageColors: Record<string, string> = {
  prospecting: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  proposal: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  negotiation: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  closed_won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  closed_lost: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

const taskPriorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

const taskStatusColors: Record<string, string> = {
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
};

function Field({ label, value, accent }: { label: string; value?: string | null; accent?: boolean }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 font-medium ${accent ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

const TABS = ["overview", "contacts", "deals", "tasks", "activities", "files"] as const;
type Tab = (typeof TABS)[number];

export default function CompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await api.get(`/api/companies/${id}/detail`);
        setCompany(response.data);
      } catch (error) {
        console.error("Failed to load company:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCompany();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400">
        Company not found.
      </div>
    );
  }

  const contactCount = company.contacts?.length ?? 0;
  const dealCount = company.deals?.length ?? 0;
  const openDealValue = (company.deals ?? [])
    .filter((d: any) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .reduce((sum: number, d: any) => sum + (d.value || 0), 0);
  const wonDealValue = (company.deals ?? [])
    .filter((d: any) => d.stage === "closed_won")
    .reduce((sum: number, d: any) => sum + (d.value || 0), 0);
  const pendingTaskCount = (company.tasks ?? []).filter((t: any) => !t.is_completed).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      {/* Back Button */}
      <Link
        href="/dashboard/companies"
        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6 transition"
      >
        ← Back to Companies
      </Link>

      {/* Identity card — always visible, holds the raw contact-detail fields
          exactly once (previously duplicated inside the Overview tab too) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {company.industry || "Industry not set"}
            </p>
          </div>

          <button
            onClick={() => router.push(`/dashboard/companies/${id}/edit`)}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition"
          >
            Edit Company
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Field label="Email" value={company.email} />
          <Field label="Phone" value={company.phone} />
          <Field label="Website" value={company.website} accent />
          <Field label="Industry" value={company.industry} />
          <Field label="Address" value={company.address} />
          <Field label="Created" value={new Date(company.created_at).toLocaleDateString()} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md shadow-gray-200/50 dark:shadow-none">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md shadow-gray-200/50 dark:shadow-none p-8">
        {/* Overview: quick-glance summary stats, distinct from the identity
            card above rather than repeating the same six fields again */}
        {activeTab === "overview" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Snapshot
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Contacts</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{contactCount}</p>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Open Deals</p>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">
                  ${openDealValue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Won Deals</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${wonDealValue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">{pendingTaskCount}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Company Contacts
            </h3>

            {contactCount === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">No contacts found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {company.contacts.map((contact: any) => (
                      <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                          {contact.first_name} {contact.last_name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{contact.email || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{contact.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "deals" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Company Deals
            </h3>

            {dealCount === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">No deals found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Title</th>
                      <th className="text-left px-4 py-3 font-medium">Stage</th>
                      <th className="text-left px-4 py-3 font-medium">Value</th>
                      <th className="text-left px-4 py-3 font-medium">Close Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {company.deals.map((deal: any) => (
                      <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{deal.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${dealStageColors[deal.stage] || "bg-gray-100 text-gray-700"}`}>
                            {deal.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                          ${deal.value?.toLocaleString() ?? 0}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {deal.expected_close_date
                            ? new Date(deal.expected_close_date).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Company Tasks
            </h3>

            {(company.tasks?.length ?? 0) === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">No tasks found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Title</th>
                      <th className="text-left px-4 py-3 font-medium">Priority</th>
                      <th className="text-left px-4 py-3 font-medium">Due Date</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {company.tasks.map((task: any) => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className={`px-4 py-3 font-medium ${task.is_completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"}`}>
                          {task.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskPriorityColors[task.priority] || "bg-gray-100 text-gray-700"}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatusColors[task.is_completed ? "done" : "pending"]}`}>
                            {task.is_completed ? "Done" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "activities" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Activity Timeline
            </h3>

            {(company.activities?.length ?? 0) === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">No activities found.</p>
            ) : (
              <div className="relative pl-2">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-700/50" />
                <div className="space-y-4">
                  {company.activities.map((activity: any) => (
                    <div key={activity.id} className="relative flex items-start gap-4">
                      <div
                        className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg ring-4 ring-white dark:ring-gray-900 ${ACTIVITY_COLORS?.[activity.type] || "bg-gray-100 text-gray-600"}`}
                      >
                        {ACTIVITY_ICONS?.[activity.type] || "•"}
                      </div>
                      <div className="flex-1 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800 dark:text-gray-100 capitalize">{activity.type}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                        {activity.note && (
                          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{activity.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "files" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Files</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">No files uploaded.</p>
          </div>
        )}
      </div>
    </div>
  );
}