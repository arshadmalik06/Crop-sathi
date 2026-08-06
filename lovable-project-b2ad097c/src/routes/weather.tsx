import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Droplets, Sun, Wind, Thermometer, CloudSun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/site/Section";
import { forecast } from "@/lib/mock";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Farm Weather & Advisories — AgriSense AI" },
      { name: "description", content: "Current conditions, 7-day forecast, rain prediction and farming advice for your village." },
      { property: "og:title", content: "Farm Weather & Advisories — AgriSense AI" },
      { property: "og:description", content: "Hyper-local weather with irrigation and sowing advice for farmers." },
    ],
  }),
  component: Weather,
});

const now = [
  { icon: Thermometer, label: "Temperature", value: "29°C" },
  { icon: Droplets, label: "Humidity", value: "68%" },
  { icon: Wind, label: "Wind", value: "12 km/h" },
  { icon: CloudRain, label: "Rain chance", value: "35%" },
  { icon: Sun, label: "UV index", value: "7 (High)" },
  { icon: CloudSun, label: "Sunlight", value: "8.4 hrs" },
];

function Weather() {
  return (
    <div>
      <PageHeader title="Weather" subtitle="Nashik, Maharashtra · updated 10 minutes ago" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {now.map((n) => (
            <Card key={n.label} className="card-lift rounded-3xl p-6 shadow-soft">
              <n.icon className="size-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{n.label}</p>
              <p className="text-2xl font-semibold">{n.value}</p>
            </Card>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-semibold">7 day forecast</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {forecast.map((d) => (
            <Card key={d.day} className="card-lift rounded-3xl p-5 text-center shadow-soft">
              <p className="text-sm font-medium text-muted-foreground">{d.day}</p>
              <p className="mt-2 text-3xl">{d.icon === "rain" ? "🌧️" : d.icon === "cloud" ? "⛅" : "☀️"}</p>
              <p className="mt-2 font-semibold">{d.temp}°</p>
              <p className="text-xs text-muted-foreground">{d.min}° · {d.rain}% rain</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 rounded-3xl bg-accent/60 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-accent-foreground">Farming advice</h2>
          <ul className="mt-3 grid gap-2 text-sm text-accent-foreground">
            <li>Heavy rain expected Wednesday (80 mm) — skip irrigation today and tomorrow.</li>
            <li>Delay urea top-dressing until after the rain to avoid nutrient runoff.</li>
            <li>Check field drainage channels before Tuesday evening.</li>
            <li>Good spraying window: Friday morning, low wind and no rain.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
