import { useState } from 'react';
import { useGetAllEmergencies } from '../../lib/backend/emergencies';
import { useGetAllHotels } from '../../lib/backend/hotels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminEmergencyLogPage() {
  const { data: emergencies, isLoading } = useGetAllEmergencies();
  const { data: hotels } = useGetAllHotels();

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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getHotelName = (hotelId: bigint) => {
    const hotel = hotels?.find((h) => h.id === hotelId);
    return hotel?.name || `Hotel ${hotelId}`;
  };

  const filteredEmergencies = emergencies?.filter((emergency) => {
    if (selectedHotel === 'all') return true;
    return emergency.hotelId.toString() === selectedHotel;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Emergency Log</h1>
          <p className="text-muted-foreground">View all emergency alerts across the hotel network</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Emergency Events</CardTitle>
              <CardDescription>
                {filteredEmergencies?.length || 0} emergency alert(s) recorded
              </CardDescription>
            </div>
            <div className="w-64">
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
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
          ) : !filteredEmergencies || filteredEmergencies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No emergency alerts recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmergencies.map((emergency) => (
                    <TableRow key={emergency.id}>
                      <TableCell className="font-medium">{formatDate(emergency.timestamp)}</TableCell>
                      <TableCell>{getHotelName(emergency.hotelId)}</TableCell>
                      <TableCell>{emergency.category}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(emergency.severity)}>
                          {emergency.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{emergency.details}</TableCell>
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
