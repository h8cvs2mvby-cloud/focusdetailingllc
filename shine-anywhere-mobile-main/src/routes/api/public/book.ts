import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fetchBusy, isSlotFree, wallToUtc, TIME_ZONE } from "@/lib/booking-shared";
import { getService } from "@/lib/services";

const bookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(160),
  service: z.string().trim().min(1).max(80),
  vehicle: z.string().trim().max(160).optional().default(""),
  address: z.string().trim().min(1).max(240),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().trim().max(1000).optional().default(""),
});

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

function isoWithOffset(dateStr: string, time: string): string {
  // Google accepts an offset-aware dateTime plus timeZone; we build the local
  // wall time and let the timeZone field disambiguate.
  return `${dateStr}T${time}:00`;
}

export const Route = createFileRoute("/api/public/book")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = bookingSchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            { error: "Please check the form fields and try again." },
            { status: 400 },
          );
        }
        const b = parsed.data;

        const service = getService(b.service);
        if (!service) {
          return Response.json({ error: "Unknown service selected." }, { status: 400 });
        }

        const lovableKey = process.env.LOVABLE_API_KEY;
        const calendarKey = process.env.GOOGLE_CALENDAR_API_KEY;
        if (!lovableKey || !calendarKey) {
          return Response.json(
            { error: "Booking is temporarily unavailable. Please call or text us." },
            { status: 503 },
          );
        }

        const keys = { lovable: lovableKey, calendar: calendarKey };

        // Re-check the slot is still free to guard against double-booking.
        try {
          const busy = await fetchBusy(b.date, keys);
          if (!isSlotFree(b.date, b.time, service.durationMin, busy)) {
            return Response.json(
              { error: "That time was just taken. Please pick another slot." },
              { status: 409 },
            );
          }
        } catch (e) {
          console.error("availability recheck failed", e);
          return Response.json(
            { error: "We couldn't verify availability. Please try again." },
            { status: 502 },
          );
        }

        // Compute end time from the service duration.
        const [y, m, d] = b.date.split("-").map(Number);
        const [hh, mm] = b.time.split(":").map(Number);
        const startUtc = wallToUtc(y, m, d, hh, mm, TIME_ZONE);
        const endUtc = new Date(startUtc.getTime() + service.durationMin * 60 * 1000);
        const endLocal = new Intl.DateTimeFormat("en-CA", {
          timeZone: TIME_ZONE,
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).formatToParts(endUtc);
        const emap: Record<string, string> = {};
        for (const p of endLocal) emap[p.type] = p.value;
        const endHour = emap.hour === "24" ? "00" : emap.hour;
        const endDateTime = `${emap.year}-${emap.month}-${emap.day}T${endHour}:${emap.minute}:00`;

        const event = {
          summary: `Booking: ${service.name} — ${b.name}`,
          location: b.address,
          description: [
            `Service: ${service.name} (${service.durationLabel})`,
            `Name: ${b.name}`,
            `Phone: ${b.phone}`,
            `Email: ${b.email}`,
            b.vehicle ? `Vehicle: ${b.vehicle}` : null,
            `Address: ${b.address}`,
            b.notes ? `Notes: ${b.notes}` : null,
            "",
            "Requested via the Focus Detailing booking form.",
          ]
            .filter(Boolean)
            .join("\n"),
          start: { dateTime: isoWithOffset(b.date, b.time), timeZone: TIME_ZONE },
          end: { dateTime: endDateTime, timeZone: TIME_ZONE },
        };

        const res = await fetch(`${GATEWAY_URL}/calendars/primary/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": calendarKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Calendar booking failed [${res.status}]: ${errorBody}`);
          return Response.json(
            { error: "We couldn't complete your booking. Please call or text us." },
            { status: 502 },
          );
        }

        // Confirmation email is sent here once the email domain is configured.



        return Response.json({ ok: true });
      },
    },
  },
});
