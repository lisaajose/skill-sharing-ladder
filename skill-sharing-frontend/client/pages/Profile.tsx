import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCampus } from "@/hooks/useCampus";

function getInitials(s: string) {
  const str = (s || "").trim();
  if (!str) return "?";
  const parts = str.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return str[0]!.toUpperCase();
}

export default function Profile() {
  const params = useParams();
  const { users, current, updateProfile, changePassword, deleteAccount } = useAuth();
  const { campuses, addCampus, campus, setCampus } = useCampus();

  const viewed = useMemo(() => {
    if (params.id) return users.find((u) => u.id === params.id) || null;
    return current;
  }, [params.id, users, current]);

  const isSelf = !!(viewed && current && viewed.id === current.id);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(viewed?.name || "");
  const [email, setEmail] = useState(viewed?.email || "");
  const [campusName, setCampusName] = useState<string>(viewed?.campus || campus || "Global");
  const [newCampus, setNewCampus] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>(viewed?.avatarUrl || "");
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    // Reset fields when switching viewed user or leaving edit mode
    setName(viewed?.name || "");
    setEmail(viewed?.email || "");
    setCampusName(viewed?.campus || campus || "Global");
    setNewCampus("");
    setAvatarUrl(viewed?.avatarUrl || "");
    setPwd("");
    setError(null);
    setSuccess(null);
    setEditMode(false);
  }, [viewed, campus]);

  if (!viewed) {
    return (
      <div className="py-10">
        <header className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Profile</h1>
          <p className="mt-2 text-muted-foreground">User not found.</p>
        </header>
      </div>
    );
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!isSelf) return;
    setError(null); setSuccess(null); setSaving(true);
    try {
      let finalCampus = campusName;
      const nc = newCampus.trim();
      if (nc) { addCampus(nc); finalCampus = nc; setCampus(nc); }
      await updateProfile({ name: name.trim(), email: email.trim(), campus: finalCampus === "Global" ? undefined : finalCampus, avatarUrl: avatarUrl || undefined });
      setSuccess("Profile saved");
      setNewCampus("");
      setEditMode(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isSelf) return;
    setError(null); setSuccess(null);
    try {
      await changePassword(pwd);
      setSuccess("Password updated");
      setPwd("");
    } catch (err: any) {
      setError(err?.message || "Failed to update password");
    }
  }

  return (
    <div className="py-10">
      <header className="mx-auto max-w-3xl flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Profile</h1>
          <p className="mt-2 text-muted-foreground">{isSelf ? "Update your account details and campus." : "View profile details."}</p>
        </div>
        {isSelf && !editMode && (
          <Button variant="outline" onClick={() => setEditMode(true)}>Edit profile</Button>
        )}
        {isSelf && editMode && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button form="profile-form" type="submit">Save</Button>
          </div>
        )}
      </header>

      {/* View mode */}
      {!editMode && (
        <section className="mx-auto mt-8 max-w-3xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Basic profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewed.avatarUrl || ""} alt={viewed.name} />
                  <AvatarFallback className="text-lg">{getInitials(viewed.name || viewed.email)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="text-xl font-semibold leading-none tracking-tight">{viewed.name}</div>
                  {isSelf && (
                    <div className="text-sm text-muted-foreground">{viewed.email}</div>
                  )}
                  <div className="text-sm text-muted-foreground">Campus: {viewed.campus || "Global"}</div>
                  <div className="text-sm text-muted-foreground">Member since {new Date(viewed.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {isSelf && (
                <div className="mt-4">
                  <Link to="/skills">
                    <Button variant="secondary">Manage skills</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          {isSelf && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" onClick={() => setEditMode(true)}>Edit profile</Button>
                  <Link to="/sessions">
                    <Button variant="outline">View sessions</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="self-start">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Danger zone</CardTitle>
                  <CardDescription className="text-xs">This action is permanent</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" variant="destructive" onClick={() => setDelOpen(true)}>Delete account</Button>
                </CardContent>
              </Card>
            </>
          )}
        </section>
      )}

      {/* Edit mode (self only) */}
      {isSelf && editMode && (
        <section className="mx-auto mt-8 max-w-3xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Edit your profile info</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={onSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl || ""} alt={name || email} />
                    <AvatarFallback className="text-lg">{getInitials(name || email)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile photo</Label>
                    <Input id="avatar" type="file" accept="image/*" onChange={(e)=>{
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { setError("Image too large (max 2MB)"); return; }
                      const reader = new FileReader();
                      reader.onload = () => { setAvatarUrl(String(reader.result || "")); };
                      reader.readAsDataURL(file);
                    }} />
                    {avatarUrl && (
                      <Button type="button" variant="outline" size="sm" onClick={()=> setAvatarUrl("")}>Remove photo</Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e)=> setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campus</Label>
                    <Select value={campusName} onValueChange={setCampusName}>
                      <SelectTrigger aria-label="Campus">
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campuses.map((c)=> (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-campus">Add campus (optional)</Label>
                    <Input id="new-campus" value={newCampus} onChange={(e)=> setNewCampus(e.target.value)} placeholder="e.g., Stanford University" />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <div className="flex gap-2">
                  <Button disabled={saving} type="submit">{saving ? "Saving..." : "Save changes"}</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onChangePassword} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="pwd">New password</Label>
                  <Input id="pwd" type="password" value={pwd} onChange={(e)=> setPwd(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <Button type="submit" variant="outline">Update password</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="self-start">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Danger zone</CardTitle>
              <CardDescription className="text-xs">This action is permanent</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button size="sm" variant="destructive" onClick={() => setDelOpen(true)}>Delete account</Button>
            </CardContent>
          </Card>
        </section>
      )}

      {isSelf && (
        <Dialog open={delOpen} onOpenChange={setDelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">This will permanently remove your account and data from this device. This cannot be undone.</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDelOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setDelOpen(false); deleteAccount(); }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
