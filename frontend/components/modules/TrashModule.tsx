"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchTrash, restoreItem, TRASH_ENTITIES, TrashEntity } from "@/lib/trashApi";
import { getErrorMessage } from "@/lib/errorMessage";
import { usePagination } from '@/lib/usePagination';
import Pagination from '@/components/Pagination';


// Pulls a sensible display label + subtitle out of whatever fields the record has
function getDisplayFields(entity: TrashEntity, item: any) {
  switch (entity) {
    case "leads":
      return { title: item.name, subtitle: item.email || item.company_name };
    case "contacts":
      return { title: `${item.first_name} ${item.last_name}`, subtitle: item.email };
    case "companies":
      return { title: item.name, subtitle: item.industry || item.website };
    case "deals":
      return { title: item.title, subtitle: `$${item.value} · ${item.stage}` };
    case "tasks":
      return { title: item.title, subtitle: item.description };
    case "activities":
      return { title: item.type, subtitle: item.note };
    default:
      return { title: item.id, subtitle: "" };
  }
}

export default function TrashModule() {
  const [activeTab, setActiveTab] = useState<TrashEntity>("leads");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const loadTrash = useCallback(async (entity: TrashEntity) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrash(entity);
      setItems(data);
    } catch (err) {
    setError(getErrorMessage(err, "Failed to load trash"));
    } finally {
    setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrash(activeTab);
  }, [activeTab, loadTrash]);

  async function handleRestore(id: number) {
    setRestoringId(id);
    try {
      await restoreItem(activeTab, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
    setError(getErrorMessage(err, "Failed to restore item"));
    } finally {
    setRestoringId(null);
    }
  }
const {
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
  paginatedItems,
  resetPage,
} = usePagination(items, 10);

useEffect(() => {
  resetPage();
}, [activeTab, resetPage]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-1">Trash</h1>
      <p className="text-sm text-gray-500 mb-6">
        Deleted records are kept here until restored. Nothing is permanently removed yet.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        {TRASH_ENTITIES.map((e) => (
          <button
            key={e.key}
            onClick={() => setActiveTab(e.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === e.key
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

                  {loading ? (
        <div className="text-sm text-gray-500 py-10 text-center">
          Loading trash…
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500 py-10 text-center">
          No deleted{" "}
          {TRASH_ENTITIES.find((e) => e.key === activeTab)?.label.toLowerCase()}{" "}
          here.
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedItems.map((item) => {
              const { title, subtitle } = getDisplayFields(activeTab, item);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {title || `#${item.id}`}
                    </p>

                    {subtitle && (
                      <p className="text-sm text-gray-500 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRestore(item.id)}
                    disabled={restoringId === item.id}
                    className="ml-4 shrink-0 px-3 py-1.5 text-sm font-medium rounded-md bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {restoringId === item.id ? "Restoring..." : "Restore"}
                  </button>
                </div>
              );
            })}
          </div>

          {totalItems > 0 && (
            <>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, totalItems)} of {totalItems} deleted
                  items
                </p>
              </div>

              {items.length > 0 && (
  <Pagination
    page={page}
    totalPages={totalPages}
    pageSize={pageSize}
    totalItems={totalItems}
    onPageChange={setPage}
    onPageSizeChange={setPageSize}
  />
)}
            </>
          )}
        </>
      )}
    </div>
  );
}