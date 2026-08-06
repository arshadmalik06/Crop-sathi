import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudSun, Sprout, IndianRupee, FlaskConical, History, User, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/site/Section";
import { notifications, history } from "@/lib/mock";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Farmer Dashboard — AgriSense AI" },
      { name: "description", content: "Your farm at a glance: weather, latest AI crop recommendation, alerts and quick actions." },
      { property: "og:title", content: "Farmer Dashboard — AgriSense AI" },
      { property: "og:description", content: "Weather, recommendations, farm summary and alerts in one dashboard." },
    ],
  }),
  component: Dashboard,
});

const actions = [
  { to: "/recommend", icon: Sprout, label: "Recommend crop" },
  { to: "/weather", icon: CloudSun, label: "Weather" },
  { to: "/market", icon: IndianRupee, label: "Market prices" },
  { to: "/recommend", icon: FlaskConical, label: "Soil health" },
  { to: "/dashboard", icon: History, label: "History" },
  { to: "/login", icon: User, label: "Profile" },
] as const;

function Dashboard() {
  return (
    <div>
      <PageHeader title="Namaste, Ramesh 👋" subtitle="Kharif season · Nashik, Maharashtra · 3.2 acres" />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <Card className="rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Today's weather</h2>
            <CloudSun className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-4xl font-semibold">29°C</p>
          <p className="text-sm text-muted-foreground">Partly cloudy · Humidity 68% · Wind 12 km/h</p>
          <p className="mt-4 rounded-2xl bg-accent/60 p-3 text-sm text-accent-foreground">
            Rain expected tomorrow — avoid irrigation today.
          </p>
        </Card>

        <Card className="rounded-3xl p-6 shadow-soft">
          <h2 className="font-semibold">Latest recommendation</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl">🌾</span>
            <div>
              <p className="text-lg font-semibold">Rice (Paddy)</p>
              <p className="text-sm text-muted-foreground">12 Jul 2026</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Confidence</p>
          <Progress value={94} className="mt-2" />
          <p className="mt-2 text-sm font-medium">94% match</p>
        </Card>

        <Card className="rounded-3xl p-6 shadow-soft">
          <h2 className="font-semibold">Farm summary</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            {[
              ["Farm size", "3.2 acres"],
              ["Soil type", "Clay loam"],
              ["Irrigation", "Drip"],
              ["Previous crop", "Groundnut"],
              ["Organic", "Partial"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="rounded-3xl p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center gap-2">
            <Bell className="size-4" />
            <h2 className="font-semibold">Notifications & government updates</h2>
          </div>
          <ul className="mt-4 grid gap-3">
            {notifications.map((n) => (
              <li key={n.title} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  <Badge variant={n.tone === "warn" ? "destructive" : "secondary"}>
                    {n.tone === "warn" ? "Alert" : "Update"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-3xl p-6 shadow-soft">
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {actions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="card-lift grid gap-2 rounded-2xl border p-4 text-sm font-medium hover:border-primary/40"
              >
                <a.icon className="size-5 text-primary" />
                {a.label}
              </Link>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl p-6 shadow-soft lg:col-span-3">
          <h2 className="font-semibold">Previous recommendations</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Crop</th>
                  <th className="py-2 font-medium">Confidence</th>
                  <th className="py-2 font-medium">Weather</th>
                  <th className="py-2 font-medium">Yield</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.date} className="border-t">
                    <td className="py-3">{h.date}</td>
                    <td className="py-3 font-medium">{h.crop}</td>
                    <td className="py-3">{h.confidence}%</td>
                    <td className="py-3">{h.weather}</td>
                    <td className="py-3">{h.yield}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
