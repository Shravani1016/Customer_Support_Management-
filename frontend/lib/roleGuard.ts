export type Role = "sales_rep" | "admin" | "super_admin" | "manager";

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function getUserRole(): Role | null {
  const user = getStoredUser();
  return user?.role || null;
}