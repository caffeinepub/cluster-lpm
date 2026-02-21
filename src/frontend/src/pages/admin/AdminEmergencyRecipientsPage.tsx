import { useState } from 'react';
import {
  useEmergencyRecipients,
  useAddEmergencyRecipient,
  useRemoveEmergencyRecipient,
} from '../../lib/backend/emergencies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Phone, Loader2, Trash2, Plus } from 'lucide-react';

export default function AdminEmergencyRecipientsPage() {
  const { data: recipients, isLoading } = useEmergencyRecipients();
  const { mutate: addRecipient, isPending: isAdding } = useAddEmergencyRecipient();
  const { mutate: removeRecipient, isPending: isRemoving } = useRemoveEmergencyRecipient();

  const [newContact, setNewContact] = useState('');

  const handleAdd = () => {
    if (!newContact.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    addRecipient(newContact.trim(), {
      onSuccess: () => {
        toast.success('Emergency recipient added');
        setNewContact('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add recipient');
      },
    });
  };

  const handleRemove = (contact: string) => {
    removeRecipient(contact, {
      onSuccess: () => {
        toast.success('Emergency recipient removed');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove recipient');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <Phone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Emergency Recipients</h1>
          <p className="text-muted-foreground">Manage SMS notification contacts for emergency alerts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Recipient</CardTitle>
          <CardDescription>
            Add phone numbers to receive SMS notifications when emergencies are reported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="contact">Phone Number</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="+1234567890"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                disabled={isAdding}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={isAdding}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Recipients</CardTitle>
          <CardDescription>
            {recipients?.length || 0} contact(s) configured for emergency notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !recipients || recipients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No emergency recipients configured</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((contact) => (
                  <TableRow key={contact}>
                    <TableCell className="font-medium">{contact}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(contact)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
