import { useState, useMemo } from 'react';
import { useGetAllDailyReports } from '../../lib/backend/reports';
import { useGetAllHotels } from '../../lib/backend/hotels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { FileText, Loader2, Download, AlertCircle } from 'lucide-react';

export default function AdminReportsDashboardPage() {
  const { data: reports, isLoading } = useGetAllDailyReports();
  const { data: hotels } = useGetAllHotels();

  const [selectedHotel, setSelectedHotel] = useState<string>('all');

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getHotelName = (hotelId: bigint) => {
    const hotel = hotels?.find((h) => h.id === hotelId);
    return hotel?.name || `Hotel ${hotelId}`;
  };

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (selectedHotel === 'all') return reports;
    return reports.filter((report: any) => report.hotelId.toString() === selectedHotel);
  }, [reports, selectedHotel]);

  const exportToCSV = () => {
    if (!filteredReports || filteredReports.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Hotel',
      'Occupancy',
      'VIP Arrivals',
      'Guest Incidents',
      'Staff Incidents',
      'Guest Complaints',
      'Guest Injuries',
      'Staff Injuries',
    ];

    const rows = filteredReports.map((report: any) => [
      formatDate(report.timestamp),
      getHotelName(report.hotelId),
      report.occupancy.toString(),
      report.vipArrivals.toString(),
      report.guestIncidents.toString(),
      report.staffIncidents.toString(),
      report.guestComplaints.toString(),
      report.guestInjuries.toString(),
      report.staffInjuries.toString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-reports-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Reports Dashboard</h1>
          <p className="text-muted-foreground">View and export daily operational reports</p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Daily reports functionality is not yet implemented in the backend. This feature will be available soon.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Reports</CardTitle>
              <CardDescription>
                {filteredReports?.length || 0} report(s) available
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Select value={selectedHotel} onValueChange={setSelectedHotel} disabled>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by hotel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hotels</SelectItem>
                  {hotels?.map((hotel) => (
                    <SelectItem key={hotel.id.toString()} value={hotel.id.toString()}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline" disabled>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredReports || filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead className="text-right">Occupancy</TableHead>
                    <TableHead className="text-right">VIP Arrivals</TableHead>
                    <TableHead className="text-right">Guest Incidents</TableHead>
                    <TableHead className="text-right">Staff Incidents</TableHead>
                    <TableHead className="text-right">Complaints</TableHead>
                    <TableHead className="text-right">Guest Injuries</TableHead>
                    <TableHead className="text-right">Staff Injuries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{formatDate(report.timestamp)}</TableCell>
                      <TableCell>{getHotelName(report.hotelId)}</TableCell>
                      <TableCell className="text-right">{report.occupancy.toString()}</TableCell>
                      <TableCell className="text-right">{report.vipArrivals.toString()}</TableCell>
                      <TableCell className="text-right">
                        {report.guestIncidents > 0n ? (
                          <Badge variant="destructive">{report.guestIncidents.toString()}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.staffIncidents > 0n ? (
                          <Badge variant="destructive">{report.staffIncidents.toString()}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.guestComplaints > 0n ? (
                          <Badge variant="outline">{report.guestComplaints.toString()}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.guestInjuries > 0n ? (
                          <Badge variant="destructive">{report.guestInjuries.toString()}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.staffInjuries > 0n ? (
                          <Badge variant="destructive">{report.staffInjuries.toString()}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
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
