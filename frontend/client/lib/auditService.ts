interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  event_details: string;
  timestamp: string;
}

const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || "";

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const token = localStorage.getItem("accessToken");
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/calendar/audit/logs/`, { headers });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return await res.json();
};

export const addAuditLog = async (action: string, eventId: number) => {
  const token = localStorage.getItem("accessToken");
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/calendar/audit/log/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, event_id: eventId }),
  });
  if (!res.ok) throw new Error("Failed to create audit log");
};