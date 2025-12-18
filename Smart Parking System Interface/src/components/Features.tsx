import { Navigation, Calendar, Smartphone, Shield, Zap, Bell } from "lucide-react";
import { Card } from "./ui/card";

export function Features() {
  const features = [
    {
      icon: Navigation,
      title: "Smart Navigation",
      description: "AI-powered routing guides you to the nearest available spot with real-time traffic updates.",
    },
    {
      icon: Calendar,
      title: "Reserve Your Slot",
      description: "Book parking spots in advance for events, meetings, or daily commutes with guaranteed availability.",
    },
    {
      icon: Smartphone,
      title: "Contactless Payment",
      description: "Secure digital wallet integration with automatic payment processing. No physical cards needed.",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "24/7 surveillance, encrypted transactions, and verified parking locations for your peace of mind.",
    },
    {
      icon: Zap,
      title: "EV Charging Stations",
      description: "Find and reserve electric vehicle charging spots with integrated payment for charging services.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get alerts for reservation reminders, price drops, and when your parking time is about to expire.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0a0a0f] to-[#12121a] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/5 mb-4">
            <span className="text-[#a855f7] text-sm">FEATURES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl mb-4">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-[#c0c0d8] text-lg max-w-2xl mx-auto">
            Everything you need for a seamless parking experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-[#12121a]/50 backdrop-blur-sm border-[#00f0ff]/20 p-8 glow-card group"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#a855f7]/20 flex items-center justify-center mb-6 group-hover:from-[#00f0ff]/30 group-hover:to-[#a855f7]/30 transition-all">
                <feature.icon className="w-7 h-7 text-[#00f0ff]" />
              </div>

              {/* Content */}
              <h3 className="text-xl text-white mb-3">{feature.title}</h3>
              <p className="text-[#c0c0d8] leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
