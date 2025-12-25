"use client";

import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-secondary rounded-full border border-border">
          <p className="text-sm text-foreground">
            ✨ Collaborate in real-time with your entire team
          </p>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
          Your team&apos;s infinite canvas
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Break free from rigid tools. Create, sketch, brainstorm, and design
          together on an infinite canvas built for modern teams.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base">
            Start creating now
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 text-base border-border hover:bg-secondary/20 bg-transparent"
          >
            Watch demo
          </Button>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="aspect-video bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="w-full h-full bg-linear-to-br from-secondary/30 via-background to-accent/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">✏️</div>
                <p className="text-muted-foreground">
                  Interactive whiteboard preview
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-2xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/15 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
