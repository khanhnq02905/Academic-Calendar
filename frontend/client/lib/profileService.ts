export type Profile = {
  username: string;
  email: string;
  role: string;
  contactNumber?: string;
  recoveryEmail?: string;
  // student-specific
  major?: string;
  className?: string;
  courses?: string[];
};

const LOCAL_KEY = "localProfile";
const TOKEN_KEY = "accessToken";

export const getLocalProfile = (): Profile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
};

export const saveLocalProfile = (p: Profile) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
};

export const clearLocalProfile = () => {
  localStorage.removeItem(LOCAL_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const fetchProfileFromApi = async (token: string): Promise<Profile> => {
  const res = await fetch("/users/my-profile/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Fetch failed");
  return (await res.json()) as Profile;
};

export const getProfile = async (): Promise<Profile | null> => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      const p = await fetchProfileFromApi(token);
      // keep a local copy as fallback
      saveLocalProfile(p);
      return p;
    } catch {
      // fallback to local profile when API unavailable
      return getLocalProfile();
    }
  }
  return getLocalProfile();
};
