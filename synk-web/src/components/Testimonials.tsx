"use client";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "Whiteboard transformed how our team collaborates. It's the tool we didn't know we needed.",
      author: "Sarah Chen",
      role: "Design Lead at TechCorp",
      avatar: "👩‍💼",
    },
    {
      quote:
        "The real-time collaboration is seamless. We ditched our old tools immediately.",
      author: "Marcus Johnson",
      role: "CEO at Creative Studio",
      avatar: "👨‍💼",
    },
    {
      quote:
        "Finally, a whiteboard app that actually works. Fast, intuitive, and reliable.",
      author: "Emma Rodriguez",
      role: "Product Manager",
      avatar: "👩‍💻",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Loved by creative teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="p-8 rounded-lg border border-border bg-card"
            >
              <p className="text-foreground mb-6 leading-relaxed italic">
                `{testimonial.quote}`
              </p>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Testimonials;
