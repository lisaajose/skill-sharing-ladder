import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="py-10">
      <header className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Please read these terms carefully before using the Skill Sharing Ladder platform.</p>
      </header>

      <section className="mx-auto mt-8 max-w-4xl space-y-6 text-sm leading-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of terms</CardTitle>
            <CardDescription>Binding agreement</CardDescription>
          </CardHeader>
          <CardContent>
            <p>By accessing or using the platform, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the service.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Accounts & security</CardTitle>
            <CardDescription>Your responsibilities</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate registration details</li>
              <li>Maintain the confidentiality of your credentials</li>
              <li>Notify us of unauthorized use of your account</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User conduct</CardTitle>
            <CardDescription>Acceptable use</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be respectful and truthful when teaching or learning</li>
              <li>No harassment, spam, or illegal activities</li>
              <li>Comply with campus and local regulations when applicable</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Matching & sessions</CardTitle>
            <CardDescription>Ladder rules</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Matching respects adjacent tiers. Session outcomes should be recorded honestly. Contribution-before-progression is enforced.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Gamification</CardTitle>
            <CardDescription>Reputation and badges</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Reputation reflects feedback and verifications. We may adjust scoring to maintain fairness and integrity.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Disclaimers</CardTitle>
            <CardDescription>No warranties</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The platform is provided “as is.” We do not guarantee uninterrupted or error-free operation.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Limitation of liability</CardTitle>
            <CardDescription>To the maximum extent permitted</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We are not liable for indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Termination</CardTitle>
            <CardDescription>Suspension or closure</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We may suspend or terminate accounts that violate these Terms or applicable laws.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes</CardTitle>
            <CardDescription>Policy updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We may update these Terms. Continued use after changes constitutes acceptance.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact</CardTitle>
            <CardDescription>Questions about terms</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use the Contact page to reach us regarding these Terms.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
