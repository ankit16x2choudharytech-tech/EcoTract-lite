"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brand } from "./brand";
import { Footer } from "./footer";
import { useEcoStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

// Official Google "G" logo (4-color)
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function AuthView() {
  const setView = useEcoStore((s) => s.setView);
  const setSession = useEcoStore((s) => s.setSession);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } =
        mode === "signup"
          ? await api.signup(name, email, password)
          : await api.login(email, password);
      setSession(user, token);
      toast.success(
        mode === "signup"
          ? "Welcome to EcoTrack Lite! 🌱"
          : `Welcome back, ${user.name}!`
      );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      // Dynamically import Firebase client-side auth (SSR-safe)
      const { auth, googleProvider } = await import("@/lib/firebaseClient");
      const { signInWithPopup, getIdToken } = await import("firebase/auth");

      // Launch real Google sign-in popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Get the Firebase ID token to send to our backend
      const idToken = await getIdToken(firebaseUser);

      // Send to our backend API
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google",
          idToken,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Google sign-in failed");
      }

      const data = await res.json();
      setSession(data.user, data.token);
      toast.success(
        data.user.onboarded
          ? `Welcome back, ${data.user.name}!`
          : `Welcome to EcoTrack Lite, ${data.user.name}! 🌱`
      );
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      // Handle specific Firebase auth errors
      if (err?.code === "auth/popup-closed-by-user") {
        toast.error("Google sign-in was cancelled.");
      } else if (err?.code === "auth/unauthorized-domain") {
        toast.error("This domain is not authorized for Google sign-in. Please add it in Firebase Console.");
      } else {
        toast.error(err?.message || "Failed to sign in with Google");
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-emerald-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Brand />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("landing")}
          >
            <ArrowLeft className="mr-1" size={16} /> Back
          </Button>
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 to-green-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="eco-grid-bg absolute inset-0 opacity-20" aria-hidden />
          <div className="relative">
            <Sparkles size={28} />
            <h2 className="mt-6 text-3xl font-bold leading-tight">
              Small Daily Actions.
              <br />
              Big Climate Impact.
            </h2>
            <p className="mt-4 max-w-sm text-emerald-50">
              Join thousands tracking their footprint, earning badges, and
              shrinking their emissions with AI guidance.
            </p>
          </div>
          <div className="relative space-y-3">
            {[
              "Free forever — no subscription",
              "Personalized AI recommendations weekly",
              "Compete on a global leaderboard",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-emerald-50">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                  ✓
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Continue with Google — REAL Google Auth */}
            <Button
              type="button"
              variant="outline"
              className="mb-4 w-full border-slate-300 bg-white py-2.5 text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="mr-2 animate-spin" size={18} />
              ) : (
                <GoogleLogo size={18} />
              )}
              <span className="ml-2.5 font-medium">
                {googleLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </Button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">
                  or with email
                </span>
              </div>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign up</TabsTrigger>
                <TabsTrigger value="login">Log in</TabsTrigger>
              </TabsList>

              <TabsContent value="signup">
                <Card className="border-emerald-100">
                  <CardContent className="p-6">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Start tracking your footprint in under a minute.
                    </p>
                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="name"
                            placeholder="Ankit Sharma"
                            className="pl-9"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-9"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 animate-spin" size={16} />}
                        Create account
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="login">
                <Card className="border-emerald-100">
                  <CardContent className="p-6">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Log in to continue your sustainability journey.
                    </p>
                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-login">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="email-login"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-login">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="password-login"
                            type="password"
                            placeholder="••••••••"
                            className="pl-9"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 animate-spin" size={16} />}
                        Log in
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
