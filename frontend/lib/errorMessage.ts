export function getErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d === 'string' ? d : d?.msg))
      .filter(Boolean)
      .join(', ') || fallback;
  }

  return fallback;
}