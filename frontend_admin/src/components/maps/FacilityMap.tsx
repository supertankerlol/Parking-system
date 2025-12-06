import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Layers, Plus, Minus, Move, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { SpotPin } from './SpotPin';
import { SPOTS } from '../../utils/mockData';
import { Card } from '../ui/card';

interface FacilityMapProps {
  interactive?: boolean;
  onSpotClick?: (spot: any) => void;
}

export function FacilityMap({ interactive = true, onSpotClick }: FacilityMapProps) {
  const [scale, setScale] = useState(1);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = useState(false);
  
  // Drag Selection State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{startX: number, startY: number, currentX: number, currentY: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const handleSpotClick = (spot: any) => {
    if (!interactive) return;
    setSelectedSpot(spot.id);
    if (onSpotClick) onSpotClick(spot);
  };

  // Simple drag selection logic (Visual only for prototype)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive || e.button !== 0) return;
    // Only start if clicking on background (not on a pin)
    if ((e.target as HTMLElement).closest('.spot-pin')) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsSelecting(true);
    setSelectionBox({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSelectionBox({
      ...selectionBox,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionBox(null);
    // Here we would calculate intersection with spots
  };

  // Generate grid positions
  const spotsWithPos = SPOTS.map((spot, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    // Simple layout logic
    const x = 10 + (col * 8.5);
    const y = 20 + (row * 15) + (row > 1 ? 10 : 0); // Gap in middle
    return { ...spot, x, y };
  });

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#F0F4F8] dark:bg-[#0F172A] overflow-hidden rounded-xl border border-border group select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      
      {/* Map Canvas */}
      <motion.div 
        className="w-full h-full absolute inset-0 origin-center"
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        {/* Floor Texture / Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Building Walls (Simulated) */}
        <div className="absolute inset-[5%] border-4 border-slate-300 dark:border-slate-700 rounded-3xl pointer-events-none" />
        <div className="absolute top-[45%] left-[5%] right-[5%] h-[10%] bg-slate-200/50 dark:bg-slate-800/50 pointer-events-none" /> {/* Driveway */}

        {/* Spots */}
        {spotsWithPos.map(spot => (
          <div key={spot.id} className="spot-pin">
            <SpotPin 
              spot={spot}
              x={spot.x}
              y={spot.y}
              isSelected={selectedSpot === spot.id}
              onClick={() => handleSpotClick(spot)}
              scale={scale}
            />
          </div>
        ))}

        {/* Heatmap Overlay */}
        <AnimatePresence>
          {heatmapMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none mix-blend-multiply dark:mix-blend-screen"
              style={{ 
                background: 'radial-gradient(circle at 30% 40%, rgba(255,0,0,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,255,0,0.3) 0%, transparent 40%)' 
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Selection Box */}
      {selectionBox && (
        <div 
          className="absolute bg-primary/20 border border-primary z-30 pointer-events-none"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
          }}
        />
      )}

      {/* Controls Overlay */}
      {interactive && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
           <div className="bg-background/80 backdrop-blur p-1 rounded-lg shadow-lg border border-border flex flex-col gap-1">
             <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleZoom(0.2); }}><Plus className="w-4 h-4" /></Button>
             <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleZoom(-0.2); }}><Minus className="w-4 h-4" /></Button>
           </div>
           <Button size="icon" variant="secondary" className="shadow-lg" onClick={(e) => { e.stopPropagation(); setHeatmapMode(!heatmapMode); }}>
             <Layers className={`w-4 h-4 ${heatmapMode ? 'text-primary' : ''}`} />
           </Button>
        </div>
      )}

      {/* Info Overlay (Top Left) */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-3 py-2 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Available</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-700"/> Occupied</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"/> Reserved</div>
        </div>
      </div>
    </div>
  );
}
