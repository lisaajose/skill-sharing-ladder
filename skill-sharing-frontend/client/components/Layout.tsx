import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCampus } from "@/hooks/useCampus";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Home", protected: false },
  { to: "/skills", label: "Skills", protected: true },
  { to: "/matches", label: "Matches", protected: true },
  { to: "/sessions", label: "Sessions", protected: true },
  { to: "/progress", label: "Progress", protected: true },
  { to: "/leaderboard", label: "Leaderboard", protected: true },
] as const;

function getInitials(s: string) {
  const str = (s || "").trim();
  if (!str) return "?";
  const parts = str.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return str[0]!.toUpperCase();
}

function Header() {
  const { campuses, campus, setCampus } = useCampus();
  const { current, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-purple-500" />
          <span className="text-lg leading-7 font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Ladder
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navItems
            .filter((n) => !n.protected || !!current)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="flex items-center gap-2">
          {!current ? (
            <>
              <Link to="/auth">
                <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-primary to-purple-500">Get Started</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Open profile menu" className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={current.avatarUrl || ""} alt={current.name} />
                    <AvatarFallback>{getInitials(current.name || current.email)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">View profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e)=>{ e.preventDefault(); signOut(); }}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto py-10 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-purple-500" />
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Ladder. All rights reserved.</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

function AddCampusButton() {
  const { addCampus } = useCampus();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Add campus</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a campus</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input value={name} onChange={(e)=> setName(e.target.value)} placeholder="e.g., Stanford University" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={()=> setOpen(false)}>Cancel</Button>
            <Button onClick={()=> { if (name.trim()) { addCampus(name.trim()); setName(""); setOpen(false); } }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
