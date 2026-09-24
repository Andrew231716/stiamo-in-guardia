import { describe, expect, it } from "vitest";
import { dueJobsForSubscription, localParts, pruneFired } from "@/lib/push/due";
import type { StoredPushSubscription } from "@/lib/push/types";

const baseSub = (): StoredPushSubscription => ({
  id: "1",
  endpoint: "https://example.com/push",
  keys: { p256dh: "x", auth: "y" },
  timezone: "Europe/Rome",
  settings: {
    dailyActivity: { enabled: true, time: "08:00" },
    checkIn: { enabled: true, time: "09:00" },
    prayer: { enabled: false, time: "21:00" },
  },
  fired: {},
  updatedAt: new Date().toISOString(),
});

describe("push due", () => {
  it("computes local parts in Europe/Rome", () => {
    const utc = new Date("2026-03-24T07:05:00.000Z"); // 08:05 Rome (CET+1 winter? March 24 is CEST UTC+2)
    // 2026-03-24 is after last Sunday of March? Last Sunday March 2026 is March 29, so still CET UTC+1 → 08:05
    const parts = localParts(utc, "Europe/Rome");
    expect(parts.date).toBe("2026-03-24");
    expect(parts.time).toBe("08:05");
    expect(parts.minutes).toBe(8 * 60 + 5);
  });

  it("marks job due after scheduled local time", () => {
    const now = new Date("2026-03-24T07:05:00.000Z"); // 08:05 Rome
    const due = dueJobsForSubscription(baseSub(), now);
    expect(due.map((d) => d.job.id)).toEqual(["dailyActivity"]);
  });

  it("includes later jobs once their time has passed", () => {
    const now = new Date("2026-03-24T08:30:00.000Z"); // 09:30 Rome
    const due = dueJobsForSubscription(baseSub(), now);
    expect(due.map((d) => d.job.id)).toEqual(["dailyActivity", "checkIn"]);
  });

  it("skips already fired jobs", () => {
    const now = new Date("2026-03-24T07:05:00.000Z");
    const sub = baseSub();
    sub.fired["2026-03-24:dailyActivity"] = true;
    expect(dueJobsForSubscription(sub, now)).toHaveLength(0);
  });

  it("prunes old fired keys", () => {
    const pruned = pruneFired(
      {
        "2026-03-20:dailyActivity": true,
        "2026-03-24:checkIn": true,
      },
      "2026-03-24",
    );
    expect(pruned["2026-03-20:dailyActivity"]).toBeUndefined();
    expect(pruned["2026-03-24:checkIn"]).toBe(true);
  });
});
