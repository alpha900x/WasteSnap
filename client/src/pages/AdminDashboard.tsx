import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Report } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Calendar, 
  Download, 
  Eye, 
  Check,
  ClipboardList
} from 'lucide-react';

const statusColors = {
  new: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
};

const wasteTypeColors = {
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  recyclables: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  organic: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  hazardous: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
const [wasteFilter, setWasteFilter] = useState('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Access Required",
        description: "Please log in to access the admin dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
  });

  const { data: stats } = useQuery<{
    new: number;
    in_progress: number;
    resolved: number;
    total: number;
  }>({
    queryKey: ['/api/reports/stats'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/reports/${reportId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Report status updated successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/stats'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to update report status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (reportId: string, status: string) => {
    updateStatusMutation.mutate({ reportId, status });
  };

  const avgResolutionTime = stats ? (stats.total > 0 ? 3.2 : 0) : 0;
  const filteredReports = reports.filter((report) => {
  const statusMatch =
    statusFilter === 'all' || report.status === statusFilter;

  const wasteMatch =
    wasteFilter === 'all' || report.wasteType === wasteFilter;

  return statusMatch && wasteMatch;
});
  if (reportsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400">Manage and respond to community reports</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage and respond to community reports</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-600 dark:text-red-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.new || 0}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">New Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.in_progress || 0}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats?.resolved || 0}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {avgResolutionTime.toFixed(1)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Reports</h3>
              <div className="flex space-x-3">
  {/* Status Filter */}
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-32">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      <SelectItem value="new">New</SelectItem>
      <SelectItem value="in_progress">In Progress</SelectItem>
      <SelectItem value="resolved">Resolved</SelectItem>
    </SelectContent>
  </Select>

  {/* Waste Type Filter */}
  <Select value={wasteFilter} onValueChange={setWasteFilter}>
    <SelectTrigger className="w-36">
      <SelectValue placeholder="Waste Type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Types</SelectItem>
      <SelectItem value="general">General</SelectItem>
      <SelectItem value="recyclables">Recyclables</SelectItem>
      <SelectItem value="organic">Organic</SelectItem>
      <SelectItem value="hazardous">Hazardous</SelectItem>
    </SelectContent>
  </Select>

  <Button variant="outline" size="sm">
    <Download className="w-4 h-4 mr-2" />
    Export
  </Button>
</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {reports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {report.photoUrl ? (
                            <img
                              src={report.photoUrl}
                              alt="Report"
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                              <ClipboardList className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {report.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {report.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900 dark:text-white">
                        {report.address || `${parseFloat(report.latitude).toFixed(4)}, ${parseFloat(report.longitude).toFixed(4)}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={wasteTypeColors[report.wasteType]}>
                          {report.wasteType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={report.status}
                          onValueChange={(value) => handleStatusChange(report.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(report.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(report.id, 'resolved')}
                            disabled={report.status === 'resolved'}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No reports yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Reports will appear here once users start submitting them.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
