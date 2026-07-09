import { useEffect, useState } from "react";
import { SERVICES } from "@/lib/services";
import { to12h } from "@/lib/booking-shared";

type Status = "idle" | "sending" | "success" | "error";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const [service, setService] = useState(SERVICES[0].name);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "loaded" | "error">("idle");

  const selectedService = SERVICES.find((s) => s.name === service);

  useEffect(() => {
    setTime("");
    if (!date) {
      setSlots([]);
      setSlotsState("idle");
      return;
    }
    let cancelled = false;
    setSlotsState("loading");
    fetch(`/api/public/availability?date=${date}&service=${encodeURIComponent(service)}`)
      .then((r) => r.json())
      .then((body: { slots?: string[]; error?: string }) => {
        if (cancelled) return;
        if (body.error) {
          setSlots([]);
          setSlotsState("error");
        } else {
          setSlots(body.slots ?? []);
          setSlotsState("loaded");
        }
      })
      .catch(() => {
        if (!cancelled) setSlotsState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [date, service]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!time) {
      setStatus("error");
      setMessage("Please pick an available time slot.");
      return;
    }
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = { ...data, service, date, time };
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "Something went wrong.");
      setStatus("success");
      form.reset();
      setDate("");
      setTime("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <h3 className="text-4xl text-primary">Request received</h3>
        <p className="mt-3 text-muted-foreground">
          Thanks — your booking request is in Bryan's calendar and a confirmation email is on its
          way. We'll be in touch to lock in the details.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary hover:underline"
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="Jane Doe" required />
        <Field label="Phone" name="phone" type="tel" placeholder="(516) 000-0000" required />
      </div>
      <Field label="Email" name="email" type="email" placeholder="you@email.com" required />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-semibold uppercase tracking-widest text-muted-foreground">
            Service
          </span>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
          >
            {SERVICES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.durationLabel})
              </option>
            ))}
          </select>
        </label>
        <Field label="Vehicle" name="vehicle" placeholder="Year, make & model" />
      </div>

      <Field
        label="Service address"
        name="address"
        placeholder="Where should we come to? (home, work, apartment...)"
        required
      />

      <label className="grid gap-2 text-sm">
        <span className="font-semibold uppercase tracking-widest text-muted-foreground">
          Preferred date
        </span>
        <input
          type="date"
          value={date}
          min={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          required
          className="rounded-md border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
        />
      </label>

      {date && (
        <div className="grid gap-2 text-sm">
          <span className="font-semibold uppercase tracking-widest text-muted-foreground">
            Available times{" "}
            {selectedService && (
              <span className="text-muted-foreground/70">· {selectedService.durationLabel}</span>
            )}
          </span>
          {slotsState === "loading" && (
            <p className="text-muted-foreground">Checking the calendar…</p>
          )}
          {slotsState === "error" && (
            <p className="text-primary">
              Couldn't load times. Please try again or call {" "}
              <a href="tel:+15162692984" className="underline">
                516-269-2984
              </a>
              .
            </p>
          )}
          {slotsState === "loaded" && slots.length === 0 && (
            <p className="text-muted-foreground">
              No open times that day. Try another date or give us a call.
            </p>
          )}
          {slotsState === "loaded" && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setTime(s)}
                  className={
                    "rounded-md border px-2 py-2 text-sm font-semibold transition-colors " +
                    (time === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary")
                  }
                >
                  {to12h(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <label className="grid gap-2 text-sm">
        <span className="font-semibold uppercase tracking-widest text-muted-foreground">
          Notes (optional)
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Anything we should know?"
          className="rounded-md border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
        />
      </label>

      {status === "error" && <p className="text-sm text-primary">{message}</p>}

      <button
        type="submit"
        disabled={status === "sending" || !time}
        className="mt-2 rounded-md bg-primary px-6 py-3.5 text-base font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Request booking"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Times shown are open on our calendar. We'll confirm your booking after you request it.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-md border border-input bg-background px-3 py-2.5 text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
      />
    </label>
  );
}
