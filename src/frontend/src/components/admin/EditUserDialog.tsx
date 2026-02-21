import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGetAllHotels } from '@/lib/backend/hotels';
import { useUpdateUser } from '@/lib/backend/users';
import { Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import type { UserProfile } from '@/backend';
import { UserRole } from '@/backend';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPrincipal: Principal;
  userProfile: UserProfile;
}

export function EditUserDialog({ open, onOpenChange, userPrincipal, userProfile }: EditUserDialogProps) {
  const { data: hotels, isLoading: hotelsLoading } = useGetAllHotels();
  const updateUser = useUpdateUser();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    hotelId: '',
    securityManager: '',
    contactNumber: '',
    isActive: true,
    password: '',
    role: 'user' as 'admin' | 'user',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-populate form when dialog opens or user data changes
  useEffect(() => {
    if (open && userProfile) {
      setFormData({
        name: userProfile.name,
        username: userProfile.username,
        hotelId: userProfile.hotelId ? userProfile.hotelId.toString() : '',
        securityManager: userProfile.securityManager || '',
        contactNumber: userProfile.contactNumber || '',
        isActive: userProfile.isActive,
        password: userProfile.password || '',
        role: userProfile.role === UserRole.admin ? 'admin' : 'user',
      });
      setErrors({});
    }
  }, [open, userProfile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.hotelId) {
      newErrors.hotelId = 'Hotel selection is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const hotelId = formData.hotelId ? BigInt(formData.hotelId) : null;
      const securityManager = formData.securityManager.trim() || null;
      const contactNumber = formData.contactNumber.trim() || null;

      await updateUser.mutateAsync({
        userPrincipal,
        name: formData.name.trim(),
        username: formData.username.trim(),
        hotelId,
        securityManager,
        contactNumber,
        isActive: formData.isActive,
        password: formData.password.trim(),
        role: formData.role === 'admin' ? UserRole.admin : UserRole.user,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user account details and hotel assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={errors.username ? 'border-destructive' : ''}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password (min 8 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel">Hotel *</Label>
            {hotelsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading hotels...
              </div>
            ) : (
              <Select
                value={formData.hotelId}
                onValueChange={(value) => setFormData({ ...formData, hotelId: value })}
              >
                <SelectTrigger className={errors.hotelId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels?.filter(h => h.isActive).map((hotel) => (
                    <SelectItem key={hotel.id.toString()} value={hotel.id.toString()}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.hotelId && (
              <p className="text-sm text-destructive">{errors.hotelId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityManager">Security Manager Name</Label>
            <Input
              id="securityManager"
              placeholder="Enter security manager name"
              value={formData.securityManager}
              onChange={(e) => setFormData({ ...formData, securityManager: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              placeholder="Enter contact number"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className={errors.contactNumber ? 'border-destructive' : ''}
            />
            {errors.contactNumber && (
              <p className="text-sm text-destructive">{errors.contactNumber}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active Account</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
