import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProfile, saveLocalProfile } from "@/lib/profileService";

export default function EditProfile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const p = await getProfile();
      if (!mounted) return;
      if (p) {
        setUsername(p.username ?? "");
        setEmail(p.email ?? "");
        setRole(p.role ?? "");
        setContactNumber((p as any).contactNumber ?? "");
        setRecoveryEmail((p as any).recoveryEmail ?? "");
      } else {
        setUsername("Demo User");
        setEmail("demo@example.com");
        setRole("User");
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const save = () => {
    saveLocalProfile({ username, email, role, contactNumber, recoveryEmail });
    try { window.dispatchEvent(new Event('profile:changed')); } catch (e) {}
    navigate('/profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact number</label>
                <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+84 9xx xxx xxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recovery email</label>
                <Input value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="recovery@example.com" />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => navigate('/profile')}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
