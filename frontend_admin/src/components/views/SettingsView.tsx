import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RECENT_ACTIVITY } from '../../utils/mockData';
import { FileText, CreditCard, History, Settings, Sliders, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage facility configuration, pricing, and billing.</p>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
          <TabsTrigger value="billing">Billing & Invoices</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general">
           <div className="grid gap-6 max-w-2xl">
             <Card>
               <CardHeader>
                 <CardTitle>Facility Information</CardTitle>
                 <CardDescription>Global settings for this location.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-sm font-medium">Facility Name</label>
                   <Input defaultValue="Metro Center Prime" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-sm font-medium">Address</label>
                   <Input defaultValue="1200 Main St, San Francisco, CA" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-sm font-medium">Timezone</label>
                     <Input defaultValue="Pacific Time (US & Canada)" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-sm font-medium">Currency</label>
                     <Input defaultValue="USD ($)" />
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="border-destructive/20">
               <CardHeader>
                 <CardTitle className="text-destructive">Danger Zone</CardTitle>
               </CardHeader>
               <CardContent>
                 <Button variant="destructive">Archive Facility</Button>
               </CardContent>
             </Card>
           </div>
        </TabsContent>

        {/* PRICING */}
        <TabsContent value="pricing">
           <div className="grid gap-6 max-w-4xl">
             <Card>
               <CardHeader>
                 <CardTitle>Dynamic Pricing Rules</CardTitle>
                 <CardDescription>Configure automated price adjustments.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="p-4 border border-border rounded-lg bg-secondary/10 flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                       <Sliders className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <div className="font-medium">Peak Hours Multiplier</div>
                       <div className="text-sm text-muted-foreground">Increase rates by 1.5x when occupancy &gt; 85%</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                 </div>
                 
                 <div className="p-4 border border-border rounded-lg bg-secondary/10 flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                       <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <div className="font-medium">Weekend Flat Rate</div>
                       <div className="text-sm text-muted-foreground">Fixed $15/day on Sat/Sun</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Base Hourly Rate</label>
                       <div className="relative">
                         <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                         <Input className="pl-6" defaultValue="4.50" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Event Rate (Manual)</label>
                       <div className="relative">
                         <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                         <Input className="pl-6" defaultValue="25.00" />
                       </div>
                    </div>
                 </div>
                 <Button>Save Changes</Button>
               </CardContent>
             </Card>
           </div>
        </TabsContent>

        {/* BILLING */}
        <TabsContent value="billing">
           <div className="grid gap-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="text-2xl font-bold">Enterprise</div>
                      <p className="text-xs text-muted-foreground mt-1">Unlimited Spots • Priority Support</p>
                   </CardContent>
                </Card>
                <Card>
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Next Invoice</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="text-2xl font-bold">$899.00</div>
                      <p className="text-xs text-muted-foreground mt-1">Due Dec 1, 2023</p>
                   </CardContent>
                </Card>
             </div>

             <Card>
               <CardHeader>
                 <CardTitle>Invoices</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <table className="w-full caption-bottom text-sm text-left">
                   <thead className="[&_tr]:border-b">
                     <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Invoice ID</th>
                       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                       <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Download</th>
                     </tr>
                   </thead>
                   <tbody>
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="border-b border-border">
                           <td className="p-4 font-mono">INV-{2023000 + i}</td>
                           <td className="p-4">Oct {10 + i}, 2023</td>
                           <td className="p-4 font-mono">$899.00</td>
                           <td className="p-4"><Badge variant="outline" className="bg-green-500/10 text-green-500 border-transparent">Paid</Badge></td>
                           <td className="p-4 text-right">
                              <Button size="icon" variant="ghost"><FileText className="w-4 h-4" /></Button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </CardContent>
             </Card>
           </div>
        </TabsContent>

        {/* AUDIT LOG */}
        <TabsContent value="audit">
           <Card>
             <CardHeader>
               <CardTitle>System Activity Log</CardTitle>
               <CardDescription>Detailed audit trail of all admin actions.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
               <table className="w-full caption-bottom text-sm text-left">
                 <thead className="[&_tr]:border-b">
                   <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Timestamp</th>
                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                   </tr>
                 </thead>
                 <tbody>
                   {RECENT_ACTIVITY.map((act, i) => (
                     <tr key={i} className="border-b border-border">
                       <td className="p-4 text-muted-foreground font-mono text-xs">{new Date().toISOString().split('T')[0]} 12:{30+i}:00</td>
                       <td className="p-4 font-medium">{act.user || 'System'}</td>
                       <td className="p-4">
                          <span className="font-medium">{act.action}</span>
                       </td>
                       <td className="p-4 text-muted-foreground text-xs font-mono truncate max-w-[200px]">
                          {JSON.stringify({ target: act.id, type: act.type })}
                       </td>
                       <td className="p-4 text-muted-foreground text-xs font-mono">192.168.1.{10+i}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

function Calendar(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
