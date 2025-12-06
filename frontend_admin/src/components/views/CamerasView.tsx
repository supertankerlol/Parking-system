import React, { useState } from 'react';
import { CameraTile } from '../dashboard/CameraTile';
import { CAMERAS } from '../../utils/mockData';
import { Button } from '../ui/button';
import { LayoutGrid, Grid, Maximize } from 'lucide-react';
import { Slider } from '../ui/slider';

export function CamerasView() {
  const [gridSize, setGridSize] = useState<2 | 3 | 4>(3);
  
  // Duplicate cameras to fill grid
  const cameras = [...CAMERAS, ...CAMERAS, ...CAMERAS].slice(0, 12);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live Monitoring</h2>
          <p className="text-muted-foreground">Real-time surveillance and event detection.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg">
          <Button 
            variant={gridSize === 2 ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setGridSize(2)}
            className="h-8 px-2"
          >
            <LayoutGrid className="w-4 h-4 mr-1" /> 2x2
          </Button>
          <Button 
            variant={gridSize === 3 ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setGridSize(3)}
            className="h-8 px-2"
          >
            <Grid className="w-4 h-4 mr-1" /> 3x3
          </Button>
          <Button 
            variant={gridSize === 4 ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setGridSize(4)}
            className="h-8 px-2"
          >
            <Maximize className="w-4 h-4 mr-1" /> 4x4
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 overflow-y-auto pr-2 min-h-0 flex-1 ${
        gridSize === 2 ? 'grid-cols-2' : 
        gridSize === 3 ? 'grid-cols-3' : 
        'grid-cols-4'
      }`}>
        {cameras.map((cam, i) => (
          <div key={`${cam.id}-${i}`} className="aspect-video">
            <CameraTile camera={{...cam, name: `${cam.name} ${i+1}`}} />
          </div>
        ))}
      </div>
    </div>
  );
}
