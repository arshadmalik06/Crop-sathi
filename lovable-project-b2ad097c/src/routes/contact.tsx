import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/site/Section";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — AgriSense AI" },
      { name: "description", content: "Reach the AgriSense AI support team, read farmer FAQs, or find our field office in Nashik." },
      { property: "og:title", content: "Contact & Support — AgriSense AI" },
      { property: "og:description", content: "Support form, FAQs and helpline for AgriSense AI users." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Tell us a bit more").max(1000),
});

const faqs = [
  { q: "Is AgriSense AI free?", a: "Yes. The recommendation engine, weather and mandi prices are free for all farmers." },
  { q: "Do I need a soil test?", a: "It helps accuracy, but you can start with your soil type and we use district averages." },
  { q: "Which languages are supported?", a: "English, Hindi, Tamil, Telugu, Marathi, Kannada, Bengali, Gujarati, Punjabi and Odia." },
  { q: "Does it work offline?", a: "Your last recommendation, weather advisory and schemes stay available without a network." },
];

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    e.currentTarget.reset();
    toast.success("Message sent — our team replies within one working day.");
  };

  return (
    <div>
      <PageHeader title="Contact & support" subtitle="We answer in your language, seven days a week" />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Card className="rounded-3xl p-6 shadow-soft sm:p-8">
          <h2 className="text-xl font-semibold">Send a message</h2>
          <form className="mt-6 grid gap-4" onSubmit={submit} noValidate>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" maxLength={100} className="h-12 rounded-2xl" />
              {errors['name'] && <p className="text-sm text-destructive">{errors['name']}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" maxLength={255} className="h-12 rounded-2xl" />
              {errors['email'] && <p className="text-sm text-destructive">{errors['email']}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={5} maxLength={1000} className="rounded-2xl" />
              {errors['message'] && <p className="text-sm text-destructive">{errors['message']}</p>}
            </div>
            <Button type="submit" className="h-12 rounded-full">
              Send message
            </Button>
          </form>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-3xl p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-semibold">Reach us</h2>
            <ul className="mt-4 grid gap-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-primary" /> support@agrisense.ai
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-primary" /> 1800-180-1551
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-4 text-primary" /> Field office, Ozar, Nashik 422206
              </li>
            </ul>
            <div className="mt-5 overflow-hidden rounded-2xl border">
              <iframe
                title="AgriSense AI field office location"
                src="https://www.google.com/maps?q=Nashik,Maharashtra&output=embed"
                loading="lazy"
                className="h-56 w-full"
              />
            </div>
          </Card>

          <Card className="rounded-3xl p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <Accordion type="single" collapsible className="mt-2">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </div>
    </div>
  );
}
