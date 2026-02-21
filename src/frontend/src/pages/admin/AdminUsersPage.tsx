import { useState } from 'react';
import { useGetAllUsersProfiles } from '../../lib/backend/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { UserProfile } from '@/backend';

export default function AdminUsersPage() {
  const { data: users, isLoading } = useGetAllUsersProfiles();
  const { identity } = useInternetIdentity();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ principal: Principal; profile: UserProfile } | null>(null);
  const [deletingUser, setDeletingUser] = useState<{ principal: Principal; name: string } | null>(null);

  const isCurrentUser = (principal: Principal) => {
    return identity?.getPrincipal().toString() === principal.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            {users?.length || 0} user account(s) registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users registered</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Security Manager</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(([principal, profile]) => (
                    <TableRow key={principal.toString()}>
                      <TableCell>{profile.name}</TableCell>
                      <TableCell>{profile.username}</TableCell>
                      <TableCell>
                        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                          {profile.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile.hotelId ? profile.hotelId.toString() : '-'}
                      </TableCell>
                      <TableCell>
                        {profile.securityManager || '-'}
                      </TableCell>
                      <TableCell>
                        {profile.contactNumber || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingUser({ principal, profile })}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingUser({ principal, name: profile.name })}
                            disabled={isCurrentUser(principal)}
                            title={isCurrentUser(principal) ? 'Cannot delete your own account' : 'Delete user'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />

      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          userPrincipal={editingUser.principal}
          userProfile={editingUser.profile}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          userPrincipal={deletingUser.principal}
          userName={deletingUser.name}
        />
      )}
    </div>
  );
}
