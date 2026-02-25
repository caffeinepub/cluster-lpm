import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetAllHotels } from '@/lib/backend/hotels';
import { useCreateTask } from '@/lib/backend/tasks';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { data: hotels, isLoading: hotelsLoading } = useGetAllHotels();
  const createTask = useCreateTask();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    dueDate: '',
    selectedHotels: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.selectedHotels.length === 0) {
      newErrors.selectedHotels = 'At least one hotel must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHotelToggle = (hotelId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedHotels: prev.selectedHotels.includes(hotelId)
        ? prev.selectedHotels.filter((id) => id !== hotelId)
        : [...prev.selectedHotels, hotelId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Convert date to nanoseconds timestamp
      const dueDateMs = new Date(formData.dueDate).getTime();
      const dueDateNs = BigInt(dueDateMs) * BigInt(1_000_000);

      const hotelIds = formData.selectedHotels.map((id) => BigInt(id));

      await createTask.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: dueDateNs,
        priority: formData.priority,
        hotelIds,
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        priority: '',
        dueDate: '',
        selectedHotels: [],
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        title: '',
        description: '',
        priority: '',
        dueDate: '',
        selectedHotels: [],
      });
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  const activeHotels = hotels?.filter((h) => h.isActive) || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create a task and assign it to one or multiple hotels. The task will be automatically assigned to all users of the selected hotels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className={errors.priority ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-destructive">{errors.priority}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className={errors.dueDate ? 'border-destructive' : ''}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assign to Hotels *</Label>
            {hotelsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading hotels...
              </div>
            ) : (
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-3">
                  {activeHotels.map((hotel) => (
                    <div key={hotel.id.toString()} className="flex items-center space-x-2">
                      <Checkbox
                        id={`hotel-${hotel.id}`}
                        checked={formData.selectedHotels.includes(hotel.id.toString())}
                        onCheckedChange={() => handleHotelToggle(hotel.id.toString())}
                      />
                      <Label
                        htmlFor={`hotel-${hotel.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {hotel.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {errors.selectedHotels && (
              <p className="text-sm text-destructive">{errors.selectedHotels}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createTask.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
