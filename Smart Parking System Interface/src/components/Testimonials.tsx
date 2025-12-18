import { Card } from "./ui/card";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Executive",
      content: "SmartPark has completely transformed my daily commute. I can reserve parking before I even leave the office. The contactless payment is seamless!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjA5NTU0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Michael Chen",
      role: "Software Developer",
      content: "As an EV owner, finding charging spots was always stressful. SmartPark's integrated EV charging network is a game-changer. Highly recommend!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    {
      name: "Emily Rodriguez",
      role: "Freelance Designer",
      content: "The real-time availability feature saves me so much time. No more circling around looking for parking. The app is intuitive and beautifully designed.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#12121a] to-[#0a0a0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/5 mb-4">
            <span className="text-[#a855f7] text-sm">TESTIMONIALS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl mb-4">
            <span className="gradient-text">What Our Users Say</span>
          </h2>
          <p className="text-[#c0c0d8] text-lg max-w-2xl mx-auto">
            Join thousands of satisfied users who've transformed their parking experience
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-[#12121a]/50 backdrop-blur-sm border-[#00f0ff]/20 p-8 glow-card"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#00f0ff] text-[#00f0ff]" />
                ))}
              </div>

              {/* Content */}
              <p className="text-[#c0c0d8] mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#a855f7] p-0.5">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-white">{testimonial.name}</div>
                  <div className="text-sm text-[#c0c0d8]">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#12121a]/50 backdrop-blur-sm border border-[#00f0ff]/20 rounded-lg p-6 text-center">
            <div className="text-3xl text-[#00f0ff] mb-2">4.9/5</div>
            <div className="text-[#c0c0d8]">Average Rating</div>
          </div>
          <div className="bg-[#12121a]/50 backdrop-blur-sm border border-[#a855f7]/20 rounded-lg p-6 text-center">
            <div className="text-3xl text-[#a855f7] mb-2">98%</div>
            <div className="text-[#c0c0d8]">Customer Satisfaction</div>
          </div>
          <div className="bg-[#12121a]/50 backdrop-blur-sm border border-[#00f0ff]/20 rounded-lg p-6 text-center">
            <div className="text-3xl text-[#00f0ff] mb-2">2M+</div>
            <div className="text-[#c0c0d8]">Bookings Completed</div>
          </div>
        </div>
      </div>
    </section>
  );
}
