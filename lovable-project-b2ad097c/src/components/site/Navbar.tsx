import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, Menu, Moon, Sun, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/recommend", label: "Crop Recommendation" },
  { to: "/weather", label: "Weather" },
  { to: "/market", label: "Market" },
  { to: "/schemes", label: "Schemes" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const languages = ["English", "हिन्दी", "தமிழ்", "తెలుగు", "मराठी"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("English");

  useEffect(() => {
    const stored = localStorage.getItem("agrisense-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("agrisense-theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">AgriSense AI</span>
        </Link>

        <div className="mx-auto hidden items-center gap-1 xl:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-muted text-foreground" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Select language" className="min-h-11 min-w-11">
                <Globe className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((l) => (
                <DropdownMenuItem key={l} onClick={() => setLang(l)}>
                  {l} {lang === l ? "✓" : ""}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            className="min-h-11 min-w-11"
            onClick={toggleTheme}
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          <Link to="/login" aria-label="Farmer profile">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-sage text-sage-foreground text-xs">RK</AvatarFallback>
            </Avatar>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            className="min-h-11 min-w-11 xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="border-t px-4 pb-4 xl:hidden">
          <div className="grid gap-1 pt-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-muted text-foreground" }}
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
