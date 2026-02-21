import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllHotels } from '@/lib/backend/hotels';
import { useCreateUser } from '@/lib/backend/users';
import { Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { UserRole } from '@/backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { data: hotels, isLoading: hotelsLoading } = useGetAllHotels();
  const createUser = useCreateUser();

  const [formData, setFormData] = useState({
    principal: '',
    name: '',
    username: '',
    hotelId: '',
    securityManager: '',
    contactNumber: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    console.log('[CreateUserDialog] Starting form validation with data:', formData);
    const newErrors: Record<string, string> = {};

    if (!formData.principal.trim()) {
      newErrors.principal = 'Principal is required';
    }

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
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[CreateUserDialog] Validation result:', isValid ? 'PASSED' : 'FAILED', newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CreateUserDialog] Form submitted');

    if (!validateForm()) {
      console.log('[CreateUserDialog] Validation failed, aborting submission');
      return;
    }

    try {
      const principal = Principal.fromText(formData.principal.trim());
      const hotelId = formData.hotelId ? BigInt(formData.hotelId) : null;
      const securityManager = formData.securityManager.trim() || null;
      const contactNumber = formData.contactNumber.trim() || null;

      const payload = {
        userPrincipal: principal,
        name: formData.name.trim(),
        username: formData.username.trim(),
        hotelId,
        securityManager,
        contactNumber,
        password: formData.password.trim(),
        role: formData.role === 'admin' ? UserRole.admin : UserRole.user,
      };

      console.log('[CreateUserDialog] Prepared payload for mutation:', {
        ...payload,
        password: '***REDACTED***',
        userPrincipal: payload.userPrincipal.toString(),
      });

      console.log('[CreateUserDialog] Triggering mutation...');
      createUser.mutate(payload, {
        onSuccess: () => {
          console.log('[CreateUserDialog] Mutation succeeded, resetting form and closing dialog');
          // Reset form and close dialog
          setFormData({
            principal: '',
            name: '',
            username: '',
            hotelId: '',
            securityManager: '',
            contactNumber: '',
            password: '',
            role: 'user',
          });
          setErrors({});
          onOpenChange(false);
        },
        onError: (error) => {
          console.error('[CreateUserDialog] Mutation failed with error:', error);
        },
      });
      console.log('[CreateUserDialog] Mutation triggered, isPending:', createUser.isPending);
    } catch (error) {
      console.error('[CreateUserDialog] Error preparing submission:', error);
      setErrors({ ...errors, principal: 'Error processing principal ID' });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('[CreateUserDialog] Dialog open state changing to:', newOpen);
    if (!newOpen && !createUser.isPending) {
      // Reset form when closing (only if not pending)
      setFormData({
        principal: '',
        name: '',
        username: '',
        hotelId: '',
        securityManager: '',
        contactNumber: '',
        password: '',
        role: 'user',
      });
      setErrors({});
      createUser.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay className="bg-black/60" />
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with hotel assignment and contact details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {createUser.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {createUser.error?.message || 'Failed to create user. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID *</Label>
            <Input
              id="principal"
              placeholder="Enter user's principal ID"
              value={formData.principal}
              onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
              className={errors.principal ? 'border-destructive' : ''}
              disabled={createUser.isPending}
            />
            {errors.principal && (
              <p className="text-sm text-destructive">{errors.principal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
              disabled={createUser.isPending}
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
              disabled={createUser.isPending}
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
              disabled={createUser.isPending}
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
              disabled={createUser.isPending}
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
                disabled={createUser.isPending}
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
              placeholder="Enter security manager name (optional)"
              value={formData.securityManager}
              onChange={(e) => setFormData({ ...formData, securityManager: e.target.value })}
              disabled={createUser.isPending}
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
              disabled={createUser.isPending}
            />
            {errors.contactNumber && (
              <p className="text-sm text-destructive">{errors.contactNumber}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending || hotelsLoading}>
              {createUser.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
