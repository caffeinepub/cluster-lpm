import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteHotel } from '@/lib/backend/admin';
import { Loader2 } from 'lucide-react';

interface DeleteHotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: bigint;
  hotelName: string;
}

export function DeleteHotelDialog({ open, onOpenChange, hotelId, hotelName }: DeleteHotelDialogProps) {
  const deleteHotel = useDeleteHotel();

  const handleDelete = async () => {
    try {
      await deleteHotel.mutateAsync(hotelId);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete hotel:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Hotel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete hotel <strong>{hotelName}</strong>? This action cannot be undone. 
            Note: You cannot delete a hotel if users are assigned to it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteHotel.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteHotel.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteHotel.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
