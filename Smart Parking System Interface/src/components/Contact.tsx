import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px]"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 mb-4">
            <span className="text-[#00f0ff] text-sm">GET IN TOUCH</span>
          </div>
          <h2 className="text-3xl sm:text-5xl mb-4">
            <span className="gradient-text">Contact Us</span>
          </h2>
          <p className="text-[#c0c0d8] text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <Card className="bg-[#12121a]/50 backdrop-blur-sm border-[#00f0ff]/20 p-6 glow-card">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#a855f7]/20 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h3 className="text-white mb-2">Email</h3>
              <p className="text-[#c0c0d8] text-sm">support@smartpark.io</p>
              <p className="text-[#c0c0d8] text-sm">business@smartpark.io</p>
            </Card>

            <Card className="bg-[#12121a]/50 backdrop-blur-sm border-[#a855f7]/20 p-6 glow-card">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#a855f7]/20 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#a855f7]" />
              </div>
              <h3 className="text-white mb-2">Phone</h3>
              <p className="text-[#c0c0d8] text-sm">+1 (555) 123-4567</p>
              <p className="text-[#c0c0d8] text-sm">Mon-Fri 9am-6pm EST</p>
            </Card>

            <Card className="bg-[#12121a]/50 backdrop-blur-sm border-[#00f0ff]/20 p-6 glow-card">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#a855f7]/20 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h3 className="text-white mb-2">Office</h3>
              <p className="text-[#c0c0d8] text-sm">123 Innovation Drive</p>
              <p className="text-[#c0c0d8] text-sm">San Francisco, CA 94102</p>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#12121a]/50 backdrop-blur-sm border-[#00f0ff]/20 p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2">Name</label>
                    <Input
                      placeholder="Your name"
                      className="bg-[#1a1a24] border-[#00f0ff]/20 text-white placeholder:text-[#c0c0d8]/50 focus:border-[#00f0ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      className="bg-[#1a1a24] border-[#00f0ff]/20 text-white placeholder:text-[#c0c0d8]/50 focus:border-[#00f0ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Subject</label>
                  <Input
                    placeholder="How can we help?"
                    className="bg-[#1a1a24] border-[#00f0ff]/20 text-white placeholder:text-[#c0c0d8]/50 focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Message</label>
                  <Textarea
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="bg-[#1a1a24] border-[#00f0ff]/20 text-white placeholder:text-[#c0c0d8]/50 focus:border-[#00f0ff] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all group"
                >
                  Send Message
                  <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
