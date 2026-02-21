import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteUser } from '@/lib/backend/users';
import { Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPrincipal: Principal;
  userName: string;
}

export function DeleteUserDialog({ open, onOpenChange, userPrincipal, userName }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(userPrincipal);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete user <strong>{userName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUser.isPending ? (
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
