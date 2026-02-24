import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampus } from "@/hooks/useCampus";

interface ContactEntry { id: string; name: string; email: string; campus?: string; subject: string; message: string; at: string; }
const CONTACT_KEY = "ladder.contact.v1";

function readContacts(): ContactEntry[] { try { const raw = localStorage.getItem(CONTACT_KEY); return raw ? (JSON.parse(raw) as ContactEntry[]) : []; } catch { return []; } }
function writeContacts(list: ContactEntry[]) { localStorage.setItem(CONTACT_KEY, JSON.stringify(list)); }

export default function Contact() {
  const { campuses, campus } = useCampus();
  const [items, setItems] = useState<ContactEntry[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [campusName, setCampusName] = useState<string>(campus || "Global");
  const [sent, setSent] = useState(false);

  useEffect(()=> { setItems(readContacts()); }, []);
  useEffect(()=> { writeContacts(items); }, [items]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const entry: ContactEntry = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim(), campus: campusName === "Global" ? undefined : campusName, at: new Date().toISOString() };
    setItems(prev => [entry, ...prev]);
    setSent(true);
    setName(""); setEmail(""); setSubject(""); setMessage("");
  }

  return (
    <div className="py-10">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact</h1>
        <p className="mt-2 text-muted-foreground">Questions, feedback, or partnership ideas? Send us a message.</p>
      </header>

      <section className="mx-auto mt-8 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>We usually reply within 2 business days</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campus (optional)</Label>
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
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(e)=> setSubject(e.target.value)} placeholder="How can we help?" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={message} onChange={(e)=> setMessage(e.target.value)} rows={6} placeholder="Write your message here..." required />
              </div>
              <Button type="submit" className="w-full sm:w-auto">Send</Button>
              {sent && <p className="text-sm text-green-600">Thanks! Your message has been sent.</p>}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent messages</CardTitle>
            <CardDescription>Stored locally for demo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            {items.slice(0,5).map(i => (
              <div key={i.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{i.subject}</span>
                  <span className="text-xs text-muted-foreground">{new Date(i.at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">From {i.name} {i.campus ? `• ${i.campus}` : ""}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
