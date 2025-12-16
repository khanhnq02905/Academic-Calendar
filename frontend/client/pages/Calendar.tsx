import React, { useEffect, useState } from "react";
import { formatDateLocal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DashboardBanner from "@/components/ui/dashboard-banner";

export default function CalendarPage() {
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<Array<any>>([]);

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

  return (
    <div className="flex-1 p-0 flex flex-col items-stretch min-h-0">
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

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-2/3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
              >
                <ChevronLeft />
              </Button>
              <div className="px-3 text-sm font-medium">
                {displayMonth.toLocaleString(undefined, { month: "long" })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 text-sm font-medium">{displayMonth.getFullYear()}</div>
              <Button
                variant="ghost"
                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
              >
                <ChevronRight />
              </Button>
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
                    {weekdayLetters.map((w) => (
                      <div key={w} className="py-1">
                        {w}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-sm text-gray-700">
                    {weeks.flat().map((day, idx) => {
                      const isCurrentMonth = day.getMonth() === displayMonth.getMonth();
                      const dayStr = formatDateLocal(day);
                      const has = events.some((ev: any) => ev && ev.status === "approved" && ev.date === dayStr);
                      const isSelected = selected && formatDateLocal(selected) === dayStr;
                      return (
                        <button
                          key={dayStr + "-" + idx}
                          onClick={() => setSelected(new Date(day))}
                          className={`relative p-2 flex items-center justify-center h-12 ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"} ${isSelected ? "ring-2 ring-blue-500 rounded-full" : ""}`}
                        >
                          <div className="text-sm">{day.getDate()}</div>
                          {has && <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-600 rounded-full" />}
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
              <div className="text-sm text-gray-500">{selected ? selected.toLocaleDateString() : ""}</div>
            </div>

            <div>
              {selected ? (
                (() => {
                  const dayStr = formatDateLocal(selected as Date);
                  const list = events.filter((e) => e.status === "approved" && e.date === dayStr);
                  if (list.length === 0) return <div className="text-sm text-gray-500">No approved events for this date.</div>;
                  return (
                    <div className="space-y-3">
                      {list.map((e) => (
                        <div key={e.id} className="p-3 border border-gray-100 rounded-md">
                          <div className="font-medium">{e.title || "Untitled"}</div>
                          <div className="text-xs text-gray-500">{e.startHour} - {e.endHour} · {e.location}</div>
                          <div className="text-sm text-gray-700 mt-2">{e.notes}</div>
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
    </div>
  );
}
