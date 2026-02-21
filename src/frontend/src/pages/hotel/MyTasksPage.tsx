import { useGetMyTasks } from '../../lib/backend/tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Loader2 } from 'lucide-react';

export default function MyTasksPage() {
  const { data: tasks, isLoading } = useGetMyTasks();

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
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">View and manage your assigned tasks</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>
            {tasks?.length || 0} task(s) assigned to you
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
              <p>No tasks assigned</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="max-w-md truncate">{task.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
