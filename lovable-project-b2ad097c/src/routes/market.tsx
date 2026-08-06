import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/site/Section";
import { marketPrices, priceTrend } from "@/lib/mock";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Mandi Market Prices & Trends — AgriSense AI" },
      { name: "description", content: "Search live mandi prices for crops near you with weekly trends and the best selling market." },
      { property: "og:title", content: "Mandi Market Prices & Trends — AgriSense AI" },
      { property: "og:description", content: "Compare nearby mandi rates and price trends before you sell." },
    ],
  }),
  component: Market,
});

function Market() {
  const [q, setQ] = useState("");
  const rows = marketPrices.filter(
    (r) => r.crop.toLowerCase().includes(q.toLowerCase()) || r.market.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Market prices" subtitle="Live mandi rates from nearby markets, updated daily" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search crop or mandi"
            aria-label="Search crop or mandi"
            className="h-12 rounded-2xl pl-10"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const up = r.price >= r.prev;
            const delta = Math.abs(r.price - r.prev);
            return (
              <Card key={r.crop} className="card-lift rounded-3xl p-6 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{r.crop}</h3>
                    <p className="text-sm text-muted-foreground">{r.market}</p>
                  </div>
                  <Badge variant={up ? "secondary" : "destructive"} className="shrink-0">
                    {up ? <TrendingUp className="mr-1 size-3" /> : <TrendingDown className="mr-1 size-3" />}₹{delta}
                  </Badge>
                </div>
                <p className="mt-4 text-3xl font-semibold">₹{r.price.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">{r.unit} · yesterday ₹{r.prev.toLocaleString("en-IN")}</p>
              </Card>
            );
          })}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No markets matched your search.</p>}
        </div>

        <Card className="mt-10 rounded-3xl p-6 shadow-soft">
          <h2 className="text-lg font-semibold">5 week price trend</h2>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Line type="monotone" dataKey="rice" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="maize" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="cotton" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Best selling market this week: <span className="font-medium text-foreground">Rajkot Mandi</span> for
            groundnut at ₹6,420/quintal.
          </p>
        </Card>
      </div>
    </div>
  );
}
