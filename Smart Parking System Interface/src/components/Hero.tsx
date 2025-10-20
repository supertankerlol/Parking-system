import { Button } from "./ui/button";
import { ArrowRight, Smartphone } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1688387786635-fc9922bc6e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc2MDkxOTIyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Futuristic City"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-[#0a0a0f]/90 to-[#0a0a0f]"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a855f7]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 backdrop-blur-sm">
            <span className="text-[#00f0ff] text-sm">⚡ The Future of Parking is Here</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl max-w-4xl mx-auto">
            <span className="gradient-text">Smart Parking</span>
            <br />
            <span className="text-white">Made Simple</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-[#c0c0d8] max-w-2xl mx-auto">
            Find, reserve, and pay for parking in seconds. Real-time availability powered by AI and smart sensors.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] transition-all text-white px-8 py-6 group"
            >
              Find Parking Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 px-8 py-6"
            >
              <Smartphone className="mr-2 w-5 h-5" />
              Download App
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl text-[#00f0ff]">10K+</div>
              <div className="text-[#c0c0d8]">Parking Spots</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl text-[#a855f7]">50+</div>
              <div className="text-[#c0c0d8]">Cities</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl text-[#00f0ff]">100K+</div>
              <div className="text-[#c0c0d8]">Happy Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10"></div>
    </section>
  );
}
