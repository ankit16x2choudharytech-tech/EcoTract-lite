"use client";

import { useState } from "react";
import {
  Leaf,
  Github,
  Twitter,
  Heart,
  Mail,
  MapPin,
  Shield,
  FileText,
  Cookie,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Brand } from "./brand";

type LegalModal = "privacy" | "terms" | "cookies" | "contact" | null;

export function Footer() {
  const [modal, setModal] = useState<LegalModal>(null);

  return (
    <footer className="mt-auto border-t border-emerald-100 bg-emerald-50/60 dark:bg-emerald-950/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Brand />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              A 100% free AI-powered platform to measure your carbon footprint,
              build sustainable habits, and make a real climate impact.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Carbon Calculator</li>
              <li>AI Insights</li>
              <li>Goals & Badges</li>
              <li>Community Leaderboard</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal & Support</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setModal("privacy")}
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-emerald-700"
                >
                  <Shield size={13} /> Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal("terms")}
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-emerald-700"
                >
                  <FileText size={13} /> Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal("cookies")}
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-emerald-700"
                >
                  <Cookie size={13} /> Cookie Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal("contact")}
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-emerald-700"
                >
                  <Mail size={13} /> Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-emerald-100 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-1.5">
            Built with <Heart size={14} className="text-emerald-600" /> for a
            greener planet · © {new Date().getFullYear()} EcoTrack Lite
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="rounded-md p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href="#"
              className="rounded-md p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <span className="flex items-center gap-1 text-xs">
              <Leaf size={14} className="text-emerald-600" /> Carbon-neutral
              web
            </span>
          </div>
        </div>
      </div>

      {/* Legal modals */}
      <LegalModals modal={modal} setModal={setModal} />
    </footer>
  );
}

function LegalModals({
  modal,
  setModal,
}: {
  modal: LegalModal;
  setModal: (m: LegalModal) => void;
}) {
  return (
    <>
      {/* Privacy Policy */}
      <Dialog open={modal === "privacy"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="text-emerald-600" size={20} /> Privacy Policy
            </DialogTitle>
            <DialogDescription>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <Section title="1. Information We Collect">
              We collect the information you provide when creating an account:
              your name, email, age, city, country, occupation, diet preference,
              and vehicle type. We also collect daily activity logs you submit
              (transport, electricity, food, and waste data) to calculate your
              carbon footprint.
            </Section>
            <Section title="2. How We Use Your Information">
              Your data is used to: calculate your personal carbon footprint,
              generate personalized AI recommendations, track your progress and
              streaks, display your ranking on the community leaderboard, and
              award you badges and XP. We never sell your data to third parties.
            </Section>
            <Section title="3. Data Storage & Security">
              Your data is stored securely in our database. Passwords are hashed
              using SHA-256 before storage. Authentication tokens are stored in
              your browser&apos;s local storage. We use HTTPS for all data
              transmission.
            </Section>
            <Section title="4. Data Retention & Deletion">
              Your data is retained for as long as your account is active. You
              can request account deletion at any time from Settings, which
              permanently removes all your logs, goals, and badges.
            </Section>
            <Section title="5. Cookies">
              We use minimal cookies for authentication and session management.
              See our Cookie Policy for details.
            </Section>
            <Section title="6. Your Rights">
              You have the right to access, correct, or delete your personal
              data. Contact us at admin@ecotrack.app for any data requests.
            </Section>
            <Section title="7. AI Processing">
              To generate personalized recommendations, we send anonymized
              summaries of your activity data to our AI provider. No personally
              identifiable information is shared.
            </Section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions */}
      <Dialog open={modal === "terms"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="text-emerald-600" size={20} /> Terms &amp; Conditions
            </DialogTitle>
            <DialogDescription>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <Section title="1. Acceptance of Terms">
              By creating an account and using EcoTrack Lite, you agree to these
              Terms &amp; Conditions. If you do not agree, please do not use the
              service.
            </Section>
            <Section title="2. Free Service">
              EcoTrack Lite is a 100% free platform. We do not charge any
              subscription fees. The service is provided &quot;as is&quot; without
              warranties of any kind.
            </Section>
            <Section title="3. User Responsibilities">
              You agree to: provide accurate information, not misuse the
              platform, not attempt to manipulate XP or leaderboard rankings, and
              respect other community members. Admins may revoke access for
              violations.
            </Section>
            <Section title="4. Carbon Estimates">
              Carbon footprint calculations are estimates based on public
              emission factors and average device consumption. They are for
              awareness purposes and may not reflect exact emissions.
            </Section>
            <Section title="5. AI Recommendations">
              AI-generated recommendations are suggestions only and should not be
              considered professional advice. Always use your own judgment when
              making lifestyle changes.
            </Section>
            <Section title="6. Intellectual Property">
              All content, branding, and software on EcoTrack Lite are owned by
              the platform. User-generated data belongs to the respective users.
            </Section>
            <Section title="7. Limitation of Liability">
              EcoTrack Lite is not liable for any damages arising from the use of
              the platform or reliance on its calculations and recommendations.
            </Section>
            <Section title="8. Changes to Terms">
              We may update these terms periodically. Continued use after
              changes constitutes acceptance of the updated terms.
            </Section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cookie Policy */}
      <Dialog open={modal === "cookies"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="text-emerald-600" size={20} /> Cookie Policy
            </DialogTitle>
            <DialogDescription>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <Section title="What Are Cookies?">
              Cookies are small text files stored on your device. EcoTrack Lite
              uses them and browser local storage to keep you logged in and
              remember your preferences.
            </Section>
            <Section title="Cookies We Use">
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Authentication token</strong> — stored in local storage to keep you logged in across sessions.</li>
                <li><strong>User session</strong> — remembers your current view and activity data for fast navigation.</li>
                <li><strong>Theme preference</strong> — remembers your light/dark/system theme choice.</li>
              </ul>
            </Section>
            <Section title="Cookies We Don't Use">
              We do <strong>not</strong> use: third-party advertising cookies,
              tracking cookies for marketing, social media tracking pixels, or
              analytics cookies that profile your behavior across other sites.
            </Section>
            <Section title="Managing Cookies">
              You can clear your local storage at any time from your browser
              settings or by logging out. This will sign you out and reset your
              session, but your account data remains safely stored on our
              servers.
            </Section>
            <Section title="Privacy First">
              EcoTrack Lite is committed to a privacy-first approach. We collect
              only what&apos;s needed to provide the service — no more, no less.
            </Section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Us */}
      <Dialog open={modal === "contact"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="text-emerald-600" size={20} /> Contact Us
            </DialogTitle>
            <DialogDescription>
              We&apos;d love to hear from you. Reach out with any questions,
              feedback, or support requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ContactRow
              icon={Mail}
              label="Email"
              value="admin@ecotrack.app"
              href="mailto:admin@ecotrack.app"
            />
            <ContactRow
              icon={Phone}
              label="Support"
              value="Mon–Fri, 9 AM – 6 PM IST"
            />
            <ContactRow
              icon={MapPin}
              label="Location"
              value="Mumbai, India"
            />
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
              <h4 className="text-sm font-semibold text-emerald-800">Send us a message</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                For bug reports, feature requests, or partnership inquiries,
                email us directly. We typically respond within 1–2 business days.
              </p>
              <a
                href="mailto:admin@ecotrack.app?subject=EcoTrack Lite Inquiry"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Mail size={14} /> Email us
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        <Icon size={16} />
      </span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
}
