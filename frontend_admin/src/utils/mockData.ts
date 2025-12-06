import { Camera, Activity, MapPin, User, Car, AlertTriangle, DollarSign, CreditCard, Clock, Zap } from 'lucide-react';

export const FACILITIES = [
  { id: 'fac_1', name: 'Metro Center Prime', address: '1200 Main St', capacity: 450, occupancy: 342, status: 'online', image: 'https://images.unsplash.com/photo-1560922604-d08a31f8f7d1?auto=format&fit=crop&q=80&w=1080' },
  { id: 'fac_2', name: 'Westside Terminal', address: '450 West Ave', capacity: 200, occupancy: 185, status: 'warning', image: 'https://images.unsplash.com/photo-1758432137020-3b1ca24b1681?auto=format&fit=crop&q=80&w=1080' },
  { id: 'fac_3', name: 'Harbor Bay Garage', address: '88 Pier Blvd', capacity: 600, occupancy: 120, status: 'online', image: 'https://images.unsplash.com/photo-1747573235085-aa6b21b92e07?auto=format&fit=crop&q=80&w=1080' },
];

export const KPIS = [
  { label: 'Live Occupancy', value: '82%', change: '+4.5%', trend: 'up', icon: Zap },
  { label: 'Revenue (Today)', value: '$14,230', change: '+12%', trend: 'up', icon: DollarSign },
  { label: 'Active Bookings', value: '342', change: '-2%', trend: 'down', icon: Car },
  { label: 'System Alerts', value: '3', change: '0', trend: 'neutral', icon: AlertTriangle },
];

export const CAMERAS = [
  { id: 'cam_01', name: 'Entrance Gate A', facility: 'Metro Center Prime', status: 'live', viewers: 2, image: 'https://images.unsplash.com/photo-1747573235085-aa6b21b92e07?auto=format&fit=crop&q=80&w=800' },
  { id: 'cam_02', name: 'Level 1 - North', facility: 'Metro Center Prime', status: 'live', viewers: 0, image: 'https://images.unsplash.com/photo-1758432137020-3b1ca24b1681?auto=format&fit=crop&q=80&w=800' },
  { id: 'cam_03', name: 'Exit Lane', facility: 'Metro Center Prime', status: 'maintenance', viewers: 0, image: null },
  { id: 'cam_04', name: 'Level 2 - EV Spots', facility: 'Metro Center Prime', status: 'live', viewers: 5, image: 'https://images.unsplash.com/photo-1560922604-d08a31f8f7d1?auto=format&fit=crop&q=80&w=800' },
  { id: 'cam_05', name: 'Rooftop Access', facility: 'Metro Center Prime', status: 'live', viewers: 1, image: 'https://images.unsplash.com/photo-1747573235085-aa6b21b92e07?auto=format&fit=crop&q=80&w=800' },
  { id: 'cam_06', name: 'Payment Kiosk', facility: 'Metro Center Prime', status: 'live', viewers: 0, image: 'https://images.unsplash.com/photo-1758432137020-3b1ca24b1681?auto=format&fit=crop&q=80&w=800' },
];

export const RECENT_ACTIVITY = [
  { id: 'act_1', user: 'Alice Freeman', action: 'Entered Facility', time: '2 min ago', plate: 'XYZ-998', type: 'entry', avatar: 'https://images.unsplash.com/photo-1655249481446-25d575f1c054?auto=format&fit=crop&q=80&w=150' },
  { id: 'act_2', user: 'Marcus Jones', action: 'Payment Successful', time: '5 min ago', amount: '$12.50', type: 'payment', avatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?auto=format&fit=crop&q=80&w=150' },
  { id: 'act_3', user: 'System', action: 'Camera 03 Offline', time: '12 min ago', type: 'alert', avatar: null },
  { id: 'act_4', user: 'Sarah Connor', action: 'Exited Facility', time: '15 min ago', plate: 'T-800', type: 'exit', avatar: 'https://images.unsplash.com/photo-1655249481446-25d575f1c054?auto=format&fit=crop&q=80&w=150' },
  { id: 'act_5', user: 'John Wick', action: 'Booking Created', time: '22 min ago', duration: '4h', type: 'booking', avatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?auto=format&fit=crop&q=80&w=150' },
];

export const SPOTS = Array.from({ length: 40 }, (_, i) => ({
  id: `spot_${i + 1}`,
  number: `A-${i + 1}`,
  status: Math.random() > 0.7 ? 'occupied' : Math.random() > 0.9 ? 'reserved' : Math.random() > 0.95 ? 'maintenance' : 'available',
  type: i % 10 === 0 ? 'handicap' : i % 8 === 0 ? 'ev' : 'standard',
  floor: 'L1',
  price: i % 8 === 0 ? 2.5 : 1.5, // EV spots more expensive
}));

export const USERS = [
  { id: 'u1', name: 'Alice Freeman', email: 'alice@example.com', status: 'active', role: 'user', balance: 0, lastActive: '2 min ago', avatar: 'https://images.unsplash.com/photo-1655249481446-25d575f1c054?auto=format&fit=crop&q=80&w=150' },
  { id: 'u2', name: 'Marcus Jones', email: 'marcus@example.com', status: 'active', role: 'vip', balance: 50, lastActive: '5 min ago', avatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?auto=format&fit=crop&q=80&w=150' },
  { id: 'u3', name: 'Sarah Connor', email: 'sarah@skynet.com', status: 'banned', role: 'user', balance: -15, lastActive: '2 days ago', avatar: 'https://images.unsplash.com/photo-1655249481446-25d575f1c054?auto=format&fit=crop&q=80&w=150' },
];
