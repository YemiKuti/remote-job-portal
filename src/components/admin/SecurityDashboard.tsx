
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Eye, Download, Trash2 } from 'lucide-react';
import { getSecurityLogs, clearSecurityLogs, SecurityEvent } from '@/utils/securityLogger';
import { useToast } from '@/hooks/use-toast';

const SecurityDashboard = () => {
  const [logs, setLogs] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityLogs();
  }, []);

  const loadSecurityLogs = async () => {
    try {
      setLoading(true);
      const securityLogs = await getSecurityLogs();
      setLogs(securityLogs);
    } catch (error) {
      console.error('Error loading security logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearSecurityLogs();
      setLogs([]);
      toast({
        title: 'Success',
        description: 'Security logs cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear security logs',
        variant: 'destructive'
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[severity] || colors.medium}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'admin_login':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'data_access':
        return <Eye className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const criticalEvents = logs.filter(log => log.severity === 'critical').length;
  const highEvents = logs.filter(log => log.severity === 'high').length;
  const recentEvents = logs.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor system security events and activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSecurityLogs}>
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highEvents}</div>
            <p className="text-xs text-muted-foreground">Elevated security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">All logged events</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security activities and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading security logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No security events recorded
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-2">
                      {getEventIcon(log.event_type)}
                      <span className="font-medium">{log.event_type.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>{log.event_type}</TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.user_id ? log.user_id.substring(0, 8) + '...' : 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : 'No details'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date().toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
