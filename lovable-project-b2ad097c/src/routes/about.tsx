import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHeader, Section } from "@/components/site/Section";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AgriSense AI — Our Mission for Farmers" },
      { name: "description", content: "AgriSense AI combines soil science, weather data and machine learning to help Indian farmers choose the right crop each season." },
      { property: "og:title", content: "About AgriSense AI — Our Mission for Farmers" },
      { property: "og:description", content: "How our crop recommendation model works and who it is built for." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <PageHeader title="About AgriSense AI" subtitle="Agronomy, data science and farmer-first design" />

      <Section>
        <div className="mx-auto grid max-w-4xl gap-6">
          <Card className="rounded-3xl p-8 shadow-soft">
            <h2 className="text-2xl font-semibold">Our mission</h2>
            <p className="mt-3 text-muted-foreground">
              More than half of India's workforce depends on agriculture, yet crop choice is still often made on habit
              or hearsay. AgriSense AI turns soil test values, local weather and mandi trends into one clear,
              explainable recommendation — in the farmer's own language.
            </p>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="rounded-3xl p-8 shadow-soft">
              <h3 className="text-xl font-semibold">How the model works</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <li>Gradient-boosted classifier trained on district-level yield records</li>
                <li>Soil N-P-K, pH, moisture and organic carbon as primary features</li>
                <li>Seasonal rainfall, temperature and humidity from weather APIs</li>
                <li>Explainability layer surfaces the reasons behind every result</li>
              </ul>
            </Card>
            <Card className="rounded-3xl p-8 shadow-soft">
              <h3 className="text-xl font-semibold">Built for the field</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <li>Works on low-end phones and patchy networks</li>
                <li>Voice input and read-aloud recommendations</li>
                <li>Ten Indian languages at launch</li>
                <li>Offline-first design for remote villages</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
