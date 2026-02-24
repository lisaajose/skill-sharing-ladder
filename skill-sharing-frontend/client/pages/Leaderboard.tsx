import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCampus } from "@/hooks/useCampus";
import type { LadderTier, SkillRole } from "@/pages/Skills";

interface SkillEntry { id: string; name: string; role: SkillRole; tier: LadderTier; proficiency: number; }
interface SessionRequest { id: string; skill: string; withUser: string; when: string; }

const SKILLS_KEY = "ladder.skills.v1";
const SESSIONS_KEY = "ladder.sessions.v1";

function readSkills(): SkillEntry[] { try { const raw = localStorage.getItem(SKILLS_KEY); return raw ? (JSON.parse(raw) as SkillEntry[]) : []; } catch { return []; } }
function readSessions(): SessionRequest[] { try { const raw = localStorage.getItem(SESSIONS_KEY); return raw ? (JSON.parse(raw) as SessionRequest[]) : []; } catch { return []; } }

const NAMES = ["Alex","Jordan","Taylor","Riley","Casey","Morgan","Quinn","Avery","Reese","Parker","Hayden","Jamie","Kendall","Rowan","Sage","Skyler","Drew","Emerson","Finley","Harper"];
function pseudo(seed: string) { let h=0; for (let i=0;i<seed.length;i++) h=(h*31+seed.charCodeAt(i))>>>0; return NAMES[h%NAMES.length]; }

export default function Leaderboard() {
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [query, setQuery] = useState("");
  const { campus, campusOnly, setCampusOnly } = useCampus();

  useEffect(()=>{ setSkills(readSkills()); setSessions(readSessions()); }, []);

  const youReputation = useMemo(() => {
    const base = skills.reduce((a,s)=> a + s.proficiency, 0) / (skills.length || 1);
    const teaching = skills.filter(s=> s.role === "teach").length * 10;
    const sess = sessions.length * 5;
    return Math.round(base + teaching + sess);
  }, [skills, sessions]);

  function pickCampus(seed: string) {
    let h=0; for (let i=0;i<seed.length;i++) h=(h*31+seed.charCodeAt(i))>>>0;
    if (campus && campus !== "Global" && h % 3 === 0) return campus;
    const pool = ["Global University","Open Campus","City College","Tech Institute"];
    return pool[h % pool.length];
  }

  const others = useMemo(() => {
    const seeds = Array.from(new Set(["alpha","beta","gamma","delta","epsilon","zeta","eta","theta","iota","kappa"]))
    return seeds.map((seed, idx) => {
      const name = `${pseudo(seed)} ${String.fromCharCode(65+((idx*7)%26))}.`;
      const skillsCount = (idx*3 + 5) % 11 + 1;
      const rep = 200 + ((idx*53)%400) + (skillsCount*3);
      const verified = (idx*7)%12;
      const campusName = pickCampus(seed);
      return { id: seed, name, skillsCount, verified, reputation: rep, campus: campusName };
    });
  }, [campus]);

  const rows = useMemo(() => {
    const you = { id: "you", name: "You", skillsCount: skills.length, verified: Math.round(skills.length/2), reputation: 250 + youReputation, campus: campus || "Global" };
    let list = [you, ...others];
    if (campusOnly && campus && campus !== "Global") list = list.filter(r => r.campus === campus);
    const filtered = query.trim() ? list.filter(r => r.name.toLowerCase().includes(query.toLowerCase())) : list;
    return filtered.sort((a,b)=> b.reputation - a.reputation).map((r, i) => ({ rank: i+1, ...r }));
  }, [others, query, skills.length, youReputation, campusOnly, campus]);

  return (
    <div className="py-10">
      <header className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Top contributors ranked by reputation. Earn reputation by verified teaching, session feedback, and ladder progression.</p>
      </header>

      <section className="mx-auto mt-8 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Rankings</CardTitle>
                  <CardDescription>{campusOnly && campus && campus !== "Global" ? `${campus} standings` : "Global standings (local demo)"}</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Campus-only</span>
                    <Switch checked={campusOnly} onCheckedChange={(v)=> setCampusOnly(Boolean(v))} />
                  </div>
                  <Input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Search user" className="w-56" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead className="hidden sm:table-cell">Skills</TableHead>
                    <TableHead className="hidden md:table-cell">Verified</TableHead>
                    <TableHead className="hidden lg:table-cell">Campus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.id} className={r.name === "You" ? "bg-primary/5" : undefined}>
                      <TableCell className="font-mono">{r.rank}</TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${r.name === 'You' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>{r.name.charAt(0)}</span>
                        {r.name}
                        {r.name === 'You' && <Badge className="ml-1">You</Badge>}
                      </TableCell>
                      <TableCell className="font-semibold">{r.reputation}</TableCell>
                      <TableCell className="hidden sm:table-cell">{r.skillsCount}</TableCell>
                      <TableCell className="hidden md:table-cell">{r.verified}</TableCell>
                      <TableCell className="hidden lg:table-cell"><Badge variant="secondary">{r.campus}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your summary</CardTitle>
              <CardDescription>Personal stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Skills</span><span className="font-medium">{skills.length}</span></div>
              <div className="flex items-center justify-between"><span>Sessions</span><span className="font-medium">{sessions.length}</span></div>
              <div className="flex items-center justify-between"><span>Estimated reputation</span><span className="font-medium">{250 + youReputation}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Earned for contributions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Contributor</Badge>
              <Badge variant="secondary">Mentor</Badge>
              <Badge>Verified</Badge>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
