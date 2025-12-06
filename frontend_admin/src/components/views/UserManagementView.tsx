import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Search, MoreVertical, Shield, UserCog, Ban, Eye } from 'lucide-react';
import { USERS } from '../../utils/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

export function UserManagementView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [impersonatingUser, setImpersonatingUser] = useState<any>(null);

  // Duplicate mock users for the list
  const usersList = [...USERS, ...USERS, ...USERS].map((u, i) => ({...u, id: `${u.id}_${i}`}));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage access, roles, and permissions.</p>
        </div>
        <Button><UserCog className="w-4 h-4 mr-2" /> Add User</Button>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search users..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm">Active</Button>
               <Button variant="outline" size="sm">Banned</Button>
               <Button variant="outline" size="sm">Staff</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Active</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {usersList.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2">
                         {user.role === 'admin' && <Shield className="w-3 h-3 text-primary" />}
                         <span className="capitalize">{user.role}</span>
                       </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.lastActive}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setImpersonatingUser(user)}>
                            <Eye className="w-4 h-4 mr-2" /> Impersonate View
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Bookings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="w-4 h-4 mr-2" /> Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Impersonation Modal */}
      <Dialog open={!!impersonatingUser} onOpenChange={(open) => !open && setImpersonatingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>
              You are about to sign in as <span className="font-bold text-foreground">{impersonatingUser?.name}</span>. 
              You will see exactly what they see. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900 text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Admin actions performed while impersonating will be attributed to your admin account in the audit log.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImpersonatingUser(null)}>Cancel</Button>
            <Button onClick={() => {
               // Mock action
               alert(`Now acting as ${impersonatingUser.name}`);
               setImpersonatingUser(null);
            }}>
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
