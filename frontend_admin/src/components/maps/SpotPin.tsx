import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SpotPinProps {
  spot: any;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
  scale: number;
}

export function SpotPin({ spot, x, y, isSelected, onClick, scale }: SpotPinProps) {
  const statusColor = {
    available: 'bg-emerald-500 border-emerald-600',
    occupied: 'bg-slate-700 border-slate-800',
    reserved: 'bg-indigo-500 border-indigo-600',
    maintenance: 'bg-amber-500 border-amber-600',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={onClick}
    >
      {/* Hover Card / Tooltip could go here */}
      
      {/* The Pin */}
      <motion.div 
        className={cn(
          "w-8 h-12 rounded-t-lg rounded-b-sm flex items-center justify-center shadow-lg transition-all duration-200 border-2",
          statusColor[spot.status as keyof typeof statusColor],
          isSelected ? "ring-2 ring-white ring-offset-2 scale-125 z-20" : "hover:scale-110 z-10"
        )}
        layoutId={`spot-${spot.id}`}
      >
         <span className="text-[10px] font-bold text-white">{spot.number}</span>
         
         {/* Car visual if occupied */}
         {spot.status === 'occupied' && (
           <div className="absolute -bottom-1 w-full h-1 bg-black/20 rounded-full blur-sm" />
         )}
      </motion.div>

      {/* Pulse for available spots */}
      {spot.status === 'available' && (
        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
      )}
    </motion.div>
  );
}
