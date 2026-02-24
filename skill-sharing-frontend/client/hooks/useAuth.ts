import { useEffect, useState } from "react";

const USERS_KEY = "ladder.users.v1";
const CURRENT_USER_KEY = "ladder.currentUser.v1";

export type User = {
  id: string;
  name: string;
  email: string;
  campus?: string;
  avatarUrl?: string;
  passwordHash: string;
  createdAt: string;
};

function readUsers(): User[] {
  try { const raw = localStorage.getItem(USERS_KEY); return raw ? (JSON.parse(raw) as User[]) : []; } catch { return []; }
}
function writeUsers(list: User[]) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
function readCurrentUserEmail(): string | null { try { return localStorage.getItem(CURRENT_USER_KEY); } catch { return null; } }
function writeCurrentUserEmail(email: string | null) { if (email) localStorage.setItem(CURRENT_USER_KEY, email); else localStorage.removeItem(CURRENT_USER_KEY); }

async function sha256(text: string) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCurrentUser(): User | null {
  const email = readCurrentUserEmail();
  if (!email) return null;
  const list = readUsers();
  return list.find((u) => u.email === email) || null;
}

export function useAuth() {
  const [current, setCurrent] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // When token changes, fetch user profile
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchProfile(token);
    } else {
      localStorage.removeItem("token");
      setCurrent(null);
      setLoading(false);
    }
  }, [token]);

  async function fetchProfile(authToken: string) {
    try {
      // Decode the token payload manually, since backend doesn't have an auth/me endpoint
      // Alternatively, we could fetch `/api/users/${userId}` if we extract userId from token
      const base64Url = authToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      const userId = decoded.user?.id || decoded.userId || decoded.id;

      if (!userId) {
        throw new Error("Invalid token structure");
      }

      const res = await fetch(`/api/users/${userId}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setCurrent({
        id: String(data.user_id),
        name: data.username,
        email: data.email,
        campus: data.campus || '',
        avatarUrl: data.avatarUrl || '',
        passwordHash: "",
        createdAt: data.created_at || new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(name: string, email: string, password: string, campus?: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to sign up");

    // Auto login after sign up if backend returns token
    if (data.token) {
      setToken(data.token);
    }

    return data;
  }

  async function signIn(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid credentials");

    if (data.token) {
      setToken(data.token);
      return data;
    } else {
      throw new Error("No token returned from server");
    }
  }

  async function updateProfile(updates: Partial<Pick<User, "name" | "email" | "campus" | "avatarUrl">>) {
    if (!current || !token) throw new Error("Not signed in");
    const res = await fetch(`/api/users/${current.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        username: updates.name,
        email: updates.email,
        campus: updates.campus
      })
    });
    if (!res.ok) throw new Error("Failed to update profile");
    fetchProfile(token); // refresh profile state
    return current;
  }

  async function changePassword(newPassword: string) {
    throw new Error("Change password is not implemented on the backend yet");
  }

  function signOut() {
    setToken(null);
  }

  function deleteAccount() {
    signOut();
    throw new Error("Delete account is not implemented on the backend yet");
  }

  return { users: [], current, signUp, signIn, signOut, deleteAccount, updateProfile, changePassword, loading };
}
