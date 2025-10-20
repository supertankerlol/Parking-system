import { Zap, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-[#00f0ff]/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="gradient-text text-xl">SmartPark</span>
            </div>
            <p className="text-[#c0c0d8] text-sm">
              The future of parking is here. Smart, simple, and seamless.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-[#12121a] border border-[#00f0ff]/20 flex items-center justify-center hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all"
              >
                <Facebook className="w-4 h-4 text-[#00f0ff]" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-[#12121a] border border-[#00f0ff]/20 flex items-center justify-center hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all"
              >
                <Twitter className="w-4 h-4 text-[#00f0ff]" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-[#12121a] border border-[#00f0ff]/20 flex items-center justify-center hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all"
              >
                <Instagram className="w-4 h-4 text-[#00f0ff]" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-[#12121a] border border-[#00f0ff]/20 flex items-center justify-center hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all"
              >
                <Linkedin className="w-4 h-4 text-[#00f0ff]" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Mobile App
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Enterprise
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Press Kit
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#00f0ff]/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[#c0c0d8] text-sm">
              © 2025 SmartPark. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-[#c0c0d8] hover:text-[#00f0ff] transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
