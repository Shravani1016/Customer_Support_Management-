export function getStoredUser() {
  if (typeof window === 'undefined') return null;

  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function getUserRole() {
  const user = getStoredUser();
  return user?.role || null;
}