"use client";

const Benefits = () => {
  const benefits = [
    {
      stat: "85% faster",
      label: "design iterations",
    },
    {
      stat: "100+ companies",
      label: "trust Whiteboard",
    },
    {
      stat: "2M+ boards",
      label: "created monthly",
    },
    {
      stat: "99.9% uptime",
      label: "guaranteed",
    },
  ];

  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                {benefit.stat}
              </p>
              <p className="text-muted-foreground">{benefit.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Benefits;
