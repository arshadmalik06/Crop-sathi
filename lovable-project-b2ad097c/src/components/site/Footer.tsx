import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">AgriSense AI</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            AI powered crop recommendation for Indian farmers — soil, weather and market intelligence in one place.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Quick links</h3>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/recommend" className="hover:text-foreground">
                Crop recommendation
              </Link>
            </li>
            <li>
              <Link to="/weather" className="hover:text-foreground">
                Weather
              </Link>
            </li>
            <li>
              <Link to="/market" className="hover:text-foreground">
                Market prices
              </Link>
            </li>
            <li>
              <Link to="/schemes" className="hover:text-foreground">
                Government schemes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Legal</h3>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <li>Privacy policy</li>
            <li>Terms of use</li>
            <li>Data protection</li>
            <li>Accessibility</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Connect</h3>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <li>support@agrisense.ai</li>
            <li>1800-180-1551 (Kisan Call Centre)</li>
            <li>Twitter · YouTube · WhatsApp</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AgriSense AI · Built for Smart India Hackathon
      </div>
    </footer>
  );
}
