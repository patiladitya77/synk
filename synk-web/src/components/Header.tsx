"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">W</span>
          </div>
          <span className="font-bold text-xl text-foreground">Whiteboard</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Features
          </a>
          <a
            href="#benefits"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Benefits
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
              Get started free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
export default Header;
