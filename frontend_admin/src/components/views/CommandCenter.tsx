import React, { useState } from 'react';
import { KPIStats } from '../dashboard/KPIStats';
import { FacilityMap } from '../maps/FacilityMap';
import { CameraGrid } from '../dashboard/CameraGrid';
import { RecentActivity } from '../dashboard/RecentActivity';
import { SpotDetails } from '../dashboard/SpotDetails';
import { AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function CommandCenter() {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  return (
    <div className="space-y-6 relative">
      {/* Stats Row */}
      <KPIStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Main Map Area */}
        <div className="lg:col-span-2 relative h-full">
          <Card className="h-full border-border/50 shadow-sm flex flex-col overflow-hidden relative">
            <CardHeader className="px-6 py-4 border-b border-border flex-shrink-0">
               <CardTitle>Facility Floor Map</CardTitle>
            </CardHeader>
            <div className="flex-1 relative bg-secondary/20">
               <FacilityMap onSpotClick={setSelectedSpot} />
               
               <AnimatePresence>
                 {selectedSpot && (
                   <SpotDetails spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
                 )}
               </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Sidebar Area: Cameras & Activity */}
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
           <Card className="flex-1 border-border/50 shadow-sm overflow-hidden flex flex-col">
              <CardContent className="p-4 overflow-y-auto">
                 <CameraGrid />
                 <div className="my-6 border-t border-border" />
                 <RecentActivity />
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
