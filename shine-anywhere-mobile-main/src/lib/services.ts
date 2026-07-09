export interface Service {
  name: string;
  desc: string;
  durationMin: number;
  durationLabel: string;
}

export const SERVICES: Service[] = [
  {
    name: "Complete Detail",
    desc: "A thorough inside and out — wash, vacuum, and full wipe down. The everyday reset your car deserves.",
    durationMin: 120,
    durationLabel: "~2 hrs",
  },
  {
    name: "Premium Detail",
    desc: "The full treatment. Every surface addressed until the car is absolutely pristine, inside and out.",
    durationMin: 240,
    durationLabel: "~4 hrs",
  },
  {
    name: "Interior Detail",
    desc: "Deep clean of every interior surface — seats, carpets, trim, glass and vents left spotless.",
    durationMin: 120,
    durationLabel: "~2 hrs",
  },
  {
    name: "Exterior Detail",
    desc: "A meticulous exterior process that restores depth, gloss and a clean, protected finish.",
    durationMin: 90,
    durationLabel: "~1.5 hrs",
  },
  {
    name: "Ceramic Coating",
    desc: "Long-lasting protection with serious shine and hydrophobic beading that keeps your paint cleaner, longer.",
    durationMin: 300,
    durationLabel: "~5 hrs",
  },
];

export function getService(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name);
}
