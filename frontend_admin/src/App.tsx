import React from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CommandCenter } from './components/views/CommandCenter';
import { CamerasView } from './components/views/CamerasView';
import { BookingsView } from './components/views/BookingsView';
import { FacilityMapView } from './components/views/FacilityMapView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { UserManagementView } from './components/views/UserManagementView';
import { SettingsView } from './components/views/SettingsView';
import { Button } from './components/ui/button';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <CommandCenter />}
      {activeTab === 'map' && <FacilityMapView />}
      {activeTab === 'cameras' && <CamerasView />}
      {activeTab === 'bookings' && <BookingsView />}
      {activeTab === 'users' && <UserManagementView />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'settings' && <SettingsView />}
      
      {!['dashboard', 'map', 'cameras', 'bookings', 'users', 'analytics', 'settings'].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="p-6 rounded-full bg-primary/10">
             <span className="text-4xl">🚧</span>
          </div>
          <h2 className="text-2xl font-bold">Work in Progress</h2>
          <p className="text-muted-foreground max-w-md">
            The {activeTab} module is currently being built. Check back later for the full implementation.
          </p>
          <Button onClick={() => setActiveTab('dashboard')}>Return to Dashboard</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
