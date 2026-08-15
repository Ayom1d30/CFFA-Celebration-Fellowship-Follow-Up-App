"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  generatePairingsNow,
  getPairingSchedule,
  setPairingSchedule,
  type PairingSchedule,
} from "@/lib/data/client";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function PairingScheduleCard() {
  const [schedule, setSchedule] = useState<PairingSchedule | null>(null);
  const [weekday, setWeekday] = useState(2);
  const [time, setTime] = useState("02:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data, error: e } = await getPairingSchedule();
      if (!active) return;
      setLoading(false);
      if (e) {
        setError(e);
        return;
      }
      if (data) {
        setSchedule(data);
        if (data.weekday != null) setWeekday(data.weekday);
        if (data.time) setTime(data.time);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const { data, error: e } = await setPairingSchedule(weekday, time);
    setSaving(false);
    if (e) {
      setError(e);
      return;
    }
    setSchedule(data);
    setMessage("Schedule updated");
  }

  async function runNow() {
    setGenerating(true);
    setError(null);
    setMessage(null);
    const { data, error: e } = await generatePairingsNow();
    setGenerating(false);
    if (e) {
      setError(e);
      return;
    }
    setMessage(`Generated ${data ?? 0} new pairings`);
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-foreground">
          Weekly pairing schedule
        </h3>
        <Badge color={schedule?.enabled ? "success" : "warning"}>
          {schedule?.enabled ? "Auto-pairing on" : "Auto-pairing off"}
        </Badge>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-muted">Loading schedule…</p>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold tracking-wider text-muted">
                DAY
              </span>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {WEEKDAYS.map((day, i) => (
                  <option key={day} value={i}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold tracking-wider text-muted">
                TIME (24H)
              </span>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>

            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save schedule"}
            </Button>
          </div>

          {schedule?.schedule ? (
            <p className="mt-4 text-sm text-muted">
              Members are re-paired every{" "}
              <span className="font-semibold text-foreground">
                {WEEKDAYS[schedule.weekday ?? 2]}
              </span>{" "}
              at{" "}
              <span className="font-semibold text-foreground">
                {schedule.time}
              </span>{" "}
              <span className="font-mono text-xs">({schedule.schedule})</span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No scheduled job found — pairings only run manually for now.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={runNow}
              disabled={generating}
            >
              {generating ? "Generating…" : "Run pairings now"}
            </Button>
            {message ? (
              <span className="text-xs font-semibold text-success">
                {message}
              </span>
            ) : null}
          </div>

          {error ? (
            <p className="mt-3 text-xs font-medium text-danger">{error}</p>
          ) : null}
        </>
      )}
    </Card>
  );
}
