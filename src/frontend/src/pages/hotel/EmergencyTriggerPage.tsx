import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../lib/auth/useAuth';
import { useSubmitEmergency } from '../../lib/backend/emergencies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EmergencyTriggerPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: submitEmergency, isPending } = useSubmitEmergency();

  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [details, setDetails] = useState('');

  const categories = [
    'Fire',
    'Medical Emergency',
    'Security Threat',
    'Natural Disaster',
    'Power Outage',
    'Water Damage',
    'Guest Safety',
    'Staff Safety',
    'Other',
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-yellow-600' },
    { value: 'medium', label: 'Medium', color: 'text-orange-600' },
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-800' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !severity || !details.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!userProfile?.hotelId) {
      toast.error('Hotel assignment not found. Please contact administrator.');
      return;
    }

    submitEmergency(
      {
        category,
        severity,
        details: details.trim(),
        hotelId: userProfile.hotelId,
      },
      {
        onSuccess: () => {
          toast.success('Emergency alert submitted successfully');
          setCategory('');
          setSeverity('');
          setDetails('');
          navigate({ to: '/hotel' });
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to submit emergency alert');
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Emergency Alert</h1>
          <p className="text-muted-foreground">Report urgent situations requiring immediate attention</p>
        </div>
      </div>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader className="bg-red-50 dark:bg-red-950/20">
          <CardTitle className="text-red-900 dark:text-red-100">Submit Emergency Notification</CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            This will trigger immediate notifications to emergency response contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Emergency Category *</Label>
              <Select value={category} onValueChange={setCategory} disabled={isPending}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level *</Label>
              <Select value={severity} onValueChange={setSeverity} disabled={isPending}>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <span className={level.color}>{level.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Emergency Details *</Label>
              <Textarea
                id="details"
                placeholder="Provide detailed information about the emergency situation..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={isPending}
                rows={6}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Emergency Alert
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/hotel' })}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
