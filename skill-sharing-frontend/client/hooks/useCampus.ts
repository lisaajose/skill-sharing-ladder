import { useCallback, useEffect, useMemo, useState } from "react";

const CAMPUS_KEY = "ladder.campus.v1";
const CAMPUS_ONLY_KEY = "ladder.campusOnly.v1";
const CAMPUSES_KEY = "ladder.campuses.v1";

export type Campus = string;

function readCampuses(): Campus[] {
  try {
    const raw = localStorage.getItem(CAMPUSES_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    const set = new Set(["Global", ...parsed.filter(Boolean)]);
    return Array.from(set);
  } catch {
    return ["Global"];
  }
}

function writeCampuses(list: Campus[]) {
  const filtered = list.filter((c) => c && c !== "Global");
  localStorage.setItem(CAMPUSES_KEY, JSON.stringify(filtered));
}

function readCampus(defaultCampus: Campus): Campus {
  try {
    const v = localStorage.getItem(CAMPUS_KEY);
    return v || defaultCampus;
  } catch {
    return defaultCampus;
  }
}

function writeCampus(v: Campus) {
  localStorage.setItem(CAMPUS_KEY, v);
}

function readCampusOnly(): boolean {
  try {
    const v = localStorage.getItem(CAMPUS_ONLY_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

function writeCampusOnly(v: boolean) {
  localStorage.setItem(CAMPUS_ONLY_KEY, v ? "1" : "0");
}

export function useCampus() {
  const [campuses, setCampuses] = useState<Campus[]>(() => readCampuses());
  const [campus, setCampus] = useState<Campus>(() => readCampus("Global"));
  const [campusOnly, setCampusOnly] = useState<boolean>(() => readCampusOnly());

  // Ensure selected campus exists in list
  useEffect(() => {
    setCampuses((prev) => (prev.includes(campus) ? prev : Array.from(new Set(["Global", ...prev, campus]))));
  }, [campus]);

  useEffect(() => { writeCampuses(campuses); }, [campuses]);
  useEffect(() => { writeCampus(campus); }, [campus]);
  useEffect(() => { writeCampusOnly(campusOnly); }, [campusOnly]);

  const addCampus = useCallback((name: Campus) => {
    const n = name.trim();
    if (!n) return;
    setCampuses((prev) => Array.from(new Set(["Global", ...prev, n])));
    setCampus(n);
  }, []);

  return { campuses, addCampus, campus, setCampus, campusOnly, setCampusOnly };
}
