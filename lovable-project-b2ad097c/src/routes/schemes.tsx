import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/Section";
import { schemes } from "@/lib/mock";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes for Farmers — AgriSense AI" },
      { name: "description", content: "PM-KISAN, crop insurance, soil health card, seed subsidy and credit schemes with eligibility and apply links." },
      { property: "og:title", content: "Government Schemes for Farmers — AgriSense AI" },
      { property: "og:description", content: "Find schemes you qualify for and apply directly on official portals." },
    ],
  }),
  component: Schemes,
});

function Schemes() {
  return (
    <div>
      <PageHeader title="Government schemes" subtitle="Central and state support you may be eligible for" />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-2">
        {schemes.map((s) => (
          <Card key={s.name} className="card-lift rounded-3xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold">{s.name}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Benefits: </span>
              {s.benefit}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Eligibility: </span>
              {s.eligibility}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <a href={s.link} target="_blank" rel="noreferrer noopener">
                  Apply now
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <a href={s.link} target="_blank" rel="noreferrer noopener">
                  Official link <ExternalLink className="ml-1 size-3.5" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
