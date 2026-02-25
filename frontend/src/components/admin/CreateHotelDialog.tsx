import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateHotel } from '@/lib/backend/admin';
import { Loader2 } from 'lucide-react';

interface CreateHotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHotelDialog({ open, onOpenChange }: CreateHotelDialogProps) {
  const createHotel = useCreateHotel();
  const [hotelName, setHotelName] = useState('');
  const [error, setError] = useState('');

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
      await createHotel.mutateAsync({
        name: hotelName.trim(),
      });

      // Reset form and close dialog
      setHotelName('');
      setError('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create hotel:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setHotelName('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Add New Hotel</DialogTitle>
          <DialogDescription>
            Create a new hotel property in the cluster.
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createHotel.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createHotel.isPending}>
              {createHotel.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Hotel'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
