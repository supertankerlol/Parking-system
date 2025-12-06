import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Maximize2, Video, AlertCircle, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface CameraTileProps {
  camera: {
    id: string;
    name: string;
    facility: string;
    status: string;
    image: string | null;
    viewers: number;
  };
}

export const CameraTile: React.FC<CameraTileProps> = ({ camera }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative aspect-video bg-black/90 rounded-lg overflow-hidden border border-border group shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Camera Feed / Placeholder */}
      <div className="absolute inset-0">
        {camera.image ? (
          <img 
            src={camera.image} 
            alt={camera.name} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <Video className="w-12 h-12 text-slate-700 animate-pulse" />
          </div>
        )}
        
        {/* Scanline Effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none opacity-20 animate-scanline" />
      </div>

      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            camera.status === 'live' ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-amber-500"
          )} />
          <span className="text-xs font-mono font-medium text-white drop-shadow-md">{camera.name}</span>
        </div>
        {camera.viewers > 0 && (
           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white border border-white/10">
             <Activity className="w-3 h-3" />
             <span>{camera.viewers} viewing</span>
           </div>
        )}
      </div>

      {/* Hover Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-[1px]"
      >
        <Button size="icon" variant="secondary" className="rounded-full w-10 h-10 shadow-xl hover:scale-110 transition-transform bg-white/10 border-white/20 text-white hover:bg-white/20">
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" className="rounded-full w-10 h-10 shadow-xl hover:scale-110 transition-transform bg-white/10 border-white/20 text-white hover:bg-white/20">
          <Video className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
         <div className="text-[10px] text-slate-400 font-mono">
           FPS: 24 • 1080p
         </div>
         {camera.status === 'warning' && (
           <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
             <AlertCircle className="w-3 h-3" /> Motion
           </span>
         )}
      </div>
    </motion.div>
  );
};
