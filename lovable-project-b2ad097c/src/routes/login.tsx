import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/site/Section";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Farmer Login — AgriSense AI" },
      { name: "description", content: "Sign in or register with your phone number to access your farm dashboard and saved recommendations." },
      { property: "og:title", content: "Farmer Login — AgriSense AI" },
      { property: "og:description", content: "Login, register or use OTP to access your AgriSense farm dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const [phone, setPhone] = useState("");

  return (
    <div>
      <PageHeader title="Farmer login" subtitle="Access your dashboard, saved farms and recommendation history" />

      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card className="rounded-3xl p-6 shadow-soft sm:p-8">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login-phone">Phone number</Label>
                <Input id="login-phone" type="tel" placeholder="98765 43210" className="h-12 rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-pass">Password</Label>
                <Input id="login-pass" type="password" placeholder="••••••••" className="h-12 rounded-2xl" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <Checkbox id="remember" /> <span>Remember me</span>
                </label>
                <button type="button" className="text-primary hover:underline" onClick={() => toast("Reset link sent")}>
                  Forgot password?
                </button>
              </div>
              <Button className="h-12 rounded-full" onClick={() => toast.success("Signed in (demo)")}>
                Login
              </Button>
            </TabsContent>

            <TabsContent value="register" className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reg-name">Full name</Label>
                <Input id="reg-name" placeholder="Ramesh Kumar" className="h-12 rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-phone">Phone number</Label>
                <Input id="reg-phone" type="tel" placeholder="98765 43210" className="h-12 rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-village">Village</Label>
                <Input id="reg-village" placeholder="Ozar, Nashik" className="h-12 rounded-2xl" />
              </div>
              <Button className="h-12 rounded-full" onClick={() => toast.success("Account created (demo)")}>
                Create account
              </Button>
            </TabsContent>

            <TabsContent value="otp" className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp-phone">Phone number</Label>
                <Input
                  id="otp-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="h-12 rounded-2xl"
                />
              </div>
              <Button
                className="h-12 rounded-full"
                onClick={() =>
                  phone.trim().length >= 10 ? toast.success("OTP sent to " + phone) : toast.error("Enter a valid number")
                }
              >
                Send OTP
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
