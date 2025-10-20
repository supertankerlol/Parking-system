import { Scan, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { Card } from "./ui/card";

export function HowItWorks() {
  const steps = [
    {
      icon: Scan,
      title: "Smart Sensors Detect",
      description: "Our AI-powered sensors continuously monitor parking availability in real-time across all connected locations.",
      color: "from-[#00f0ff] to-[#00b8d4]",
    },
    {
      icon: MapPin,
      title: "Real-Time Updates",
      description: "Get instant notifications about available slots near you. Reserve your spot before you arrive.",
      color: "from-[#a855f7] to-[#7c3aed]",
    },
    {
      icon: CreditCard,
      title: "Automated Payment",
      description: "Seamless contactless payment integrated with your digital wallet. No cash, no cards needed.",
      color: "from-[#00f0ff] to-[#a855f7]",
    },
    {
      icon: CheckCircle,
      title: "Park & Go",
      description: "Drive straight to your reserved spot. Automated gates recognize your vehicle. It's that simple.",
      color: "from-[#c0c0d8] to-[#a855f7]",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0f] relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 mb-4">
            <span className="text-[#00f0ff] text-sm">PROCESS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-[#c0c0d8] text-lg max-w-2xl mx-auto">
            Experience the future of parking with our seamless four-step process
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="bg-[#12121a] border-[#00f0ff]/20 p-6 glow-card relative overflow-hidden group"
            >
              {/* Step Number */}
              <div className="absolute top-4 right-4 text-5xl opacity-10 group-hover:opacity-20 transition-opacity">
                {index + 1}
              </div>

              {/* Icon with Gradient Background */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl text-white mb-2">{step.title}</h3>
              <p className="text-[#c0c0d8] text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connecting Line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#00f0ff] to-transparent"></div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
