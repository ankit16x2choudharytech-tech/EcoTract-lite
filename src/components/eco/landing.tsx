"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  Sparkles,
  Trophy,
  Target,
  Flame,
  TrendingDown,
  Leaf,
  Bike,
  Lightbulb,
  Recycle,
  Users,
  CheckCircle2,
  Gauge,
  Bot,
  CalendarCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brand } from "./brand";
import { Footer } from "./footer";
import { useEcoStore } from "@/lib/store";

const features = [
  {
    icon: Calculator,
    title: "Carbon Calculator",
    desc: "Track transport, electricity, food & waste emissions with science-backed factors.",
  },
  {
    icon: Bot,
    title: "AI Recommendations",
    desc: "Get 5 personalized, actionable tips every week with estimated CO₂ savings.",
  },
  {
    icon: Target,
    title: "Smart Goals",
    desc: "Set eco-goals, earn XP, and turn sustainable choices into lasting habits.",
  },
  {
    icon: Flame,
    title: "Streak System",
    desc: "Daily login + activity logging keeps your momentum going with milestone rewards.",
  },
  {
    icon: Award,
    title: "Badges & XP",
    desc: "Unlock Green Starter, Carbon Fighter, Planet Protector and more as you grow.",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "Compete on lowest emissions, longest streaks and highest XP with the community.",
  },
];

const journey = [
  { icon: Leaf, title: "Sign up", desc: "Create your free account in seconds." },
  {
    icon: CalendarCheck,
    title: "Lifestyle quiz",
    desc: "Tell us about your diet, vehicle and habits.",
  },
  {
    icon: Gauge,
    title: "Carbon score",
    desc: "See your starting footprint instantly.",
  },
  {
    icon: Calculator,
    title: "Log daily",
    desc: "Track transport, power, food & waste.",
  },
  {
    icon: Sparkles,
    title: "AI insights",
    desc: "Get personalized weekly recommendations.",
  },
  { icon: Trophy, title: "Climb ranks", desc: "Earn badges & reach the leaderboard." },
];

const personas = [
  {
    name: "Ankit",
    role: "College Student, 20",
    quote: "“I don't know how environmentally friendly my lifestyle is.”",
    goal: "Track daily habits and improve.",
  },
  {
    name: "Office Employee",
    role: "Working Professional, 28",
    quote: "“I use my car every single day.”",
    goal: "Reduce transport emissions.",
  },
  {
    name: "Families & Colleges",
    role: "Groups & campuses",
    quote: "“We want to run sustainability competitions.”",
    goal: "Compete together on the leaderboard.",
  },
];

export function Landing() {
  const setView = useEcoStore((s) => s.setView);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#who" className="hover:text-foreground">
              Who it's for
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setView("auth")}
              className="hidden sm:inline-flex"
            >
              Log in
            </Button>
            <Button onClick={() => setView("auth")} className="bg-emerald-600 hover:bg-emerald-700">
              Get started free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="eco-grid-bg absolute inset-0 opacity-70" aria-hidden />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-emerald-100 text-emerald-700"
            >
              <Sparkles size={12} className="mr-1" /> 100% free · AI-powered
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Small Daily Actions.{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Big Climate Impact.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              EcoTrack Lite helps you measure your carbon footprint, understand
              which habits emit the most CO₂, and get personalized AI
              recommendations to build lasting sustainable habits.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => setView("auth")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
              >
                Start tracking free <ArrowRight className="ml-2" size={18} />
              </Button>
              <a href="#how" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See how it works
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card · No IoT devices · No subscription
            </p>
          </motion.div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { label: "Avg. reduction", value: "10–15%", icon: TrendingDown },
              { label: "Emission factors", value: "Science", icon: Calculator },
              { label: "AI tips / week", value: "5", icon: Sparkles },
              { label: "Price", value: "Free", icon: CheckCircle2 },
            ].map((s) => (
              <Card
                key={s.label}
                className="border-emerald-100 bg-card/80 backdrop-blur"
              >
                <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
                  <s.icon className="text-emerald-600" size={20} />
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem / vision strip */}
      <section className="border-y border-emerald-100 bg-emerald-50/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">The problem</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Most people don't know which daily activities emit the most CO₂.",
                  "Existing calculators are one-time tools with no ongoing tracking.",
                  "Many solutions need paid subscriptions or IoT devices.",
                  "Users rarely get personalized recommendations.",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Our vision</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Measure your carbon footprint in seconds.",
                  "Understand which habits contribute most to emissions.",
                  "Receive personalized, AI-generated suggestions.",
                  "Build long-term sustainable habits through gamification.",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to cut your footprint
          </h2>
          <p className="mt-3 text-muted-foreground">
            A complete, gamified toolkit that turns climate awareness into
            daily action.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full border-emerald-100 transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-emerald-100 bg-emerald-50/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Your climate journey, step by step
            </h2>
            <p className="mt-3 text-muted-foreground">
              From sign-up to leaderboard in minutes.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {journey.map((step, i) => (
              <div key={step.title} className="relative">
                <Card className="h-full border-emerald-100">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                        <step.icon size={18} />
                      </div>
                      <span className="text-xs font-bold text-emerald-600">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="who" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Who is it for?</h2>
          <p className="mt-3 text-muted-foreground">
            Built for everyone who wants to live more sustainably.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {personas.map((p) => (
            <Card key={p.name} className="border-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-lg font-bold text-white">
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm italic text-muted-foreground">
                  {p.quote}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <Target size={14} /> {p.goal}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Category icons strip */}
      <section className="border-t border-emerald-100 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Bike, label: "Transport" },
              { icon: Lightbulb, label: "Electricity" },
              { icon: Leaf, label: "Food" },
              { icon: Recycle, label: "Waste" },
            ].map((c) => (
              <div
                key={c.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 py-6"
              >
                <c.icon className="text-emerald-600" size={28} />
                <span className="text-sm font-medium">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 px-6 py-14 text-center text-white sm:px-12">
          <div className="eco-grid-bg absolute inset-0 opacity-20" aria-hidden />
          <div className="relative">
            <Users className="mx-auto mb-4" size={36} />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Join a community of eco-conscious changemakers
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-50">
              Start your sustainability journey today — it's free, fun, and
              powered by AI. Every action counts.
            </p>
            <Button
              size="lg"
              onClick={() => setView("auth")}
              className="mt-8 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              Create my free account <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
