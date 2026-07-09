import { createFileRoute } from "@tanstack/react-router";
import { fetchBusy, computeSlots } from "@/lib/booking-shared";
import { getService } from "@/lib/services";

export const Route = createFileRoute("/api/public/availability")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") ?? "";
        const serviceName = url.searchParams.get("service") ?? "";

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return Response.json({ error: "Invalid date." }, { status: 400 });
        }
        const service = getService(serviceName);
        if (!service) {
          return Response.json({ error: "Invalid service." }, { status: 400 });
        }

        const lovable = process.env.LOVABLE_API_KEY;
        const calendar = process.env.GOOGLE_CALENDAR_API_KEY;
        if (!lovable || !calendar) {
          return Response.json(
            { slots: [], error: "Availability is temporarily unavailable." },
            { status: 503 },
          );
        }

        try {
          const busy = await fetchBusy(date, { lovable, calendar });
          const slots = computeSlots(date, service.durationMin, busy, new Date());
          return Response.json({ slots });
        } catch (e) {
          console.error(e);
          return Response.json(
            { slots: [], error: "Could not load availability." },
            { status: 502 },
          );
        }
      },
    },
  },
});
