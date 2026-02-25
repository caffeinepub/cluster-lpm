import { useState, useEffect } from 'react';
import { useCreateUser } from '../../lib/backend/users';
import { useGetAllHotels } from '../../lib/backend/hotels';
import { UserRole } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const NO_HOTEL_VALUE = 'none';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getDefaultFormState() {
  return {
    name: '',
    username: '',
    password: '',
    userId: '',
    hotelId: NO_HOTEL_VALUE,
    securityManager: '',
    contactNumber: '',
  };
}

export default function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [hotelId, setHotelId] = useState<string>(NO_HOTEL_VALUE);
  const [securityManager, setSecurityManager] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const { data: hotels = [] } = useGetAllHotels();
  const createUserMutation = useCreateUser();

  // Reset all form fields whenever the dialog opens (fresh state every time)
  useEffect(() => {
    if (open) {
      const defaults = getDefaultFormState();
      setName(defaults.name);
      setUsername(defaults.username);
      setPassword(defaults.password);
      setUserId(defaults.userId);
      setHotelId(defaults.hotelId);
      setSecurityManager(defaults.securityManager);
      setContactNumber(defaults.contactNumber);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !username.trim() || !password.trim() || !userId.trim()) {
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        userId: userId.trim(),
        name: name.trim(),
        username: username.trim(),
        hotelId: hotelId && hotelId !== NO_HOTEL_VALUE ? BigInt(hotelId) : null,
        securityManager: securityManager.trim() || null,
        contactNumber: contactNumber.trim() || null,
        password: password.trim(),
        role: UserRole.user,
      });

      // Reset form and close dialog on success
      const defaults = getDefaultFormState();
      setName(defaults.name);
      setUsername(defaults.username);
      setPassword(defaults.password);
      setUserId(defaults.userId);
      setHotelId(defaults.hotelId);
      setSecurityManager(defaults.securityManager);
      setContactNumber(defaults.contactNumber);

      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback (toast notification)
      // Keep form populated so user can correct the input
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. All users are created with the 'user' role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="unique-user-id"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotel">Hotel Assignment</Label>
              <Select value={hotelId} onValueChange={setHotelId}>
                <SelectTrigger id="hotel">
                  <SelectValue placeholder="Select a hotel (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_HOTEL_VALUE}>None</SelectItem>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id.toString()} value={hotel.id.toString()}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="securityManager">Security Manager</Label>
              <Input
                id="securityManager"
                value={securityManager}
                onChange={(e) => setSecurityManager(e.target.value)}
                placeholder="Manager name (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+1234567890 (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
