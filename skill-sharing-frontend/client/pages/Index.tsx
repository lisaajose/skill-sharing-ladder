import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  BookOpen,
  Handshake,
  CalendarClock,
  Star,
  Trophy,
  ShieldCheck,
  LineChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { current } = useAuth();
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-primary/30 to-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-purple-500/20 to-primary/30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl py-16 sm:py-24 text-center">
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Skill Sharing, Reinvented with the Ladder
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Advance by teaching. Grow by learning. Our structured, gamified ladder matches you with the right peers, enforces contribution-before-progression, and tracks your verified progress.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!current && (
              <Link to="/auth">
                <Button size="lg" className="h-12 px-6 bg-gradient-to-r from-primary to-purple-500">
                  Get Started
                  <ArrowRight className="ml-1" />
                </Button>
              </Link>
            )}
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 px-6">Learn More</Button>
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Reputation</Badge>
            <Badge variant="secondary">Levels</Badge>
            <Badge variant="secondary">Verified Skills</Badge>
          </div>
        </div>
      </section>

      {/* Ladder preview */}
      <section className="mx-auto mt-4 max-w-6xl">
        <h2 className="text-2xl font-bold mb-4">Tier System</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { level: "Beginner", desc: "Start here. Learn the basics from peers just above you.", hue: "from-blue-500/20" },
            { level: "Intermediate", desc: "Teach fundamentals while you learn advanced topics.", hue: "from-violet-500/20" },
            { level: "Expert", desc: "Verify, mentor, and lead the ladder.", hue: "from-purple-500/20" },
          ].map((l, i) => (
            <Card key={l.level} className="relative overflow-hidden">
              <div className={`pointer-events-none absolute -inset-x-10 -top-10 h-24 bg-gradient-to-b ${l.hue} to-transparent`} />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{l.level}</span>
                  <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">Tier {i + 1}</span>
                </CardTitle>
                <CardDescription>{l.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Ladder rules enforce adjacent-level matching
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature icon={<Users />} title="User Accounts & Roles" desc="Register, login, and manage profiles with teacher/learner roles and current ladder level."/>
          <Feature icon={<BookOpen />} title="Skills & Tiers" desc="Add skills to teach or learn, set proficiency, and track tiered progress."/>
          <Feature icon={<Handshake />} title="Smart Matching" desc="Form teacher–learner chains with adjacency rules to keep learning fair and structured."/>
          <Feature icon={<CalendarClock />} title="Sessions" desc="Schedule and log sessions, capture outcomes, feedback, and ratings."/>
          <Feature icon={<LineChart />} title="Progress Tracking" desc="Completion percentages, peer verifications, and auto-level ups when requirements are met."/>
          <Feature icon={<Trophy />} title="Gamification" desc="Reputation, levels, badges, and optional leaderboards to reward real contributions."/>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-2xl font-bold mb-4">Steps to get started</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Pick skills</CardTitle>
              <CardDescription>Select what you can teach and what you want to learn.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your initial level per skill sets your ladder position.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>2. Get matched</CardTitle>
              <CardDescription>We pair you with learners and teachers at adjacent tiers.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Contribution-before-progression ensures reciprocity.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>3. Log sessions</CardTitle>
              <CardDescription>Record outcomes, feedback, and ratings to build reputation.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Verified progress levels you up and unlocks new matches.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-6xl">
        <div className="rounded-2xl border p-8 md:p-10 bg-gradient-to-br from-primary/10 to-purple-500/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Ready to climb?</h3>
              <p className="mt-1 text-muted-foreground">Create your profile, choose your skills, and join the Skill Sharing Ladder today.</p>
            </div>
            <div className="flex gap-3">
              {!current && (
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500">Create account</Button>
                </Link>
              )}
              <Link to="/skills">
                <Button size="lg" variant="outline">Browse skills</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
