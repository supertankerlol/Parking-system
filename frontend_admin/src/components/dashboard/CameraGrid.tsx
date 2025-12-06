import React from 'react';
import { CameraTile } from './CameraTile';
import { CAMERAS } from '../../utils/mockData';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

export function CameraGrid() {
  // Show top 3 cameras for dashboard
  const displayCameras = CAMERAS.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Live Monitoring</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayCameras.map((camera) => (
          <CameraTile key={camera.id} camera={camera} />
        ))}
      </div>
    </div>
  );
}
