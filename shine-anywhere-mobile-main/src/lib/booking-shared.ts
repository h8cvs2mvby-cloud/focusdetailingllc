// Pure, client-safe helpers for computing booking availability against the
// business calendar. No module-scope secrets — gateway keys are passed in.

export const TIME_ZONE = "America/New_York";
export const OPEN_HOUR = 8; // 8:00 AM
export const CLOSE_HOUR = 18; // 6:00 PM
export const SLOT_STEP_MIN = 30;
export const LEAD_TIME_MS = 60 * 60 * 1000; // require at least 1h notice

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

export interface GatewayKeys {
  lovable: string;
  calendar: string;
}

export interface BusyInterval {
  start: number;
  end: number;
}

// Offset (localWall - utc) in ms for a given instant in a time zone.
function tzOffsetMs(instant: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(instant)) map[p.type] = p.value;
  const hour = map.hour === "24" ? "00" : map.hour;
  const asUTC = Date.UTC(
    +map.year,
    +map.month - 1,
    +map.day,
    +hour,
    +map.minute,
    +map.second,
  );
  return asUTC - instant.getTime();
}

// Convert a wall-clock time in a time zone to the correct UTC instant.
export function wallToUtc(
  y: number,
  m: number,
  d: number,
  h: number,
  min: number,
  tz: string,
): Date {
  const guess = Date.UTC(y, m - 1, d, h, min, 0);
  const off = tzOffsetMs(new Date(guess), tz);
  return new Date(guess - off);
}

export async function fetchBusy(dateStr: string, keys: GatewayKeys): Promise<BusyInterval[]> {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayStart = wallToUtc(y, m, d, 0, 0, TIME_ZONE);
  const dayEnd = wallToUtc(y, m, d, 23, 59, TIME_ZONE);

  const res = await fetch(`${GATEWAY_URL}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keys.lovable}`,
      "X-Connection-Api-Key": keys.calendar,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      timeZone: TIME_ZONE,
      items: [{ id: "primary" }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`freeBusy failed [${res.status}]: ${t}`);
  }

  const data = (await res.json()) as {
    calendars?: { primary?: { busy?: { start: string; end: string }[] } };
  };
  const busy = data.calendars?.primary?.busy ?? [];
  return busy.map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
}

// Returns available start times ("HH:MM") for a given date + duration.
export function computeSlots(
  dateStr: string,
  durationMin: number,
  busy: BusyInterval[],
  now: Date,
): string[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const slots: string[] = [];
  const nowMs = now.getTime();

  for (let mins = OPEN_HOUR * 60; mins + durationMin <= CLOSE_HOUR * 60; mins += SLOT_STEP_MIN) {
    const h = Math.floor(mins / 60);
    const min = mins % 60;
    const startMs = wallToUtc(y, m, d, h, min, TIME_ZONE).getTime();
    const endMs = startMs + durationMin * 60 * 1000;

    if (startMs < nowMs + LEAD_TIME_MS) continue;
    const overlaps = busy.some((b) => startMs < b.end && endMs > b.start);
    if (overlaps) continue;

    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

// True if the specific start time is still free for the given duration.
export function isSlotFree(
  dateStr: string,
  time: string,
  durationMin: number,
  busy: BusyInterval[],
): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const startMs = wallToUtc(y, m, d, h, min, TIME_ZONE).getTime();
  const endMs = startMs + durationMin * 60 * 1000;
  return !busy.some((b) => startMs < b.end && endMs > b.start);
}

export function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
