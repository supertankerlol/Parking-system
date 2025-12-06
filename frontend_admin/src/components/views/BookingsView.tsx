import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, Download, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { RECENT_ACTIVITY } from '../../utils/mockData';

export function BookingsView() {
  const bookings = [
    ...RECENT_ACTIVITY, 
    ...RECENT_ACTIVITY.map(a => ({...a, id: a.id + 'x'})),
    ...RECENT_ACTIVITY.map(a => ({...a, id: a.id + 'y'}))
  ].filter(x => x.type !== 'alert');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings & Revenue</h2>
          <p className="text-muted-foreground">Manage reservations, payments, and refunds.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search bookings..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {bookings.map((booking, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-mono text-xs">{booking.id.toUpperCase()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                          {booking.avatar && <img src={booking.avatar} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-medium">{booking.user}</div>
                          <div className="text-xs text-muted-foreground">{booking.plate || 'No Plate'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                         <div className="font-medium">Spot A-{10 + i}</div>
                         <div className="text-muted-foreground">Level 1 • Standard</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {booking.type === 'payment' ? (
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-500/10 text-blue-500">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono">{booking.amount || '-'}</td>
                    <td className="p-4 text-muted-foreground">{booking.time}</td>
                    <td className="p-4">
                       <Button variant="ghost" size="icon" className="h-8 w-8">
                         <MoreHorizontal className="w-4 h-4" />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
