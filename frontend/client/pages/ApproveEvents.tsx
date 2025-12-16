import React, { useEffect, useState } from "react";
import DashboardBanner from "@/components/ui/dashboard-banner";

export default function ApproveEvents() {
  const [events, setEvents] = useState<Array<any>>([]);

  useEffect(() => {
    const raw = localStorage.getItem("events");
    const arr = raw ? JSON.parse(raw) : [];
    setEvents(arr);
  }, []);

  useEffect(() => {
    const handler = () => {
      const raw = localStorage.getItem("events");
      const arr = raw ? JSON.parse(raw) : [];
      setEvents(arr);
    };
    window.addEventListener("events:changed", handler);
    return () => window.removeEventListener("events:changed", handler);
  }, []);

  const updateStatus = (id: number, status: string) => {
    const raw = localStorage.getItem("events");
    const arr = raw ? JSON.parse(raw) : [];
    const newArr = arr.map((e: any) => (e.id === id ? { ...e, status } : e));
    localStorage.setItem("events", JSON.stringify(newArr));
    setEvents(newArr);
    try {
      window.dispatchEvent(new Event("events:changed"));
    } catch (err) {
      /* ignore */
    }
  };

  const pending = events.filter((e) => e.status === undefined || e.status === "pending");

  return (
    <div className="w-full self-start flex flex-col h-full min-h-0 overflow-auto">
      <div className="mb-6">
        <DashboardBanner
          images={[
            "https://storage.googleapis.com/usth-edu.appspot.com/2025-08-14_10-34-59%2Fbanner-ts.jpg",
            "http://storage.googleapis.com/usth-edu.appspot.com/2025-08-14_10-35-08%2Fbanner-master.jpg",
            "https://usth.edu.vn/wp-content/uploads/2021/12/1slidectsv.jpg",
          ]}
          intervalMs={5000}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow flex-1">
        {pending.length === 0 ? (
          <div className="text-sm text-gray-500">No pending events.</div>
        ) : (
          <div className="space-y-4 max-h-[55vh] overflow-auto pr-2">
            {pending.map((e) => (
              <div key={e.id} className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{e.title || "Untitled"}</div>
                    <div className="text-xs text-gray-500">{e.date} · {e.location}</div>
                    <div className="text-sm mt-2 text-gray-700">Course: {e.course} · Tutor: {e.tutor}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-500">{e.startHour} - {e.endHour}</div>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(e.id, "approved")} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => updateStatus(e.id, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
