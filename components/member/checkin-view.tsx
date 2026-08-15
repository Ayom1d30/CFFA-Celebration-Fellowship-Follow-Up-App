"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { createCheckinToken, verifyCheckin } from "@/lib/data/client";

const TOKEN_TTL_SECONDS = 300;

export function CheckinView({
  pairId,
  buddyName,
  demo,
}: {
  pairId: string;
  buddyName: string;
  demo: boolean;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => setExpiresIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [token]);

  async function generate() {
    setError(null);
    setVerified(false);

    if (demo) {
      const t = Math.random().toString(16).slice(2, 18);
      setToken(t);
      setExpiresIn(TOKEN_TTL_SECONDS);
      const url = await QRCode.toDataURL(`cffa-checkin:${t}`, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
      });
      setQrDataUrl(url);
      return;
    }

    setLoading(true);
    const { data, error: e } = await createCheckinToken(pairId);
    setLoading(false);
    if (e || !data) {
      setError(e ?? "Could not generate a code");
      return;
    }
    setToken(data);
    setExpiresIn(TOKEN_TTL_SECONDS);
    const url = await QRCode.toDataURL(`cffa-checkin:${data}`, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
    });
    setQrDataUrl(url);
  }

  async function verify() {
    const value = verifyCode.trim();
    if (!value) return;
    setError(null);

    if (demo) {
      setVerified(true);
      return;
    }

    setLoading(true);
    const { error: e } = await verifyCheckin(value);
    setLoading(false);
    if (e) {
      setError(e);
      return;
    }
    setVerified(true);
  }

  const mm = String(Math.floor(expiresIn / 60)).padStart(2, "0");
  const ss = String(expiresIn % 60).padStart(2, "0");

  async function copyCode() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — select the code below and copy manually.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Buddy check-in</h1>
        <p className="mt-1 text-muted">
          Verify an in-person interaction with {buddyName}.
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
              Both you and {buddyName} earned +15 XP.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setVerified(false);
                setToken(null);
                setQrDataUrl(null);
              }}
            >
              Check in again
            </Button>
          </>
        ) : qrDataUrl && token ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="Check-in QR code"
              className="rounded-xl border-4 border-white bg-white shadow-sm"
            />
            <p className="w-full break-all rounded-xl border border-border bg-surface p-3 font-mono text-xs text-muted">
              {token}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={copyCode}>
                {copied ? "Copied!" : "Copy code"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={generate}
                disabled={loading}
              >
                {loading ? "Generating…" : "Generate new code"}
              </Button>
            </div>
            <p className="text-sm text-muted">
              Ask {buddyName} to scan the QR or enter the code above within{" "}
              <span className="font-semibold text-foreground">
                {mm}:{ss}
              </span>
              .
            </p>
          </>
        ) : (
          <>
            <p className="text-muted">
              Generate a temporary code, then have your buddy verify it in
              person.
            </p>
            <Button size="lg" onClick={generate} disabled={loading}>
              <Icon name="qr" className="h-5 w-5" />
              {loading ? "Generating…" : "Generate code"}
            </Button>
          </>
        )}

        {error ? (
          <p className="text-sm font-medium text-danger">{error}</p>
        ) : null}
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
          <Button onClick={verify} variant="secondary" disabled={loading}>
            {loading ? "Verifying…" : "Verify"}
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
