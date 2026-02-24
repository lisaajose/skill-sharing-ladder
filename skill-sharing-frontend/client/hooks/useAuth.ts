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
  const [users, setUsers] = useState<User[]>(() => readUsers());
  const [current, setCurrent] = useState<User | null>(() => readCurrentUser());

  useEffect(() => { writeUsers(users); }, [users]);

  useEffect(() => {
    const refresh = () => {
      setUsers(readUsers());
      setCurrent(readCurrentUser());
    };
    // cross-tab + intra-app notifications
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === USERS_KEY || e.key === CURRENT_USER_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed" as any, refresh as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed" as any, refresh as any);
    };
  }, []);

  async function signUp(name: string, email: string, password: string, campus?: string) {
    const exists = readUsers().some((u) => u.email === email);
    if (exists) throw new Error("Email already registered");
    const passwordHash = await sha256(password);
    const user: User = { id: crypto.randomUUID(), name, email, campus, passwordHash, createdAt: new Date().toISOString() };
    const next = [user, ...readUsers()];
    writeUsers(next);
    writeCurrentUserEmail(email);
    setUsers(next);
    setCurrent(user);
    window.dispatchEvent(new Event("auth:changed"));
    return user;
  }

  async function signIn(email: string, password: string) {
    const passwordHash = await sha256(password);
    const list = readUsers();
    const user = list.find((u) => u.email === email && u.passwordHash === passwordHash);
    if (!user) throw new Error("Invalid credentials");
    writeCurrentUserEmail(email);
    setUsers(list);
    setCurrent(user);
    window.dispatchEvent(new Event("auth:changed"));
    return user;
  }

  async function updateProfile(updates: Partial<Pick<User, "name" | "email" | "campus" | "avatarUrl">>) {
    const curr = readCurrentUser();
    if (!curr) throw new Error("Not signed in");
    const list = readUsers();
    const nextEmail = updates.email?.trim() || curr.email;
    if (nextEmail !== curr.email && list.some((u) => u.email === nextEmail)) {
      throw new Error("Email already in use");
    }
    const updated: User = {
      ...curr,
      name: updates.name?.trim() || curr.name,
      email: nextEmail,
      campus: updates.campus === undefined ? curr.campus : updates.campus,
      avatarUrl: updates.avatarUrl === undefined ? curr.avatarUrl : updates.avatarUrl,
    };
    const nextList = list.map((u) => (u.id === curr.id ? updated : u));
    writeUsers(nextList);
    writeCurrentUserEmail(updated.email);
    setUsers(nextList);
    setCurrent(updated);
    window.dispatchEvent(new Event("auth:changed"));
    return updated;
  }

  async function changePassword(newPassword: string) {
    if (newPassword.length < 6) throw new Error("Password too short");
    const curr = readCurrentUser();
    if (!curr) throw new Error("Not signed in");
    const list = readUsers();
    const passwordHash = await sha256(newPassword);
    const updated: User = { ...curr, passwordHash };
    const nextList = list.map((u) => (u.id === curr.id ? updated : u));
    writeUsers(nextList);
    setUsers(nextList);
    setCurrent(updated);
    window.dispatchEvent(new Event("auth:changed"));
  }

  function signOut() {
    writeCurrentUserEmail(null);
    setCurrent(null);
    window.dispatchEvent(new Event("auth:changed"));
  }

  function deleteAccount() {
    const curr = readCurrentUser();
    if (!curr) throw new Error("Not signed in");
    const list = readUsers();
    const next = list.filter((u) => u.id !== curr.id);
    writeUsers(next);
    writeCurrentUserEmail(null);
    setUsers(next);
    setCurrent(null);
    window.dispatchEvent(new Event("auth:changed"));
  }

  return { users, current, signUp, signIn, signOut, deleteAccount, updateProfile, changePassword };
}
