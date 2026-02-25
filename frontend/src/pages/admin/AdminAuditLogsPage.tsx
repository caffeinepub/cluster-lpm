import { useState } from 'react';
import { useGetAuditLogs } from '../../lib/backend/audit';
import { useGetAllHotels } from '../../lib/backend/hotels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Loader2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { data: logs, isLoading } = useGetAuditLogs();
  const { data: hotels } = useGetAllHotels();

  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedHotel, setSelectedHotel] = useState<string>('all');

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

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  };

  const getHotelName = (hotelId: bigint) => {
    const hotel = hotels?.find((h) => h.id === hotelId);
    return hotel?.name || `Hotel ${hotelId}`;
  };

  const actionTypes = Array.from(new Set(logs?.map((log) => log.action) || []));

  const filteredLogs = logs?.filter((log) => {
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    if (selectedHotel !== 'all') {
      if (!log.hotelId) return false;
      if (log.hotelId.toString() !== selectedHotel) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and user actions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Activity Log</CardTitle>
              <CardDescription>
                {filteredLogs?.length || 0} log entr{filteredLogs?.length === 1 ? 'y' : 'ies'}
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="w-48">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredLogs || filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{formatDate(log.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatPrincipal(log.actorPrincipal.toString())}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        {log.hotelId ? getHotelName(log.hotelId) : '-'}
                      </TableCell>
                      <TableCell className="max-w-md truncate">{log.details}</TableCell>
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
