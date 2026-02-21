import { useGetMyDailyReports } from '../../lib/backend/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';

export default function MyDailyReportsPage() {
  const { data: reports, isLoading } = useGetMyDailyReports();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">My Daily Reports</h1>
          <p className="text-muted-foreground">View your submitted operational reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>
            All reports you have submitted, showing operational metrics and timestamps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Occupancy</TableHead>
                    <TableHead className="text-right">VIP Arrivals</TableHead>
                    <TableHead className="text-right">Guest Incidents</TableHead>
                    <TableHead className="text-right">Staff Incidents</TableHead>
                    <TableHead className="text-right">Guest Complaints</TableHead>
                    <TableHead className="text-right">Guest Injuries</TableHead>
                    <TableHead className="text-right">Staff Injuries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{formatDate(report.timestamp)}</TableCell>
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
