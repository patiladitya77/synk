"use client";

const Features = () => {
  const features = [
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "Real-time collaboration with zero latency. See changes instantly as your team works.",
    },
    {
      icon: "🔒",
      title: "Secure by Default",
      description:
        "Enterprise-grade encryption ensures your ideas stay private and protected.",
    },
    {
      icon: "📱",
      title: "Works Everywhere",
      description:
        "Desktop, tablet, or mobile. Seamless experience across all your devices.",
    },
    {
      icon: "🎨",
      title: "Infinite Canvas",
      description:
        "Create without boundaries. Pan, zoom, and explore your ideas freely.",
    },
    {
      icon: "👥",
      title: "Team Friendly",
      description:
        "Invite unlimited collaborators. Perfect for teams of any size.",
    },
    {
      icon: "💾",
      title: "Auto Save",
      description:
        "Never lose your work. Everything is automatically saved in the cloud.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Everything you need to collaborate
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make teamwork faster and more
            creative.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/20 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;
