import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import type { LadderTier, SkillRole } from "@/pages/Skills";
import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";

interface SkillEntry { id: string; name: string; role: SkillRole; tier: LadderTier; proficiency: number; }

export type SessionStatus = "scheduled" | "completed" | "cancelled";
export interface SessionItem { id: string; skill: string; withUser: string; when: string; status: SessionStatus; rating?: number; feedback?: string; verified?: boolean; }

const SKILLS_KEY = "ladder.skills.v1";
const SESSIONS_KEY = "ladder.sessions.v1";

function readSkills(): SkillEntry[] { try { const raw = localStorage.getItem(SKILLS_KEY); return raw ? (JSON.parse(raw) as SkillEntry[]) : []; } catch { return []; } }
function readSessions(): SessionItem[] { try { const raw = localStorage.getItem(SESSIONS_KEY); return raw ? (JSON.parse(raw) as any[]).map(migrateSession) : []; } catch { return []; } }
function writeSessions(s: SessionItem[]) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)); }

function migrateSession(s: any): SessionItem {
  // Migrate from Matches page requests
  return {
    id: s.id,
    skill: s.skill,
    withUser: s.withUser,
    when: s.when,
    status: (s.status as SessionStatus) || "scheduled",
    rating: typeof s.rating === "number" ? s.rating : undefined,
    feedback: typeof s.feedback === "string" ? s.feedback : undefined,
    verified: typeof s.verified === "boolean" ? s.verified : undefined,
  };
}

export default function Sessions() {
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  // Schedule form
  const [skill, setSkill] = useState<string>("");
  const [withUser, setWithUser] = useState<string>("");
  const [when, setWhen] = useState<string>("");

  // Complete dialog
  const [completing, setCompleting] = useState<SessionItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(true);

  useEffect(() => { setSkills(readSkills()); setSessions(readSessions()); }, []);
  useEffect(() => { writeSessions(sessions); }, [sessions]);

  const upcoming = useMemo(() => sessions.filter(s => s.status === "scheduled").sort((a,b)=> +new Date(a.when) - +new Date(b.when)), [sessions]);
  const past = useMemo(() => sessions.filter(s => s.status !== "scheduled").sort((a,b)=> +new Date(b.when) - +new Date(a.when)), [sessions]);

  function schedule(e: React.FormEvent) {
    e.preventDefault();
    if (!skill || !withUser.trim() || !when.trim()) return;
    const item: SessionItem = { id: crypto.randomUUID(), skill, withUser: withUser.trim(), when: when.trim(), status: "scheduled" };
    setSessions(prev => [item, ...prev]);
    setSkill(""); setWithUser(""); setWhen("");
  }

  function cancelSession(id: string) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "cancelled" } : s));
  }

  function openComplete(s: SessionItem) {
    setCompleting(s);
    setRating(5);
    setFeedback("");
    setVerified(true);
  }

  function saveComplete() {
    if (!completing) return;
    const updated: SessionItem = { ...completing, status: "completed", rating, feedback: feedback.trim() || undefined, verified };
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setCompleting(null);
  }

  const skillOptions = skills.map(s => s.name).filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <div className="py-10">
      <header className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Sessions</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Schedule and manage your learning/teaching sessions. Log outcomes and feedback to build reputation.</p>
      </header>

      <section className="mx-auto mt-8 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule a session</CardTitle>
              <CardDescription>Create a new session with a peer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={schedule} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Skill</Label>
                  <Select value={skill} onValueChange={setSkill}>
                    <SelectTrigger aria-label="Skill"><SelectValue placeholder="Select a skill" /></SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>With</Label>
                  <Input value={withUser} onChange={(e)=> setWithUser(e.target.value)} placeholder="Partner name" />
                </div>
                <div className="space-y-2">
                  <Label>When</Label>
                  <Input value={when} onChange={(e)=> setWhen(e.target.value)} placeholder="YYYY-MM-DD HH:mm" />
                </div>
                <div className="sm:col-span-3">
                  <Button type="submit">Schedule</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>{upcoming.length} scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming sessions.</p>}
              {upcoming.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{s.skill}</span>
                      <Badge variant="secondary">{new Date(s.when).toLocaleString() || s.when}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground truncate">With {s.withUser}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={()=> openComplete(s)}><CheckCircle2 className="mr-1 h-4 w-4" /> Complete</Button>
                    <Button variant="destructive" onClick={()=> cancelSession(s.id)}><XCircle className="mr-1 h-4 w-4" /> Cancel</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past sessions</CardTitle>
              <CardDescription>Completed or cancelled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {past.length === 0 && <p className="text-sm text-muted-foreground">No past sessions.</p>}
              {past.map(s => (
                <div key={s.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{s.skill}</span>
                      <Badge variant="secondary">{new Date(s.when).toLocaleString() || s.when}</Badge>
                    </div>
                    <Badge variant={s.status === "completed" ? "default" : "secondary"}>{s.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">With {s.withUser}</p>
                  {s.status === "completed" && (
                    <div className="mt-2 text-sm">
                      <p>Rating: <span className="font-medium">{s.rating ?? 0}/5</span> {s.verified && <span className="ml-2 text-xs text-green-600">Verified</span>}</p>
                      {s.feedback && <p className="mt-1">“{s.feedback}”</p>}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
              <CardDescription>Overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Upcoming</span><span className="font-medium">{upcoming.length}</span></div>
              <div className="flex items-center justify-between"><span>Completed</span><span className="font-medium">{sessions.filter(s=> s.status==='completed').length}</span></div>
              <div className="flex items-center justify-between"><span>Cancelled</span><span className="font-medium">{sessions.filter(s=> s.status==='cancelled').length}</span></div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <Dialog open={!!completing} onOpenChange={(open)=> (!open ? setCompleting(null) : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete session</DialogTitle></DialogHeader>
          {completing && (
            <div className="space-y-4 py-2">
              <div className="text-sm text-muted-foreground">{completing.skill} with {completing.withUser} on {new Date(completing.when).toLocaleString() || completing.when}</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><Label>Rating</Label><span className="text-xs text-muted-foreground">{rating}/5</span></div>
                <Slider min={1} max={5} step={1} value={[rating]} onValueChange={(v)=> setRating(v[0] ?? 5)} />
              </div>
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea value={feedback} onChange={(e)=> setFeedback(e.target.value)} placeholder="How did it go?" rows={4} />
              </div>
              <div className="text-xs text-muted-foreground">Completion will increase your reputation when verified.</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={()=> setCompleting(null)}>Close</Button>
            <Button onClick={saveComplete}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
