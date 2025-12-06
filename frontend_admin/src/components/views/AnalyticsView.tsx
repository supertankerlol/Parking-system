import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Download, Filter } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

const HOURLY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  occupancy: Math.floor(Math.random() * 300) + 100,
  revenue: Math.floor(Math.random() * 500) + 200,
  predicted: Math.floor(Math.random() * 300) + 120,
}));

const WEEKLY_DATA = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  thisWeek: Math.floor(Math.random() * 5000) + 2000,
  lastWeek: Math.floor(Math.random() * 5000) + 2000,
}));

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
          <p className="text-muted-foreground">Performance metrics and predictive insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2" /> Last 7 Days</Button>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button size="sm"><Download className="w-4 h-4 mr-2" /> Export Report</Button>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Real-time Occupancy vs Predicted</CardTitle>
            <CardDescription>Actual occupancy compared to AI forecast.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_DATA}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="occupancy" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOccupancy)" name="Actual" />
                  <Area type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" name="Predicted (AI)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Revenue Performance</CardTitle>
            <CardDescription>Gross revenue breakdown by hour.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HOURLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Revenue Comparison</CardTitle>
              <CardDescription>This week vs last week performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={WEEKLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Legend />
                    <Line type="monotone" dataKey="thisWeek" stroke="hsl(var(--primary))" strokeWidth={2} name="This Week" />
                    <Line type="monotone" dataKey="lastWeek" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Last Week" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
         </Card>

         <Card>
           <CardHeader>
             <CardTitle>Cohort Analysis</CardTitle>
             <CardDescription>Customer retention by month.</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
                {[
                  { label: 'New Users', val: '124', color: 'bg-blue-500' },
                  { label: 'Returning', val: '854', color: 'bg-indigo-500' },
                  { label: 'Subscribers', val: '432', color: 'bg-purple-500' },
                  { label: 'Churned', val: '12', color: 'bg-red-500' }
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold font-mono">{item.val}</span>
                  </div>
                ))}
             </div>
             <div className="mt-6 pt-6 border-t border-border">
               <h4 className="text-sm font-medium mb-2">Churn Rate</h4>
               <div className="text-3xl font-bold text-foreground">1.2% <span className="text-xs text-green-500 font-normal">↓ 0.4%</span></div>
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
