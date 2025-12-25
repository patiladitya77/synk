"use client";

import { Button } from "@/components/ui/button";

const Cta = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
          Ready to collaborate?
        </h2>
        <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
          Join thousands of teams creating together. Start free, no credit card
          required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 px-8 text-base">
            Start free trial
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          >
            Schedule demo
          </Button>
        </div>
      </div>
    </section>
  );
};
export default Cta;
