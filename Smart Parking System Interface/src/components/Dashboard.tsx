import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Clock, DollarSign, Navigation2 } from "lucide-react";
import { Button } from "./ui/button";

export function Dashboard() {
  const parkingSpots = [
    {
      name: "Central Plaza Parking",
      distance: "0.3 km",
      available: 12,
      total: 50,
      price: "$2.50/hr",
      rating: 4.8,
      features: ["EV Charging", "Covered"],
    },
    {
      name: "Tech Hub Garage",
      distance: "0.5 km",
      available: 8,
      total: 40,
      price: "$3.00/hr",
      rating: 4.9,
      features: ["24/7 Access", "Security"],
    },
    {
      name: "Metro Station Lot",
      distance: "0.7 km",
      available: 25,
      total: 100,
      price: "$2.00/hr",
      rating: 4.6,
      features: ["Near Transit", "Budget"],
    },
  ];

  return (
    <section id="dashboard" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#12121a] relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-full blur-[150px]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 mb-4">
            <span className="text-[#00f0ff] text-sm">DASHBOARD</span>
          </div>
          <h2 className="text-3xl sm:text-5xl mb-4">
            <span className="gradient-text">Real-Time Availability</span>
          </h2>
          <p className="text-[#c0c0d8] text-lg max-w-2xl mx-auto">
            Find and reserve parking spots near you with live updates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-[#12121a] border-[#00f0ff]/20 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl text-white">Nearby Parking</h3>
                <Button size="sm" variant="outline" className="border-[#00f0ff] text-[#00f0ff]">
                  <Navigation2 className="w-4 h-4 mr-2" />
                  My Location
                </Button>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-[#1a1a24] rounded-lg h-96 relative overflow-hidden border border-[#00f0ff]/10">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-[#00f0ff] rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-[#a855f7] rounded-full"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-28 h-28 border-2 border-[#00f0ff] rounded-full"></div>
                </div>
                
                {/* Map Markers */}
                <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group cursor-pointer">
                    <div className="w-3 h-3 bg-[#00f0ff] rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-[#00f0ff] rounded-full relative"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#12121a] border border-[#00f0ff] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Central Plaza - 12 spots
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 left-1/2">
                  <div className="relative group cursor-pointer">
                    <div className="w-3 h-3 bg-[#a855f7] rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-[#a855f7] rounded-full relative"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#12121a] border border-[#a855f7] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Tech Hub - 8 spots
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-1/3 right-1/3">
                  <div className="relative group cursor-pointer">
                    <div className="w-3 h-3 bg-[#00f0ff] rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-[#00f0ff] rounded-full relative"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#12121a] border border-[#00f0ff] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Metro Station - 25 spots
                    </div>
                  </div>
                </div>

                {/* Center Marker (Your Location) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-white rounded-full border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.8)]"></div>
                </div>
              </div>
            </Card>
          </div>

          {/* Parking List */}
          <div className="space-y-4">
            {parkingSpots.map((spot, index) => (
              <Card
                key={index}
                className="bg-[#12121a] border-[#00f0ff]/20 p-4 hover:border-[#00f0ff]/50 transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white group-hover:text-[#00f0ff] transition-colors">{spot.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-[#c0c0d8]" />
                        <span className="text-sm text-[#c0c0d8]">{spot.distance}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#00f0ff]">{spot.price}</div>
                      <div className="text-xs text-[#c0c0d8]">⭐ {spot.rating}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-[#c0c0d8]">
                        {spot.available}/{spot.total} available
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {spot.features.map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="border-[#00f0ff]/30 text-[#00f0ff] text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  >
                    Reserve Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
