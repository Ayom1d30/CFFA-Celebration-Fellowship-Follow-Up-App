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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!configured) {
      router.push("/onboarding");
      return;
    }

    setLoading(true);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/home");
      router.refresh();
    } else {
      router.push("/login?check=email");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Icon name="back" className="h-4 w-4" />
          Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-foreground">Join the fellowship 🎉</h1>
      <p className="mt-2 text-muted">Create your account to get your first buddy.</p>

      {!configured ? (
        <Card className="mt-6 border-warning/40 bg-warning/10 p-4 text-sm">
          <p className="font-semibold text-foreground">Backend not connected yet</p>
          <p className="mt-1 text-muted">
            Add your Supabase URL and anon key to <code>.env.local</code> to enable
            real registration.
          </p>
        </Card>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-foreground">
            Full name
          </label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ayo Adeyemi"
            autoComplete="name"
          />
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        {error ? (
          <p className="text-sm font-medium text-danger">{error}</p>
        ) : null}

        <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
