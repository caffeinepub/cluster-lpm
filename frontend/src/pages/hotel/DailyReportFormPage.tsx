import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../lib/auth/useAuth';
import { useSaveDailyReport } from '../../lib/backend/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';

export default function DailyReportFormPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: saveReport, isPending } = useSaveDailyReport();

  const [formData, setFormData] = useState({
    occupancy: '',
    vipArrivals: '',
    guestIncidents: '',
    staffIncidents: '',
    guestComplaints: '',
    guestInjuries: '',
    staffInjuries: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.hotelId) {
      toast.error('Hotel assignment not found. Please contact administrator.');
      return;
    }

    const numericData = {
      hotelId: userProfile.hotelId,
      occupancy: BigInt(formData.occupancy || '0'),
      vipArrivals: BigInt(formData.vipArrivals || '0'),
      guestIncidents: BigInt(formData.guestIncidents || '0'),
      staffIncidents: BigInt(formData.staffIncidents || '0'),
      guestComplaints: BigInt(formData.guestComplaints || '0'),
      guestInjuries: BigInt(formData.guestInjuries || '0'),
      staffInjuries: BigInt(formData.staffInjuries || '0'),
    };

    saveReport(numericData, {
      onSuccess: () => {
        toast.success('Daily report submitted successfully');
        setFormData({
          occupancy: '',
          vipArrivals: '',
          guestIncidents: '',
          staffIncidents: '',
          guestComplaints: '',
          guestInjuries: '',
          staffInjuries: '',
        });
        navigate({ to: '/hotel/my-reports' });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit report');
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Submit Daily Report</h1>
          <p className="text-muted-foreground">Record today's operational metrics</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Operations Report</CardTitle>
          <CardDescription>
            Enter all numeric values for today's operations. All fields are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupancy">Occupancy</Label>
                <Input
                  id="occupancy"
                  type="number"
                  min="0"
                  placeholder="Number of occupied rooms"
                  value={formData.occupancy}
                  onChange={(e) => handleChange('occupancy', e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vipArrivals">VIP Arrivals</Label>
                <Input
                  id="vipArrivals"
                  type="number"
                  min="0"
                  placeholder="Number of VIP guests"
                  value={formData.vipArrivals}
                  onChange={(e) => handleChange('vipArrivals', e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestIncidents">Guest Incidents</Label>
                <Input
                  id="guestIncidents"
                  type="number"
                  min="0"
                  placeholder="Number of guest incidents"
                  value={formData.guestIncidents}
                  onChange={(e) => handleChange('guestIncidents', e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffIncidents">Staff Incidents</Label>
                <Input
                  id="staffIncidents"
                  type="number"
                  min="0"
                  placeholder="Number of staff incidents"
                  value={formData.staffIncidents}
                  onChange={(e) => handleChange('staffIncidents', e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestComplaints">Guest Complaints</Label>
                <Input
                  id="guestComplaints"
                  type="number"
                  min="0"
                  placeholder="Number of guest complaints"
                  value={formData.guestComplaints}
                  onChange={(e) => handleChange('guestComplaints', e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestInjuries">Guest Injuries</Label>
                <Input
                  id="guestInjuries"
                  type="number"
                  min="0"
                  placeholder="Number of guest injuries"
                  value={formData.guestInjuries}
                  onChange={(e) => handleChange('guestInjuries', e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffInjuries">Staff Injuries</Label>
                <Input
                  id="staffInjuries"
                  type="number"
                  min="0"
                  placeholder="Number of staff injuries"
                  value={formData.staffInjuries}
                  onChange={(e) => handleChange('staffInjuries', e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Report
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
