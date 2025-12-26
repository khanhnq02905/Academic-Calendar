import React, { useEffect, useState } from "react";
import { getLocalProfile } from "@/lib/profileService";
import { formatDateLocal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarIcon, Bell, User } from "lucide-react";
import DashboardBanner from "@/components/ui/dashboard-banner";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

type EventItem = {
  id: number;
  status?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  room?: any;
  room_name?: string | null;
  course?: any;
  course_name?: string | null;
  title?: string;
  event_type?: string;
  location?: string;
  notes?: string;
  tutor_name?: string | null;
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");

  // Set default export dates when opening (start/end of current month)
  useEffect(() => {
    if (exportOpen) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setExportStart(formatDateLocal(start));
      setExportEnd(formatDateLocal(end));
    }
  }, [exportOpen]);

  const handleExport = async () => {
    if (!exportStart || !exportEnd) {
      alert("Please select start and end dates");
      return;
    }
    const token = localStorage.getItem("accessToken");
    const url = `${API_BASE}/api/calendar/export/?start=${exportStart}&end=${exportEnd}`;

    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Export failed: ${res.status} ${res.statusText} - ${txt}`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `calendar_export_${exportStart}_${exportEnd}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExportOpen(false);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to export calendar");
    }
  };

  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || "";

  const getMonthMatrix = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const matrix: Date[][] = [];
    let cur = new Date(start);
    for (let week = 0; week < 6; week++) {
      const row: Date[] = [];
      for (let d = 0; d < 7; d++) {
        row.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      matrix.push(row);
    }
    return matrix;
  };

  const fmtTime = (t: any) => {
    if (!t) return "";
    if (typeof t === "string") return t.length >= 5 ? t.slice(0, 5) : t;
    try { return t.toString().slice(0, 5); } catch { return String(t); }
  };

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        console.log("Token exists:", !!token, "Token length:", token?.length);
        console.log("Headers being sent:", headers);
        console.log("API_BASE:", API_BASE);
        console.log("Full URL:", `${API_BASE}/api/calendar/scheduledevents/`);
        const res = await fetch(`${API_BASE}/api/calendar/scheduledevents/`, { headers });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log("Fetched events raw:", data);
        if (!mounted) return;
        // normalize to array of events
        const normalized = Array.isArray(data) ? data : (data.results || []);
        setEvents(normalized);
      } catch (err: any) {
        setError(String(err));
        console.warn("Failed to fetch /scheduledevents/, trying /events/:", err);
        // fallback: try a shorter path
        try {
          const token = localStorage.getItem("accessToken");
          const headers: any = {};
          if (token) headers.Authorization = `Bearer ${token}`;
          
          const res2 = await fetch(`${API_BASE}/api/calendar/events/`, { headers });
          if (res2.ok) {
            const d2 = await res2.json();
            console.log("Fetched events fallback:", d2);
            if (mounted) setEvents(Array.isArray(d2) ? d2 : (d2.results || []));
            setError(null);
          }
        } catch { }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvents();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex gap-6 flex-1 min-h-0">
          <div className="w-2/3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 px-2">
              <div></div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft />
                </Button>
                <div className="px-3 text-sm font-medium">
                  {displayMonth.toLocaleString(undefined, { month: "long" })} {displayMonth.getFullYear()}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight />
                </Button>
              </div>
              <div className="ml-auto">
                <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Export Calendar</DialogTitle>
                      <DialogDescription>
                        Select a date range to export events to CSV.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right">
                          Start
                        </Label>
                        <Input
                          id="start"
                          type="date"
                          value={exportStart}
                          onChange={(e) => setExportStart(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right">
                          End
                        </Label>
                        <Input
                          id="end"
                          type="date"
                          value={exportEnd}
                          onChange={(e) => setExportEnd(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleExport}>Download CSV</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow flex-1 min-h-0 overflow-auto">
              <div className="mb-4">
                <div className="text-sm text-gray-700">&nbsp;</div>
              </div>

              {(() => {
                const weeks = getMonthMatrix(displayMonth);
                const weekdayLetters = ["S", "M", "T", "W", "T", "F", "S"];
                return (
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                      {weekdayLetters.map((w, i) => (
                        <div key={`${w}-${i}`} className="py-1">
                          {w}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-sm text-gray-700">
                      {weeks.flat().map((day, idx) => {
                        const isCurrentMonth = day.getMonth() === displayMonth.getMonth();
                        const dayStr = formatDateLocal(day);
                        const eventsForDay = events.filter((ev) => ev && ev.date === dayStr && ev.status !== 'rejected');
                        const isSelected = selected && formatDateLocal(selected) === dayStr;
                        return (
                          <button
                            key={dayStr + "-" + idx}
                            onClick={() => setSelected(new Date(day))}
                            className={`relative p-2 h-14 flex flex-col items-start overflow-hidden ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"} ${isSelected ? "ring-2 ring-blue-500 rounded-md" : ""}`}
                          >
                            <div className="w-full flex items-start justify-between">
                              <div className="text-sm font-medium">{day.getDate()}</div>
                            </div>
                            {/* event indicator (small blue circle) */}
                            {eventsForDay.length > 0 && (
                              <div className="absolute bottom-1 right-1 w-3 h-3 bg-blue-500 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <aside className="w-1/3 flex flex-col min-h-0">
            <div className="bg-white p-6 rounded-2xl shadow flex-1 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Events</h3>
                <div className="flex items-center gap-3">
                  {loading && <div className="text-sm text-gray-500">Loading…</div>}
                  {error && <div className="text-sm text-red-500">Error fetching events</div>}
                  <div className="text-sm text-gray-500">{selected ? selected.toLocaleDateString() : ""}</div>
                </div>
              </div>

              <div>
                {selected ? (
                  (() => {
                    const dayStr = formatDateLocal(selected as Date);
                    const list = events.filter((e) => e.date === dayStr);
                    if (list.length === 0) return <div className="text-sm text-gray-500">No events for this date.</div>;
                    return (
                      <div className="space-y-3">
                        {list.map((e) => (
                          <div key={e.id} className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
                            <div className="font-semibold text-gray-900 text-base mb-2">{e.title || e.course_name || `Event ${e.id}`}</div>
                            <div className="text-sm text-gray-600 mb-2">
                              {e.course_name && e.event_type && `${e.course_name} - ${e.event_type}`}
                              {e.course_name && !e.event_type && e.course_name}
                              {!e.course_name && e.event_type && e.event_type}
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Time:</span> {fmtTime(e.start_time)} - {fmtTime(e.end_time)}
                            </div>
                            {e.tutor_name && <div className="text-sm text-gray-600">Lecturer: {e.tutor_name}</div>}
                            {e.room_name && <div className="text-xs text-gray-500 mt-2">Room: {e.room_name}</div>}
                            {e.status && <div className="mt-2 inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">{e.status}</div>}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-sm text-gray-500">Select a date to see events.</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
