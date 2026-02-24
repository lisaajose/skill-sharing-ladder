import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";

export type SkillRole = "teach" | "learn";
export type LadderTier = "Beginner" | "Intermediate" | "Expert";

interface SkillEntry {
  id: string;
  name: string;
  role: SkillRole;
  tier: LadderTier;
  proficiency: number; // 0..100
}

const STORAGE_KEY = "ladder.skills.v1";

function readSkills(): SkillEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SkillEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSkills(skills: SkillEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
}

export default function Skills() {
  const [skills, setSkills] = useState<SkillEntry[]>([]);

  // Add form state
  const [name, setName] = useState("");
  const [role, setRole] = useState<SkillRole>("learn");
  const [tier, setTier] = useState<LadderTier>("Beginner");
  const [prof, setProf] = useState<number>(20);

  // Edit dialog state
  const [editing, setEditing] = useState<SkillEntry | null>(null);
  const [editDraft, setEditDraft] = useState<SkillEntry | null>(null);

  useEffect(() => {
    setSkills(readSkills());
  }, []);

  useEffect(() => {
    writeSkills(skills);
  }, [skills]);

  const teachList = useMemo(() => skills.filter((s) => s.role === "teach"), [skills]);
  const learnList = useMemo(() => skills.filter((s) => s.role === "learn"), [skills]);

  function addSkill() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const entry: SkillEntry = {
      id: crypto.randomUUID(),
      name: trimmed,
      role,
      tier,
      proficiency: Math.max(0, Math.min(100, Math.round(prof))),
    };
    setSkills((prev) => [entry, ...prev]);
    setName("");
    setRole("learn");
    setTier("Beginner");
    setProf(20);
  }

  function removeSkill(id: string) {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function openEdit(s: SkillEntry) {
    setEditing(s);
    setEditDraft({ ...s });
  }

  function saveEdit() {
    if (!editDraft) return;
    setSkills((prev) => prev.map((s) => (s.id === editDraft.id ? editDraft : s)));
    setEditing(null);
    setEditDraft(null);
  }

  return (
    <div className="py-10">
      <header className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Skills</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Add skills you can teach or want to learn. Track your tier and proficiency to power matching and ladder progression.
        </p>
      </header>

      <section className="mx-auto mt-8 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add a skill</CardTitle>
            <CardDescription>Define role, tier, and proficiency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill name</Label>
              <Input id="skill-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., React, Guitar, Spanish" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as SkillRole)}>
                  <SelectTrigger aria-label="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learn">Learn</SelectItem>
                    <SelectItem value="teach">Teach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={tier} onValueChange={(v) => setTier(v as LadderTier)}>
                  <SelectTrigger aria-label="tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Proficiency</Label>
                <span className="text-xs text-muted-foreground">{prof}%</span>
              </div>
              <Slider value={[prof]} onValueChange={(v) => setProf(v[0] ?? 0)} min={0} max={100} step={1} />
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-purple-500" onClick={addSkill}>
              <Plus className="mr-1 h-4 w-4" /> Add skill
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <SkillGroup title="Learning" empty="No skills to learn yet." items={learnList} onEdit={openEdit} onRemove={removeSkill} />
          <SkillGroup title="Teaching" empty="No teaching skills yet." items={teachList} onEdit={openEdit} onRemove={removeSkill} />
        </div>
      </section>

      <Dialog open={!!editing} onOpenChange={(open) => (!open ? setEditing(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit skill</DialogTitle>
          </DialogHeader>
          {editDraft && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={editDraft.role} onValueChange={(v) => setEditDraft({ ...editDraft, role: v as SkillRole })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learn">Learn</SelectItem>
                      <SelectItem value="teach">Teach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={editDraft.tier} onValueChange={(v) => setEditDraft({ ...editDraft, tier: v as LadderTier })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Proficiency</Label>
                  <span className="text-xs text-muted-foreground">{editDraft.proficiency}%</span>
                </div>
                <Slider value={[editDraft.proficiency]} onValueChange={(v) => setEditDraft({ ...editDraft, proficiency: v[0] ?? 0 })} min={0} max={100} step={1} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setEditing(null); setEditDraft(null); }}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkillGroup({ title, empty, items, onEdit, onRemove }: { title: string; empty: string; items: SkillEntry[]; onEdit: (s: SkillEntry) => void; onRemove: (id: string) => void; }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{items.length} {items.length === 1 ? "entry" : "entries"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
        {items.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{s.name}</span>
                <Badge variant="secondary">{s.tier}</Badge>
                <Badge>{s.role === "teach" ? "Teach" : "Learn"}</Badge>
              </div>
              <div className="mt-2 w-full max-w-md">
                <Progress value={s.proficiency} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(s)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onRemove(s.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
