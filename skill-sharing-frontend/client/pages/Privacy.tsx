import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="py-10">
      <header className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Your privacy matters. This policy explains what we collect, why, and how we protect it.</p>
      </header>

      <section className="mx-auto mt-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Skill Sharing Ladder platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-foreground/90">
            <p>We collect information to enable user accounts, skill matching, session scheduling, progress tracking, and campus leaderboards. We do not sell personal data.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information we collect</CardTitle>
            <CardDescription>Account and usage data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6">
            <ul className="list-disc pl-5 space-y-1">
              <li>Account data: name, email, and password (hashed)</li>
              <li>Profile data: skills to teach/learn, tiers, campus affiliation</li>
              <li>Usage data: sessions requested, feedback, progress logs</li>
              <li>Technical data: device/browser metadata as needed for security</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How we use data</CardTitle>
            <CardDescription>Core product functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6">
            <ul className="list-disc pl-5 space-y-1">
              <li>Authenticate users and personalize the experience</li>
              <li>Power the matching engine and campus leaderboards</li>
              <li>Maintain session history, progress, and reputation</li>
              <li>Improve reliability, security, and performance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Reasonable safeguards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6">
            <p>Passwords are stored as hashes. Access to data is limited to authorized services. We recommend using a strong and unique password.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention</CardTitle>
            <CardDescription>How long we keep data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6">
            <p>We retain account and activity data for as long as your account remains active or as required by law. You can request deletion of your account and associated data.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your rights</CardTitle>
            <CardDescription>Control your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6">
            <ul className="list-disc pl-5 space-y-1">
              <li>Access, update, or delete your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Questions about privacy</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6">
            <p>Reach out via the Contact page for privacy inquiries. We will respond as soon as possible.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
