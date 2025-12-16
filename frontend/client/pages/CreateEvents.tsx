import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardBanner from "@/components/ui/dashboard-banner";

type CreateEventFormProps = {
  onDone?: () => void;
};

function CreateEventForm({ onDone }: CreateEventFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>("");
  const [location, setLocation] = useState("");
  const [course, setCourse] = useState("");
  const [tutor, setTutor] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [notes, setNotes] = useState("");

  const locations = [
    "-- Choose location --",
    "Nhà 2H, phòng 204",
    "Nhà 3C, phòng 408",
    "Nhà 2A, phòng 312",
    "Nhà A10, hội trường tầng 4",
    "Nhà A21, hội trường tầng 8",
  ];
  const courses = [
    "-- Choose course --",
    "Advanced databases",
    "Scientific writing and communication",
    "Distributed systems",
    "Introduction to Deep Learning",
    "Web Application Development",
  ];
  const tutors = [
    "-- Choose tutor --",
    "Lê Như Chu Hiệp",
    "Trần Giang Sơn",
    "Đoàn Nhật Quang",
    "Kiều Quốc Việt",
    "Huỳnh Vĩnh Nam",
  ];
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const ev = { id: Date.now(), title, date, location, course, tutor, startHour, endHour, notes, status: 'pending' };
    try {
      const raw = localStorage.getItem("events");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(ev);
      localStorage.setItem("events", JSON.stringify(arr));
      try { window.dispatchEvent(new Event('events:changed')); } catch (err) { /* ignore */ }
    } catch (err) {
      console.error(err);
    }
    if (onDone) onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm">
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Course</label>
          <select value={course} onChange={(e) => setCourse(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm">
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tutor</label>
          <select value={tutor} onChange={(e) => setTutor(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm">
            {tutors.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start hour</label>
          <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm">
            <option value="">-- from --</option>
            {hours.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End hour</label>
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm">
            <option value="">-- to --</option>
            {hours.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">(Optional) Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-black border-2 shadow-sm" rows={3} />
      </div>

      <div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Create & Send to DAA</button>
      </div>
    </form>
  );
}

export default function CreateEvents() {
  return (
    <div className="w-full self-start flex flex-col h-full min-h-0">
      <div className="mb-0">
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
          <div className="bg-white p-6 rounded-b-2xl shadow flex-1 min-h-0 overflow-auto">
            

            <CreateEventForm onDone={() => { window.location.href = '/profile'; }} />
          </div>
        </div>

        <aside className="w-1/3 flex flex-col min-h-0">
          <div className="bg-white p-6 rounded-2xl shadow flex-1 overflow-auto">
            <div className="text-sm text-gray-500">Insert ảnh ở đây</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
