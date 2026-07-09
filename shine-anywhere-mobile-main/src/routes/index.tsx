import { createFileRoute } from "@tanstack/react-router";
import { BookingForm } from "@/components/BookingForm";
import { SERVICES } from "@/lib/services";
import logoAsset from "@/assets/logo.png.asset.json";
import setupAsset from "@/assets/setup-real.jpg.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

const PHONE = "516-269-2984";
const PHONE_HREF = "tel:+15162692984";
const EMAIL = "tauber33@aol.com";

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Services />
      <Setup />
      <ServiceArea />
      <Booking />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center">
          <img src={logoAsset.url} alt="Focus Detailing LLC logo" className="h-11 w-auto" />
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground md:flex">
          <a href="#services" className="hover:text-foreground">Services</a>
          <a href="#setup" className="hover:text-foreground">The Setup</a>
          <a href="#area" className="hover:text-foreground">Coverage</a>
        </nav>
        <a
          href="#book"
          className="rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
        >
          Book now
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_60%)]" />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Mobile Detailing · Long Island, NY
          </p>
          <h1 className="mt-4 text-6xl sm:text-7xl lg:text-8xl">
            We bring the <span className="text-primary">detail shop</span> to your driveway.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Focus Detailing LLC is a fully self-sufficient mobile detailing service. Our own water
            and power means we can make your car pristine anywhere on Long Island — home, work, or
            your apartment lot.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#book"
              className="rounded-md bg-primary px-7 py-3.5 text-base font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              Book your detail
            </a>
            <a
              href="#services"
              className="rounded-md border border-border px-7 py-3.5 text-base font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-secondary"
            >
              View services
            </a>
          </div>
        </div>
        <img
          src={logoAsset.url}
          alt="Focus Detailing LLC — Beyond Clean, Long Island NY"
          className="mx-auto w-full max-w-md drop-shadow-2xl lg:max-w-lg"
        />
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="border-t border-border py-24">
      <div className="container-x">
        <SectionHead kicker="What we do" title="Services" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <div key={s.name} className="bg-card p-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">0{i + 1}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.durationLabel}
                </span>
              </div>
              <h3 className="mt-3 text-3xl">{s.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center bg-primary p-8">
            <h3 className="text-3xl text-primary-foreground">Not sure what you need?</h3>
            <p className="mt-3 text-sm text-primary-foreground/90">
              Tell us about your vehicle and we'll recommend the right service.
            </p>
            <a
              href={PHONE_HREF}
              className="mt-5 text-lg font-bold text-primary-foreground underline underline-offset-4"
            >
              {PHONE}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Setup() {
  return (
    <section id="setup" className="border-t border-border py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHead kicker="Fully self-sufficient" title="Our own water & power" />
          <p className="mt-6 text-lg text-muted-foreground">
            Everything we need travels with us. Our truck runs its own generator and carries its
            own water tank, so we never rely on your hose or your electricity.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "No need for your water or power — ever",
              "Detail at home, at work, or at your apartment complex",
              "Clean, professional setup that leaves no mess behind",
              "The same shop-quality results, wherever you are",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-foreground">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <img
          src={setupAsset.url}
          alt="Focus Detailing truck with onboard generator and water tank set up in a Long Island driveway"
          loading="lazy"
          className="rounded-lg border border-border object-cover"
        />
      </div>
    </section>
  );
}

function ServiceArea() {
  return (
    <section id="area" className="border-t border-border bg-card py-24">
      <div className="container-x text-center">
        <SectionHead kicker="Where we go" title="All of Long Island" center />
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Based on Long Island and covering it end to end — Nassau and Suffolk. Because we're
          fully mobile and self-contained, we come to you wherever your car is parked.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["Nassau County", "Suffolk County", "Homes", "Workplaces", "Apartment Complexes"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section id="book" className="border-t border-border py-24">
      <div className="container-x grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHead kicker="Book online" title="Reserve your spot" />
          <p className="mt-6 text-lg text-muted-foreground">
            Pick a service and a time that works for you. Your request drops straight into our
            calendar and we'll confirm the details with you directly.
          </p>
          <div className="mt-8 space-y-4">
            <ContactRow label="Call or text" value={PHONE} href={PHONE_HREF} />
            <ContactRow label="Email" value={EMAIL} href={`mailto:${EMAIL}`} />
            <ContactRow label="Owner" value="Bryan Tauber" />
          </div>
        </div>
        <BookingForm />
      </div>
    </section>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {href ? (
        <a href={href} className="text-lg font-semibold text-foreground hover:text-primary">
          {value}
        </a>
      ) : (
        <span className="text-lg font-semibold text-foreground">{value}</span>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container-x flex flex-col items-center justify-between gap-4 sm:flex-row">
        <img src={logoAsset.url} alt="Focus Detailing LLC logo" className="h-14 w-auto" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Focus Detailing LLC · Long Island, NY
        </p>
        <a href={PHONE_HREF} className="text-sm font-semibold text-foreground hover:text-primary">
          {PHONE}
        </a>
      </div>
    </footer>
  );
}

function SectionHead({
  kicker,
  title,
  center,
}: {
  kicker: string;
  title: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{kicker}</p>
      <h2 className="mt-3 text-5xl sm:text-6xl">{title}</h2>
    </div>
  );
}
