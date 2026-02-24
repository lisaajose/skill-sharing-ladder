import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCampus } from "@/hooks/useCampus";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [tab, setTab] = useState<string>("signin");
  return (
    <div className="py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome</h1>
        <p className="mt-2 text-muted-foreground">Sign in to continue or get started with a new account.</p>
      </header>

      <section className="mx-auto mt-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Account access</CardTitle>
            <CardDescription>Use your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Get started</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-6"><SignIn /></TabsContent>
              <TabsContent value="signup" className="mt-6"><SignUp switchToSignIn={() => setTab("signin")} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // remember toggle is ignored in demo; would set cookie/session in real backend
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="••••••••" required />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={(v)=> setRemember(Boolean(v))} />
          <Label htmlFor="remember">Remember me</Label>
        </div>
        <a className="text-sm text-muted-foreground hover:underline" href="#">Forgot password?</a>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}

function SignUp({ switchToSignIn }: { switchToSignIn: () => void }) {
  const { signUp } = useAuth();
  const { campuses, addCampus, campus, setCampus } = useCampus();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [campusName, setCampusName] = useState<string>(campus || "Global");
  const [newCampus, setNewCampus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      let finalCampus = campusName;
      const nc = newCampus.trim();
      if (nc) { addCampus(nc); finalCampus = nc; setCampus(nc); }
      await signUp(name.trim(), email.trim(), password, finalCampus === "Global" ? undefined : finalCampus);
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email2">Email</Label>
          <Input id="email2" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password2">Password</Label>
        <Input id="password2" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="At least 6 characters" required />
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
          <p className="text-xs text-muted-foreground">Choose "Global" to skip campus for now.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-campus">Add a new campus (optional)</Label>
          <Input id="new-campus" value={newCampus} onChange={(e)=> setNewCampus(e.target.value)} placeholder="e.g., Stanford University" />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button disabled={loading} className="w-full">{loading ? "Creating account..." : "Create account"}</Button>
      <p className="text-sm text-muted-foreground text-center">Already have an account? <button type="button" onClick={switchToSignIn} className="text-primary hover:underline">Sign in</button></p>
    </form>
  );
}
