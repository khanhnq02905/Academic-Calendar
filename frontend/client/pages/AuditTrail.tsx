import React, { useEffect, useState } from "react";
import { getLocalProfile } from "@/lib/profileService";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { getAuditLogs } from "@/lib/auditService";

interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  event_details: string;
  timestamp: string;
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const profile = getLocalProfile();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const fetchedLogs = await getAuditLogs();
        setLogs(fetchedLogs);
      } catch (err) {
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (!profile || profile.role !== "administrator") {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
        <Sidebar />
        <main className="w-full self-start flex flex-col h-full min-h-0 overflow-auto items-center justify-center">
          <div className="text-lg text-gray-600">Access Denied</div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
        <Sidebar />
        <main className="w-full self-start flex flex-col h-full min-h-0 overflow-auto items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
        <Sidebar />
        <main className="w-full self-start flex flex-col h-full min-h-0 overflow-auto items-center justify-center">
          <div className="text-lg text-red-600">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar />

      <main className="w-full self-start flex flex-col h-full min-h-0 overflow-auto">
        <div className="mb-6 p-6">
          <header className="rounded-2xl bg-gradient-to-r from-white via-sky-50 to-white p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Audit Trail</h1>
                <p className="mt-1 text-sm text-gray-500">Track all event creation and approval activities.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-gray-500">Total Logs</span>
                  <span className="text-lg font-semibold text-gray-900">{logs.length}</span>
                </div>
                <div>
                  <Button variant="outline" className="hidden sm:inline-flex" onClick={() => window.location.reload()}>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </header>
        </div>

        <div className="px-6 pb-6 flex-1">
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {logs.length === 0 ? (
              <div className="text-sm text-gray-500 px-6 py-6">No audit logs yet.</div>
            ) : (
              <>
                <div className="space-y-0">
                  {logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage).map((log) => (
                    <article key={log.id} className="relative py-4 border-b border-gray-200 last:border-b-0 px-6">
                      <div className="flex gap-4 justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">{log.action}</h3>
                          <div className="mt-1 text-sm text-gray-600">Actor: {log.user_email}</div>
                          <div className="mt-2 text-sm text-gray-700">{log.event_details}</div>
                        </div>
                        <div className="text-base font-bold text-black min-w-fit text-right">
                          <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleDateString('en-GB')}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {logs.length > logsPerPage && (
                  <div className="mt-6 px-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * logsPerPage + 1}-{Math.min(currentPage * logsPerPage, logs.length)} of {logs.length} logs
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.ceil(logs.length / logsPerPage) }).map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              currentPage === i + 1
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={currentPage === Math.ceil(logs.length / logsPerPage)}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}