import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUpdateHotel } from '@/lib/backend/admin';
import { Loader2 } from 'lucide-react';
import type { Hotel } from '@/backend';

interface EditHotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: Hotel;
}

export function EditHotelDialog({ open, onOpenChange, hotel }: EditHotelDialogProps) {
  const updateHotel = useUpdateHotel();
  const [hotelName, setHotelName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  // Pre-populate form when dialog opens or hotel data changes
  useEffect(() => {
    if (open && hotel) {
      setHotelName(hotel.name);
      setIsActive(hotel.isActive);
      setError('');
    }
  }, [open, hotel]);

  const validateForm = () => {
    if (!hotelName.trim()) {
      setError('Hotel name is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateHotel.mutateAsync({
        hotelId: hotel.id,
        name: hotelName.trim(),
        isActive,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update hotel:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Edit Hotel</DialogTitle>
          <DialogDescription>
            Update hotel property details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hotelName">Hotel Name *</Label>
            <Input
              id="hotelName"
              placeholder="Enter hotel name"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active Hotel</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateHotel.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateHotel.isPending}>
              {updateHotel.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Hotel'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
