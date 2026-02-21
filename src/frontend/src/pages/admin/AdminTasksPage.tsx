import { useState } from 'react';
import { useGetAllTasks } from '../../lib/backend/tasks';
import { useGetAllHotels } from '../../lib/backend/hotels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Loader2, Plus } from 'lucide-react';
import { CreateTaskDialog } from '@/components/admin/CreateTaskDialog';

export default function AdminTasksPage() {
  const { data: tasks, isLoading } = useGetAllTasks();
  const { data: hotels } = useGetAllHotels();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'open':
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getHotelNames = (hotelIds: bigint[]) => {
    if (!hotels || hotelIds.length === 0) return '-';
    
    const hotelNames = hotelIds
      .map((id) => {
        const hotel = hotels.find((h) => h.id === id);
        return hotel ? hotel.name : `Hotel ${id}`;
      })
      .join(', ');
    
    return hotelNames;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage and assign tasks across hotels</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            {tasks?.length || 0} task(s) in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks created</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assigned Hotels</TableHead>
                    <TableHead>Assigned Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={getHotelNames(task.hotelIds)}>
                          {getHotelNames(task.hotelIds)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {task.assignedUsers.length} user(s)
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
