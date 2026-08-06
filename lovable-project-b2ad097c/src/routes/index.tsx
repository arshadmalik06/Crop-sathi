import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sprout,
  FlaskConical,
  CloudSun,
  Leaf,
  Activity,
  IndianRupee,
  Landmark,
  BarChart3,
  Languages,
  Mic,
  ArrowRight,
} from "lucide-react";
import hero from "@/assets/hero-farming.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriSense AI — AI Crop Recommendation for Farmers" },
      {
        name: "description",
        content:
          "AgriSense AI recommends the best crop for your farm using soil, weather and market data — with live forecasts, mandi prices and government schemes.",
      },
      { property: "og:title", content: "AgriSense AI — AI Crop Recommendation for Farmers" },
      {
        property: "og:description",
        content: "Smarter farming decisions powered by AI: soil analysis, weather, mandi prices and crop advice.",
      },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Sprout, title: "AI Crop Recommendation", body: "Best-fit crops ranked by confidence for your exact plot." },
  { icon: FlaskConical, title: "Soil Analysis", body: "N-P-K, pH, moisture and organic carbon interpreted for you." },
  { icon: CloudSun, title: "Live Weather", body: "Hyper-local forecast with sowing and irrigation advisories." },
  { icon: Leaf, title: "Fertilizer Suggestion", body: "Organic and chemical doses with a schedule and cost." },
  { icon: Activity, title: "Crop Health Monitoring", body: "Track growth stages and catch pest risk early." },
  { icon: IndianRupee, title: "Market Prices", body: "Nearby mandi rates with weekly and monthly trends." },
  { icon: Landmark, title: "Government Schemes", body: "Eligibility, benefits and direct application links." },
  { icon: BarChart3, title: "Farm Analytics", body: "Yield history, profit tracking and season comparisons." },
  { icon: Languages, title: "Multilingual", body: "English, Hindi, Tamil, Telugu, Marathi and more." },
  { icon: Mic, title: "Voice Assistance", body: "Speak your farm details, hear the recommendation back." },
];

const steps = [
  { title: "Enter farm details", body: "Location, farm size, season and soil values — or scan a soil card." },
  { title: "AI analyses soil + weather", body: "The model weighs 20+ agronomic signals for your district." },
  { title: "Best crops recommended", body: "Ranked crops with confidence, profit and water needs." },
  { title: "Farmer starts cultivation", body: "Follow the fertilizer schedule and weather advisories." },
];

function Home() {
  return (
    <div>
      <section className="gradient-hero relative overflow-hidden text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="glass-dark inline-flex rounded-full px-3 py-1 text-xs font-medium">
              Smart India Hackathon · Agriculture
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-semibold sm:text-6xl">
              AI Powered Crop Recommendation System
            </h1>
            <p className="mt-5 max-w-xl text-base opacity-85 sm:text-lg">
              Helping farmers make smarter farming decisions using artificial intelligence — soil, weather, and market
              signals combined into one clear answer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/recommend">
                <Button size="lg" className="h-12 rounded-full bg-accent px-7 text-accent-foreground hover:bg-accent/90">
                  Get Recommendation <ArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
              <a href="#how">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/30 bg-transparent px-7 text-primary-foreground hover:bg-white/10"
                >
                  Learn More
                </Button>
              </a>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4">
              {[
                ["22+", "Crops modelled"],
                ["94%", "Model accuracy"],
                ["10", "Languages"],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="text-2xl font-semibold">{k}</dt>
                  <dd className="text-xs opacity-75">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-dark overflow-hidden rounded-3xl p-2"
          >
            <img
              src={hero}
              width={1536}
              height={1024}
              alt="Farmer using an AI dashboard beside terraced crop fields with drone and satellite scanning"
              className="w-full rounded-2xl object-cover"
            />
          </motion.div>
        </div>
      </section>

      <Section
        eyebrow="Features"
        title="Everything a farm needs, in one app"
        subtitle="Built for low-bandwidth phones and first-time smartphone users."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
            >
              <Card className="card-lift h-full rounded-3xl border-border/70 p-6 shadow-soft">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <div className="bg-muted/40">
        <Section id="how" eyebrow="How it works" title="From farm details to a confident decision">
          <ol className="mx-auto grid max-w-4xl gap-4">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex gap-5 rounded-3xl bg-card p-6 shadow-soft"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </Section>
      </div>

      <Section>
        <div className="gradient-hero rounded-[2rem] px-6 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready to plan this season?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-85">
            Answer five short steps and get a ranked crop plan with fertilizer schedule and expected profit.
          </p>
          <Link to="/recommend">
            <Button size="lg" className="mt-8 h-12 rounded-full bg-accent px-8 text-accent-foreground hover:bg-accent/90">
              Get Recommendation
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
