import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Building2, Layers, Layout, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { FACILITIES } from '../../utils/mockData';
import { FacilityMap } from '../maps/FacilityMap';
import { SpotDetails } from '../dashboard/SpotDetails';

export function FacilityMapView() {
  const [viewLevel, setViewLevel] = useState<'world' | 'facility' | 'floor'>('world');
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  const handleFacilityClick = (facility: any) => {
    setSelectedFacility(facility);
    setViewLevel('facility');
  };

  const handleFloorClick = (floor: string) => {
    setSelectedFloor(floor);
    setViewLevel('floor');
  };

  const handleBack = () => {
    if (viewLevel === 'floor') {
      setViewLevel('facility');
      setSelectedFloor(null);
    } else if (viewLevel === 'facility') {
      setViewLevel('world');
      setSelectedFacility(null);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Breadcrumbs & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
           <span 
             className={`cursor-pointer hover:text-primary ${viewLevel === 'world' ? 'text-foreground' : 'text-muted-foreground'}`}
             onClick={() => { setViewLevel('world'); setSelectedFacility(null); setSelectedFloor(null); }}
           >
             Global Map
           </span>
           {viewLevel !== 'world' && (
             <>
               <ChevronRight className="w-4 h-4 text-muted-foreground" />
               <span 
                 className={`cursor-pointer hover:text-primary ${viewLevel === 'facility' ? 'text-foreground' : 'text-muted-foreground'}`}
                 onClick={() => { setViewLevel('facility'); setSelectedFloor(null); }}
               >
                 {selectedFacility?.name}
               </span>
             </>
           )}
           {viewLevel === 'floor' && (
             <>
               <ChevronRight className="w-4 h-4 text-muted-foreground" />
               <span className="text-foreground">{selectedFloor}</span>
             </>
           )}
        </div>
        
        <div className="flex items-center gap-2">
           {viewLevel !== 'world' && (
             <Button variant="ghost" size="sm" onClick={handleBack}>
               <ArrowLeft className="w-4 h-4 mr-2" /> Back
             </Button>
           )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* WORLD VIEW */}
          {viewLevel === 'world' && (
            <motion.div 
              key="world"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 bg-slate-100 dark:bg-slate-900"
            >
               {/* Simulated World Map */}
               <div className="absolute inset-0 opacity-50" 
                    style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%) contrast(50%)' }}>
               </div>
               
               {/* Facility Pins */}
               {FACILITIES.map((fac, i) => (
                 <motion.div
                   key={fac.id}
                   initial={{ scale: 0, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="absolute cursor-pointer group"
                   style={{ 
                     top: `${30 + i * 15}%`, 
                     left: `${20 + i * 20}%` 
                   }}
                   onClick={() => handleFacilityClick(fac)}
                 >
                   <div className="relative flex flex-col items-center">
                     <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring absolute inset-0" />
                     <div className="w-10 h-10 rounded-full bg-primary border-4 border-background shadow-xl flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                       <Building2 className="w-5 h-5 text-white" />
                     </div>
                     <div className="mt-3 bg-card/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-lg border border-border text-center min-w-[120px]">
                       <div className="font-bold text-sm">{fac.name}</div>
                       <div className="text-xs text-muted-foreground">{fac.occupancy} / {fac.capacity} spots</div>
                     </div>
                   </div>
                 </motion.div>
               ))}
            </motion.div>
          )}

          {/* FACILITY VIEW */}
          {viewLevel === 'facility' && (
             <motion.div 
               key="facility"
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               className="absolute inset-0 bg-background flex"
             >
                <div className="w-1/3 border-r border-border p-6 space-y-6 bg-muted/10">
                   <div>
                     <h2 className="text-2xl font-bold">{selectedFacility?.name}</h2>
                     <p className="text-muted-foreground">{selectedFacility?.address}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-muted-foreground text-xs font-medium uppercase">Occupancy</div>
                        <div className="text-2xl font-bold mt-1">76%</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-muted-foreground text-xs font-medium uppercase">Revenue</div>
                        <div className="text-2xl font-bold mt-1">$4.2k</div>
                      </Card>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Select Floor</label>
                     {['Level 1', 'Level 2', 'Level 3 - Rooftop'].map((floor, i) => (
                       <Button 
                         key={floor} 
                         variant="outline" 
                         className="w-full justify-between h-14 group hover:border-primary hover:bg-primary/5"
                         onClick={() => handleFloorClick(floor)}
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center font-mono font-bold text-muted-foreground group-hover:text-primary">
                             L{i+1}
                           </div>
                           <span className="font-medium">{floor}</span>
                         </div>
                         <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                       </Button>
                     ))}
                   </div>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                    {/* 3D Building Preview Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <Building2 className="w-64 h-64" />
                    </div>
                    <div className="absolute bottom-8 right-8 p-4 bg-background/80 backdrop-blur rounded-xl border border-border shadow-lg max-w-xs">
                       <p className="text-sm">Select a floor level to view detailed layout and manage spots.</p>
                    </div>
                </div>
             </motion.div>
          )}

          {/* FLOOR VIEW */}
          {viewLevel === 'floor' && (
            <motion.div 
               key="floor"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="absolute inset-0"
            >
               <FacilityMap onSpotClick={setSelectedSpot} />
               <AnimatePresence>
                 {selectedSpot && (
                   <SpotDetails spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
                 )}
               </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
