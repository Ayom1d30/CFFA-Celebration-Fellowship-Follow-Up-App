"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icons";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!configured) {
      router.push("/home");
      return;
    }

    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Icon name="back" className="h-4 w-4" />
          Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-foreground">Welcome back 👋</h1>
      <p className="mt-2 text-muted">Sign in to see your buddy this week.</p>

      {!configured ? (
        <Card className="mt-6 border-warning/40 bg-warning/10 p-4 text-sm">
          <p className="font-semibold text-foreground">Backend not connected yet</p>
          <p className="mt-1 text-muted">
            Add your Supabase URL and anon key to <code>.env.local</code> to enable
            real sign-in. For now you can continue to the demo dashboard.
          </p>
        </Card>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@celebration.org"
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <p className="text-sm font-medium text-danger">{error}</p>
        ) : null}

        <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to CFFA?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
