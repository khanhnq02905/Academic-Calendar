import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getProfile } from "@/lib/profileService";

export default function EditProfileStudent() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const p = await getProfile();
      if (!mounted) return;
      setProfile(p ?? {});
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const courses: string[] = profile.courses || [];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardContent>
          <h2 className="text-lg font-semibold mb-6">Student Profile</h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Name</span>
              <span className="font-medium">{profile.username || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Email Address</span>
              <span className="font-medium">{profile.email || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Major</span>
              <span className="font-medium">{profile.major || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Class</span>
              <span className="font-medium">{profile.className || "-"}</span>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Course detail</div>
              {courses.length === 0 ? (
                <div className="text-sm text-gray-500">No registered courses.</div>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {courses.map((c, i) => (
                    <li key={i} className="text-gray-800">{c}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
