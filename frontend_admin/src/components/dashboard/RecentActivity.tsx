import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { RECENT_ACTIVITY } from '../../utils/mockData';
import { Clock, Car, CreditCard, AlertTriangle } from 'lucide-react';

function getIcon(type: string) {
  switch (type) {
    case 'payment': return <CreditCard className="w-4 h-4 text-emerald-500" />;
    case 'alert': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'entry': return <Car className="w-4 h-4 text-blue-500" />;
    case 'exit': return <Car className="w-4 h-4 text-slate-500" />;
    default: return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

export function RecentActivity() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold tracking-tight">Live Activity</h3>
      <div className="space-y-0 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {RECENT_ACTIVITY.map((item, i) => (
          <div 
            key={item.id} 
            className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
          >
            <div className="relative">
              {item.avatar ? (
                <img src={item.avatar} alt={item.user} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                   {getIcon(item.type)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border border-border shadow-sm">
                {getIcon(item.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.user}</p>
              <p className="text-xs text-muted-foreground truncate">{item.action} {item.plate && `• ${item.plate}`}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium">{item.amount || item.duration || ''}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
