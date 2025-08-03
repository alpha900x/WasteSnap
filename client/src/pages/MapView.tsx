import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map } from '@/components/Map';
import { Report } from '@shared/schema';
import { Eye, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function MapView() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState(true);

  const { data: reports = [], isLoading } = useQuery<Report[]>({
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

  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === statusFilter);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Garbage Reports Map
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              View reported garbage locations and cleanup status across the city
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showHeatmap ? 'Hide' : 'Show'} Heatmap
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New Reports</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <Map reports={filteredReports} />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-sm font-semibold mb-3">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>New Report</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <Card className="min-w-[120px]">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-600 dark:text-red-400 w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.new}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">New Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[120px]">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600 dark:text-yellow-400 w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.in_progress}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[120px]">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-400 w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.resolved}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
