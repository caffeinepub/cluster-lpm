import { useState } from 'react';
import { useGetAllHotels } from '../../lib/backend/hotels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { CreateHotelDialog } from '@/components/admin/CreateHotelDialog';
import { EditHotelDialog } from '@/components/admin/EditHotelDialog';
import { DeleteHotelDialog } from '@/components/admin/DeleteHotelDialog';
import type { Hotel } from '@/backend';

export default function AdminHotelsPage() {
  const { data: hotels, isLoading } = useGetAllHotels();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [deletingHotel, setDeletingHotel] = useState<{ id: bigint; name: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Hotels</h1>
            <p className="text-muted-foreground">Manage hotel properties in the cluster</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Hotel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Properties</CardTitle>
          <CardDescription>
            {hotels?.length || 0} hotel(s) in the cluster
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !hotels || hotels.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hotels configured</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id.toString()}>
                    <TableCell className="font-medium">{hotel.id.toString()}</TableCell>
                    <TableCell>{hotel.name}</TableCell>
                    <TableCell>
                      <Badge variant={hotel.isActive ? 'default' : 'secondary'}>
                        {hotel.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingHotel(hotel)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingHotel({ id: hotel.id, name: hotel.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateHotelDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />

      {editingHotel && (
        <EditHotelDialog
          open={!!editingHotel}
          onOpenChange={(open) => !open && setEditingHotel(null)}
          hotel={editingHotel}
        />
      )}

      {deletingHotel && (
        <DeleteHotelDialog
          open={!!deletingHotel}
          onOpenChange={(open) => !open && setDeletingHotel(null)}
          hotelId={deletingHotel.id}
          hotelName={deletingHotel.name}
        />
      )}
    </div>
  );
}
