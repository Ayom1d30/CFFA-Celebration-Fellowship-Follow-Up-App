"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { MOCK_BUDDY, CURRENT_PAIR } from "@/lib/mock-data";

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function FakeQr({ token }: { token: string }) {
  const cells = useMemo(() => {
    const seed = token.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rand = seededRandom(seed || 1);
    const size = 21;
    const grid: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) {
        const inCorner =
          (x < 7 && y < 7) || (x > size - 8 && y < 7) || (x < 7 && y > size - 8);
        row.push(inCorner ? (x % 6 === 0 || y % 6 === 0 ? true : false) : rand() > 0.5);
      }
      grid.push(row);
    }
    return grid;
  }, [token]);

  return (
    <div className="inline-block rounded-xl border-4 border-white bg-white p-3 shadow-sm">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(21, minmax(0, 1fr))` }}>
        {cells.flat().map((filled, i) => (
          <span key={i} className="h-2 w-2" style={{ background: filled ? "#1F2937" : "transparent" }} />
        ))}
      </div>
    </div>
  );
}

export default function CheckinPage() {
  const [token, setToken] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => setExpiresIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [token]);

  function generate() {
    const t = Math.random().toString(16).slice(2);
    setToken(t);
    setExpiresIn(300);
    setVerified(false);
  }

  function verify() {
    if (verifyCode.trim()) setVerified(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Buddy check-in</h1>
        <p className="mt-1 text-muted">
          Verify an in-person interaction with {MOCK_BUDDY.name}.
        </p>
      </header>

      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <Badge color="primary" icon="qr">
          QR verification · +15 XP each
        </Badge>

        {verified ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon name="checkin" className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold text-foreground">Verified!</p>
            <p className="text-sm text-muted">
              Both you and {MOCK_BUDDY.name} earned +15 XP.
            </p>
            <Button variant="secondary" onClick={() => setVerified(false)}>
              Check in again
            </Button>
          </>
        ) : token ? (
          <>
            <FakeQr token={token} />
            <p className="text-sm font-semibold text-foreground">
              {CURRENT_PAIR.userId}-{CURRENT_PAIR.id}:{token}
            </p>
            <p className="text-sm text-muted">
              Ask {MOCK_BUDDY.name} to scan this code within{" "}
              {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}.
            </p>
            <Button variant="secondary" onClick={generate}>
              Generate new code
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted">
              Generate a temporary code, then have your buddy verify it in person.
            </p>
            <Button size="lg" onClick={generate}>
              <Icon name="qr" className="h-5 w-5" />
              Generate code
            </Button>
          </>
        )}
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">
          HAVE A CODE? VERIFY YOUR BUDDY
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Input
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="Enter code from your buddy"
            className="flex-1"
          />
          <Button onClick={verify} variant="secondary">
            Verify
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Codes expire after 5 minutes and can only be used once. This is an
          accountability tool, not surveillance.
        </p>
      </Card>
    </div>
  );
}
