import api from "@/lib/api"; // adjust to your existing axios instance path

export type TrashEntity =
  | "leads"
  | "contacts"
  | "companies"
  | "deals"
  | "tasks"
  | "activities";

export const TRASH_ENTITIES: { key: TrashEntity; label: string }[] = [
  { key: "leads", label: "Leads" },
  { key: "contacts", label: "Contacts" },
  { key: "companies", label: "Companies" },
  { key: "deals", label: "Deals" },
  { key: "tasks", label: "Tasks" },
  { key: "activities", label: "Activities" },
];

export async function fetchTrash(entity: TrashEntity) {
  const res = await api.get(`/api/${entity}/trash`);
  return res.data;
}

export async function restoreItem(entity: TrashEntity, id: number) {
  const res = await api.post(`/api/${entity}/${id}/restore`);
  return res.data;
}