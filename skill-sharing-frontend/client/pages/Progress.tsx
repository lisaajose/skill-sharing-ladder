import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { LadderTier, SkillRole } from "@/pages/Skills";
import { Pencil, Plus } from "lucide-react";

interface SkillEntry { id: string; name: string; role: SkillRole; tier: LadderTier; proficiency: number; }
interface ProgressEntry { id: string; skillId: string; newProficiency: number; note?: string; verified: boolean; at: string; }

const SKILLS_KEY = "ladder.skills.v1";
const PROGRESS_KEY = "ladder.progress.v1";

function readSkills(): SkillEntry[] {
  try { const raw = localStorage.getItem(SKILLS_KEY); return raw ? (JSON.parse(raw) as SkillEntry[]) : []; } catch { return []; }
}
function writeSkills(skills: SkillEntry[]) { localStorage.setItem(SKILLS_KEY, JSON.stringify(skills)); }
function readProgress(): ProgressEntry[] { try { const raw = localStorage.getItem(PROGRESS_KEY); return raw ? (JSON.parse(raw) as ProgressEntry[]) : []; } catch { return []; } }
function writeProgress(entries: ProgressEntry[]) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(entries)); }

export default function Progress() {
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [history, setHistory] = useState<ProgressEntry[]>([]);

  const [editing, setEditing] = useState<SkillEntry | null>(null);
  const [newValue, setNewValue] = useState<number>(0);
  const [note, setNote] = useState("");
  const [verified, setVerified] = useState<boolean>(true);

  useEffect(() => { setSkills(readSkills()); setHistory(readProgress()); }, []);
  useEffect(() => { writeProgress(history); }, [history]);

  const chartData = useMemo(() => skills.map(s => ({ skill: s.name, value: s.proficiency })), [skills]);

  function openEdit(s: SkillEntry) {
    setEditing(s);
    setNewValue(s.proficiency);
    setNote("");
    setVerified(true);
  }

  function saveProgress() {
    if (!editing) return;
    const clamped = Math.max(0, Math.min(100, Math.round(newValue)));
    const updated = skills.map(s => s.id === editing.id ? { ...s, proficiency: clamped } : s);
    setSkills(updated);
    writeSkills(updated);
    const entry: ProgressEntry = { id: crypto.randomUUID(), skillId: editing.id, newProficiency: clamped, note: note.trim() || undefined, verified, at: new Date().toISOString() };
    setHistory([entry, ...history]);
    setEditing(null);
  }

  const verifiedCount = history.filter(h => h.verified).length;
  const avgProficiency = skills.length ? Math.round(skills.reduce((a, s) => a + s.proficiency, 0) / skills.length) : 0;

  return (
    <div className="py-10">
      <header className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Progress</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Track your learning progress per skill, log verified milestones, and visualize growth.</p>
      </header>

      <section className="mx-auto mt-8 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Proficiency by skill</CardTitle>
              <CardDescription>Current self-assessed proficiency (0–100)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ value: { label: "Proficiency", color: "hsl(var(--primary))" } }}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" tickLine={false} axisLine={false} height={60} interval={0} angle={-10} textAnchor="end"/>
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4,4,0,0]} />
                  <ChartTooltip content={<ChartTooltipContent nameKey="skill" labelKey="skill" />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Per-skill overview</CardTitle>
              <CardDescription>Edit proficiency or log a milestone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills yet. Add some on the Skills page.</p>}
              {skills.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{s.name}</span>
                      <Badge variant="secondary">{s.tier}</Badge>
                      <Badge>{s.role === "teach" ? "Teach" : "Learn"}</Badge>
                    </div>
                    <div className="mt-2 max-w-md">
                      <ProgressBar value={s.proficiency} />
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => openEdit(s)}><Pencil className="mr-1 h-4 w-4" /> Log progress</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
              <CardDescription>Overall summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Skills</span><span className="font-medium">{skills.length}</span></div>
              <div className="flex items-center justify-between"><span>Avg proficiency</span><span className="font-medium">{avgProficiency}%</span></div>
              <div className="flex items-center justify-between"><span>Verified milestones</span><span className="font-medium">{verifiedCount}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent milestones</CardTitle>
              <CardDescription>Last 5 entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.slice(0,5).map(h => {
                const skill = skills.find(s => s.id === h.skillId);
                return (
                  <div key={h.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{skill?.name || "Skill"}</span>
                      <Badge variant={h.verified ? "default" : "secondary"}>{h.verified ? "Verified" : "Unverified"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Set to {h.newProficiency}% on {new Date(h.at).toLocaleString()}</p>
                    {h.note && <p className="mt-1 text-sm">{h.note}</p>}
                  </div>
                );
              })}
              {history.length === 0 && <p className="text-sm text-muted-foreground">No milestones yet.</p>}
            </CardContent>
          </Card>
        </aside>
      </section>

      <Dialog open={!!editing} onOpenChange={(open) => (!open ? setEditing(null) : null)}>
        <DialogContent>
          <DialogHeader><CardTitle>Log progress</CardTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div>
                <div className="text-sm font-medium">{editing.name}</div>
                <p className="text-xs text-muted-foreground">Set new proficiency and optionally add a note.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><Label>Proficiency</Label><span className="text-xs text-muted-foreground">{newValue}%</span></div>
                <Slider min={0} max={100} step={1} value={[newValue]} onValueChange={(v)=> setNewValue(v[0] ?? 0)} />
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <Input value={note} onChange={(e)=> setNote(e.target.value)} placeholder="What did you complete?" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="verified" checked={verified} onCheckedChange={(v)=> setVerified(Boolean(v))} />
                <Label htmlFor="verified">Verified</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={()=> setEditing(null)}>Cancel</Button>
            <Button onClick={saveProgress}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
