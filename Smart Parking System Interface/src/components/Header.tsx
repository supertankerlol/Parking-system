import { Button } from "./ui/button";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-[#00f0ff]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="gradient-text text-xl">SmartPark</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors">
              Features
            </a>
            <a href="#dashboard" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors">
              Dashboard
            </a>
            <a href="#testimonials" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all">
              Get the App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#00f0ff]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a
              href="#how-it-works"
              className="block text-[#c0c0d8] hover:text-[#00f0ff] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#features"
              className="block text-[#c0c0d8] hover:text-[#00f0ff] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#dashboard"
              className="block text-[#c0c0d8] hover:text-[#00f0ff] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            <a
              href="#testimonials"
              className="block text-[#c0c0d8] hover:text-[#00f0ff] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#contact"
              className="block text-[#c0c0d8] hover:text-[#00f0ff] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <Button className="w-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7]">
              Get the App
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
