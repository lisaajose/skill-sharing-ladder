import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCampus } from "@/hooks/useCampus";
import type { LadderTier, SkillRole } from "@/pages/Skills";
import { CalendarClock, Handshake, User, Users } from "lucide-react";

interface SkillEntry { id: string; name: string; role: SkillRole; tier: LadderTier; proficiency: number; }
interface MatchSuggestion { id: string; skill: string; counterpartName: string; counterpartRole: "teacher" | "learner"; counterpartTier: LadderTier; reputation: number; campus: string; }
interface SessionRequest { id: string; skill: string; withUser: string; when: string; }
interface ChatMessage { id: string; from: "you" | "them"; text: string; at: string; }
type ChatMap = Record<string, ChatMessage[]>;

const SKILLS_KEY = "ladder.skills.v1";
const SESSIONS_KEY = "ladder.sessions.v1";
const CHAT_KEY = "ladder.chats.v1";

function readSkills(): SkillEntry[] {
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    return raw ? (JSON.parse(raw) as SkillEntry[]) : [];
  } catch {
    return [];
  }
}

function readSessions(): SessionRequest[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as SessionRequest[]) : [];
  } catch {
    return [];
  }
}

function writeSessions(s: SessionRequest[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(s));
}

function readChats(): ChatMap {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? (JSON.parse(raw) as ChatMap) : {};
  } catch {
    return {};
  }
}
function writeChats(m: ChatMap) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(m));
}

const tierOrder: Record<LadderTier, number> = { Beginner: 1, Intermediate: 2, Expert: 3 };
const numToTier = (n: number): LadderTier => (n <= 1 ? "Beginner" : n === 2 ? "Intermediate" : "Expert");

const names = ["Alex", "Jordan", "Taylor", "Riley", "Casey", "Morgan", "Quinn", "Avery", "Reese", "Parker"];
function pseudoName(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return names[h % names.length];
}

function pickCampus(seed: string, current: string, campusOnly: boolean) {
  if (campusOnly && current && current !== "Global") return current;
  const list = ["Engineering", "Business", "Arts", "Science", "Law", "Medicine"];
  let h = 0; for (let i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

export default function Matches() {
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const { campus, campusOnly, setCampusOnly } = useCampus();

  const [proposing, setProposing] = useState<MatchSuggestion | null>(null);
  const [when, setWhen] = useState("");

  const [chats, setChats] = useState<ChatMap>({});
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");

  useEffect(() => {
    setSkills(readSkills());
    setSessions(readSessions());
    setChats(readChats());
  }, []);

  useEffect(() => {
    writeSessions(sessions);
  }, [sessions]);

  const teacherMatches = useMemo(() => {
    const base = skills
      .filter((s) => s.role === "learn" && tierOrder[s.tier] < 3)
      .map<MatchSuggestion>((s) => {
        const nextTier = numToTier(tierOrder[s.tier] + 1);
        const counterpartName = `${pseudoName(s.name + nextTier)} ${pseudoName(nextTier + s.name).charAt(0)}`;
        const rep = 60 + ((s.name.length * 7) % 40);
        const mCampus = pickCampus(s.id + s.name + "t", campus, campusOnly);
        return {
          id: `${s.id}-t`,
          skill: s.name,
          counterpartName,
          counterpartRole: "teacher",
          counterpartTier: nextTier,
          reputation: rep,
          campus: mCampus,
        };
      });
    return campusOnly && campus !== "Global" ? base.filter((m) => m.campus === campus) : base;
  }, [skills, campusOnly, campus]);

  const learnerMatches = useMemo(() => {
    const base = skills
      .filter((s) => s.role === "teach" && tierOrder[s.tier] > 1)
      .map<MatchSuggestion>((s) => {
        const prevTier = numToTier(tierOrder[s.tier] - 1);
        const counterpartName = `${pseudoName(s.name + prevTier)} ${pseudoName(prevTier + s.name).charAt(0)}`;
        const rep = 30 + ((s.name.length * 11) % 50);
        const mCampus = pickCampus(s.id + s.name + "l", campus, campusOnly);
        return {
          id: `${s.id}-l`,
          skill: s.name,
          counterpartName,
          counterpartRole: "learner",
          counterpartTier: prevTier,
          reputation: rep,
          campus: mCampus,
        };
      });
    return campusOnly && campus !== "Global" ? base.filter((m) => m.campus === campus) : base;
  }, [skills, campusOnly, campus]);

  function proposeSession(m: MatchSuggestion) {
    setProposing(m);
    setWhen("");
  }

  function confirmSession() {
    if (!proposing || !when.trim()) return;
    const req: SessionRequest = {
      id: crypto.randomUUID(),
      skill: proposing.skill,
      withUser: proposing.counterpartName,
      when: when.trim(),
    };
    setSessions((prev) => [req, ...prev]);
    setProposing(null);
    setWhen("");
  }

  function openChat(name: string) {
    setChats((prev) => ({ ...prev, [name]: prev[name] || [] }));
    setChatWith(name);
    setChatText("");
  }

  function sendChat() {
    if (!chatWith) return;
    const text = chatText.trim();
    if (!text) return;
    setChats((prev) => {
      const next: ChatMap = { ...prev };
      const msgs = next[chatWith] ? [...next[chatWith]] : [];
      msgs.push({ id: crypto.randomUUID(), from: "you", text, at: new Date().toISOString() });
      next[chatWith] = msgs;
      writeChats(next);
      return next;
    });
    setChatText("");
    setTimeout(() => {
      setChats((prev) => {
        const next: ChatMap = { ...prev };
        const msgs = next[chatWith] ? [...next[chatWith]] : [];
        msgs.push({ id: crypto.randomUUID(), from: "them", text: "Got it!", at: new Date().toISOString() });
        next[chatWith!] = msgs;
        writeChats(next);
        return next;
      });
    }, 600);
  }

  return (
    <div className="py-10">
      <header className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Matches</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Suggested teacher–learner pairings based on your skills. Matching respects adjacent ladder tiers for fairness.
        </p>
      </header>

      <section className="mx-auto mt-8 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Teachers for your learning</CardTitle>
                  <CardDescription>{teacherMatches.length} suggestion{teacherMatches.length === 1 ? "" : "s"}</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Campus-only</span>
                  <Switch checked={campusOnly} onCheckedChange={(v)=> setCampusOnly(Boolean(v))} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {teacherMatches.length === 0 && (
                <p className="text-sm text-muted-foreground">No suggestions yet. Add some learning skills or advance your tiers.</p>
              )}
              {teacherMatches.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{m.counterpartName}</span>
                      <Badge variant="secondary">{m.counterpartRole === "teacher" ? "Teacher" : "Learner"}</Badge>
                      <Badge>{m.counterpartTier}</Badge>
                      <Badge variant="secondary">Rep {m.reputation}</Badge>
                      <Badge variant="secondary">{m.campus}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground truncate">Skill: {m.skill}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Button onClick={() => openChat(m.counterpartName)} variant="outline">Message</Button>
                    <Button onClick={() => proposeSession(m)}>
                      <CalendarClock className="mr-1 h-4 w-4" /> Request Session
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Learners for your teaching</CardTitle>
              <CardDescription>{learnerMatches.length} suggestion{learnerMatches.length === 1 ? "" : "s"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {learnerMatches.length === 0 && (
                <p className="text-sm text-muted-foreground">No suggestions yet. Add some teaching skills or advance your tiers.</p>
              )}
              {learnerMatches.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{m.counterpartName}</span>
                      <Badge variant="secondary">{m.counterpartRole === "teacher" ? "Teacher" : "Learner"}</Badge>
                      <Badge>{m.counterpartTier}</Badge>
                      <Badge variant="secondary">Rep {m.reputation}</Badge>
                      <Badge variant="secondary">{m.campus}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground truncate">Skill: {m.skill}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Button onClick={() => openChat(m.counterpartName)} variant="outline">Message</Button>
                    <Button onClick={() => proposeSession(m)} variant="ghost">
                      <Handshake className="mr-1 h-4 w-4" /> Offer help
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming requests</CardTitle>
              <CardDescription>{sessions.length} scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.length === 0 && (
                <p className="text-sm text-muted-foreground">No session requests yet.</p>
              )}
              {sessions.map((s) => (
                <div key={s.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{s.skill}</span>
                    <Badge variant="secondary">{new Date(s.when).toLocaleString() || s.when}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">With {s.withUser}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>

      <Dialog open={!!proposing} onOpenChange={(open) => (!open ? setProposing(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a session</DialogTitle>
          </DialogHeader>
          {proposing && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">With {proposing.counterpartName} • {proposing.counterpartRole === "teacher" ? "Teacher" : "Learner"} • {proposing.skill} ({proposing.counterpartTier})</p>
              <LabelledInput label="When" placeholder="YYYY-MM-DD HH:mm" value={when} onChange={setWhen} />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setProposing(null)}>Cancel</Button>
            <Button onClick={confirmSession} disabled={!when.trim()}>Send request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!chatWith} onOpenChange={(open) => (!open ? setChatWith(null) : null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chat with {chatWith}</DialogTitle>
          </DialogHeader>
          <div className="flex h-72 flex-col gap-3">
            <div className="flex-1 overflow-y-auto rounded-md border p-3 space-y-2 bg-background/50">
              {(chatWith && chats[chatWith] ? chats[chatWith] : []).map((m) => (
                <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.from === 'you' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-secondary'}`}>
                  <div>{m.text}</div>
                  <div className="mt-1 text-[10px] opacity-70">{new Date(m.at).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Type a message" value={chatText} onChange={(e)=> setChatText(e.target.value)} onKeyDown={(e)=> { if (e.key === 'Enter') sendChat(); }} />
              <Button onClick={sendChat} disabled={!chatText.trim()}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabelledInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
