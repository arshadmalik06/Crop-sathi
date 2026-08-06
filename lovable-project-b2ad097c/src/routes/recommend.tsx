import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Sparkles, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/site/Section";
import { crops, fertilizers } from "@/lib/mock";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "AI Crop Recommendation — AgriSense AI" },
      { name: "description", content: "Enter your farm, soil and weather details and get an AI-ranked crop plan with confidence scores and fertilizer advice." },
      { property: "og:title", content: "AI Crop Recommendation — AgriSense AI" },
      { property: "og:description", content: "Five quick steps to a confident, data-backed crop decision." },
    ],
  }),
  component: Recommend,
});

const stepTitles = ["Farmer details", "Farm details", "Soil details", "Weather", "Preference"];

const fields: Record<number, { name: string; label: string; placeholder?: string; type?: string }[]> = {
  0: [
    { name: "name", label: "Full name", placeholder: "Ramesh Kumar" },
    { name: "phone", label: "Phone number", placeholder: "98765 43210", type: "tel" },
    { name: "state", label: "State", placeholder: "Maharashtra" },
    { name: "district", label: "District", placeholder: "Nashik" },
    { name: "village", label: "Village", placeholder: "Ozar" },
  ],
  1: [
    { name: "size", label: "Farm size (acres)", placeholder: "3.2", type: "number" },
    { name: "season", label: "Season", placeholder: "Kharif" },
    { name: "previous", label: "Previous crop", placeholder: "Groundnut" },
    { name: "water", label: "Water source", placeholder: "Borewell" },
    { name: "irrigation", label: "Irrigation method", placeholder: "Drip" },
    { name: "organic", label: "Organic farming", placeholder: "Partial" },
  ],
  2: [
    { name: "soil", label: "Soil type", placeholder: "Clay loam" },
    { name: "ph", label: "pH value", placeholder: "6.4", type: "number" },
    { name: "n", label: "Nitrogen (kg/ha)", placeholder: "280", type: "number" },
    { name: "p", label: "Phosphorus (kg/ha)", placeholder: "42", type: "number" },
    { name: "k", label: "Potassium (kg/ha)", placeholder: "190", type: "number" },
    { name: "moisture", label: "Moisture (%)", placeholder: "24", type: "number" },
    { name: "carbon", label: "Organic carbon (%)", placeholder: "0.72", type: "number" },
    { name: "micro", label: "Micronutrients (optional)", placeholder: "Zn, Fe" },
  ],
  3: [
    { name: "temp", label: "Temperature (°C)", placeholder: "29", type: "number" },
    { name: "humidity", label: "Humidity (%)", placeholder: "68", type: "number" },
    { name: "rainfall", label: "Rainfall (mm)", placeholder: "180", type: "number" },
    { name: "wind", label: "Wind speed (km/h)", placeholder: "12", type: "number" },
    { name: "sun", label: "Sunlight hours", placeholder: "8.4", type: "number" },
  ],
};

const preferences = [
  "Maximum profit",
  "Low investment",
  "Short duration crop",
  "Organic farming",
  "High yield",
  "Cash crop",
  "Food crop",
  "Export crop",
];

function Recommend() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [prefs, setPrefs] = useState<string[]>(["Maximum profit"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const next = () => {
    if (step === 0 && !values['name']?.trim()) {
      toast.error("Please enter your name to continue.");
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const submit = () => {
    setLoading(true);
    setResult(false);
    setTimeout(() => {
      setLoading(false);
      setResult(true);
      toast.success("Recommendation ready — Rice (Paddy) at 94% confidence.");
    }, 1400);
  };

  const best = crops[0]!;
  const alternatives = crops.slice(1);

  return (
    <div>
      <PageHeader title="Crop recommendation" subtitle="Five short steps — takes about two minutes" />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {stepTitles.map((t, i) => (
              <Badge
                key={t}
                variant={i === step ? "default" : i < step ? "secondary" : "outline"}
                className="rounded-full px-3 py-1"
              >
                {i < step ? <Check className="mr-1 size-3" /> : null}
                {i + 1}. {t}
              </Badge>
            ))}
          </div>
          <Progress value={((step + 1) / 5) * 100} className="mt-4" />
        </div>

        <Card className="rounded-3xl p-6 shadow-soft sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-semibold">{stepTitles[step]}</h2>

              {step < 4 ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {fields[step]!.map((f) => (
                    <div key={f.name} className="grid gap-2">
                      <Label htmlFor={f.name}>{f.label}</Label>
                      <Input
                        id={f.name}
                        type={f.type ?? "text"}
                        placeholder={f.placeholder}
                        value={values[f.name] ?? ""}
                        onChange={(e) => set(f.name, e.target.value)}
                        className="h-12 rounded-2xl"
                      />
                    </div>
                  ))}
                  {step === 0 && (
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          set("state", "Maharashtra");
                          set("district", "Nashik");
                          set("village", "Ozar");
                          toast.success("Location detected: Ozar, Nashik");
                        }}
                      >
                        <MapPin className="mr-1 size-4" /> Use GPS location
                      </Button>
                    </div>
                  )}
                  {step === 3 && (
                    <p className="text-sm text-muted-foreground sm:col-span-2">
                      Values auto-fetched from the nearest weather station. You can edit them if the API is unavailable.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {preferences.map((p) => {
                    const active = prefs.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setPrefs((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]))
                        }
                        className={`rounded-2xl border p-4 text-left text-sm font-medium transition-colors ${
                          active ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="rounded-full"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ChevronLeft className="mr-1 size-4" /> Back
            </Button>
            {step < 4 ? (
              <Button className="h-12 rounded-full px-7" onClick={next}>
                Continue <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button className="h-12 rounded-full px-8" onClick={submit} disabled={loading}>
                <Sparkles className="mr-2 size-4" />
                {loading ? "Analysing…" : "Recommend Crop"}
              </Button>
            )}
          </div>
        </Card>

        {loading && (
          <div className="mt-8 grid gap-4">
            <Skeleton className="h-48 rounded-3xl" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-40 rounded-3xl" />
              <Skeleton className="h-40 rounded-3xl" />
              <Skeleton className="h-40 rounded-3xl" />
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 grid gap-6">
            <Card className="gradient-hero overflow-hidden rounded-3xl p-8 text-primary-foreground shadow-lift">
              <div className="flex flex-wrap items-center gap-6">
                <span className="grid size-24 shrink-0 place-items-center rounded-3xl bg-white/10 text-6xl">
                  {best.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm opacity-80">Recommended crop</p>
                  <h2 className="text-3xl font-semibold">{best.name}</h2>
                  <p className="text-sm italic opacity-75">{best.scientific}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="glass-dark rounded-full px-3 py-1 text-xs">
                      Confidence {best.confidence}%
                    </span>
                    <span className="glass-dark rounded-full px-3 py-1 text-xs">
                      Suitability {best.suitability}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold">Why this crop?</h3>
                  <ul className="mt-3 grid gap-2 text-sm opacity-90">
                    {best.reasons.map((r) => (
                      <li key={r} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Duration", best.duration],
                    ["Expected yield", best.yield],
                    ["Water need", best.water],
                    ["Profit", best.profit],
                    ["Investment", best.investment],
                    ["Difficulty", best.difficulty],
                    ["Best sowing", best.sowing],
                    ["Harvest", best.harvest],
                  ].map(([k, v]) => (
                    <div key={k} className="glass-dark rounded-2xl p-3">
                      <dt className="text-xs opacity-70">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>

            <div>
              <h3 className="text-xl font-semibold">Alternative recommendations</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {alternatives.map((c) => (
                  <Card key={c.id} className="card-lift rounded-3xl p-6 shadow-soft">
                    <span className="text-4xl">{c.emoji}</span>
                    <h4 className="mt-3 font-semibold">{c.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.confidence}% confidence · {c.suitability}% suitable
                    </p>
                    <dl className="mt-3 grid gap-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <dt>Profit</dt>
                        <dd className="font-medium text-foreground">{c.profit}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Duration</dt>
                        <dd className="font-medium text-foreground">{c.duration}</dd>
                      </div>
                    </dl>
                    <Button
                      variant="outline"
                      className="mt-4 w-full rounded-full"
                      onClick={() => toast(`${c.name} added to comparison`)}
                    >
                      Compare
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="rounded-3xl p-6 shadow-soft">
              <h3 className="text-xl font-semibold">Fertilizer recommendation</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 font-medium">Input</th>
                      <th className="py-2 font-medium">Type</th>
                      <th className="py-2 font-medium">Quantity</th>
                      <th className="py-2 font-medium">Application</th>
                      <th className="py-2 font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fertilizers.map((f) => (
                      <tr key={f.name} className="border-t">
                        <td className="py-3 font-medium">{f.name}</td>
                        <td className="py-3">{f.type}</td>
                        <td className="py-3">{f.qty}</td>
                        <td className="py-3">{f.when}</td>
                        <td className="py-3">{f.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button className="mt-6 rounded-full" onClick={() => toast.success("PDF export queued")}>
                Download as PDF
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
