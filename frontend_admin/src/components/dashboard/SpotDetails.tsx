import React from 'react';
import { motion } from 'framer-motion';
import { X, Car, Clock, Camera, Lock, DollarSign, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface SpotDetailsProps {
  spot: any;
  onClose: () => void;
}

export function SpotDetails({ spot, onClose }: SpotDetailsProps) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-4 bottom-4 right-4 w-96 bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-20 flex flex-col"
    >
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div>
           <h3 className="font-bold text-lg">Spot {spot.number}</h3>
           <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{spot.floor} • {spot.type}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status Block */}
        <div className={`p-4 rounded-lg border ${
            spot.status === 'occupied' ? 'bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800' : 
            spot.status === 'available' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900' :
            'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
        }`}>
           <div className="flex items-center gap-3 mb-2">
             <div className={`w-3 h-3 rounded-full ${
                 spot.status === 'occupied' ? 'bg-slate-500' : 
                 spot.status === 'available' ? 'bg-emerald-500' : 
                 'bg-amber-500'
             }`} />
             <span className="font-medium capitalize">{spot.status}</span>
           </div>
           {spot.status === 'occupied' && (
             <div className="space-y-1">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">License Plate</span>
                 <span className="font-mono font-bold">ABC-1234</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Duration</span>
                 <span>2h 15m</span>
               </div>
             </div>
           )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="justify-start gap-2">
            <Lock className="w-4 h-4" /> Block Spot
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <DollarSign className="w-4 h-4" /> Change Price
          </Button>
          <Button variant="outline" className="justify-start gap-2">
             <Camera className="w-4 h-4" /> View Camera
          </Button>
          <Button variant="outline" className="justify-start gap-2">
             <MoreHorizontal className="w-4 h-4" /> More
          </Button>
        </div>

        {/* Pricing */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Hourly Rate</label>
          <div className="flex gap-2">
            <Input type="number" defaultValue={spot.price} className="font-mono" />
            <Button>Update</Button>
          </div>
        </div>
        
        {/* Camera Preview */}
        <div>
           <label className="text-sm font-medium mb-1.5 block">Live Feed</label>
           <div className="aspect-video bg-black rounded-lg overflow-hidden relative group cursor-pointer">
             <img 
                src="https://images.unsplash.com/photo-1560922604-d08a31f8f7d1?auto=format&fit=crop&q=80&w=400" 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity" 
             />
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="w-8 h-8 text-white" />
             </div>
             <div className="absolute bottom-2 left-2 text-[10px] text-white font-mono bg-black/50 px-1 rounded">CAM-04 (Linked)</div>
           </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border bg-muted/30">
        <Button className="w-full" variant="destructive">Report Issue</Button>
      </div>
    </motion.div>
  );
}
