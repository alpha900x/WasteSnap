import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Report } from '@shared/schema';
import { Calendar, MapPin, ChevronRight, ClipboardList, Plus } from 'lucide-react';
import { Link } from 'wouter';

const statusColors = {
  new: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
};

const statusLabels = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function MyReports() {

  // 🔐 OPTIONAL: protect page (redirect if not logged in)
  useEffect(() => {
    fetch('/api/auth/user', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);
const handleLogout = async () => {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed', error);
  }
};
  // 📡 Fetch only logged-in user's reports
  const { data: reports = [], isLoading, isError } = useQuery<Report[]>({
    queryKey: ['/api/reports?mine=true'],
    queryFn: async () => {
      const res = await fetch('/api/reports?mine=true', {
        credentials: 'include', // 🔥 REQUIRED for session
      });

      if (!res.ok) {
        throw new Error('Failed to fetch reports');
      }

      return res.json();
    },
  });

  // ⏳ Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-lg bg-slate-200 dark:bg-slate-700 h-16 w-16"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ❌ Error state
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load reports. Please try again.
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            My Reports
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Track the status of your submitted reports
          </p>
          <Button variant="outline" onClick={handleLogout}>
  Logout
</Button>
        </div>

        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">

                    {/* LEFT SIDE */}
                    <div className="flex space-x-4">
                      {report.photoUrl ? (
                        <img
                          src={report.photoUrl}
                          alt="Report"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <ClipboardList className="w-8 h-8 text-slate-400" />
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {report.title}
                        </h3>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {report.description}
                        </p>

                        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(report.createdAt!).toLocaleDateString()}
                            </span>
                          </span>

                          {report.address && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{report.address}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center space-x-3">
                      <Badge className={statusColors[report.status]}>
                        {statusLabels[report.status]}
                      </Badge>

                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="text-slate-400 w-8 h-8" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No reports yet
                </h3>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start by reporting garbage in your area
                </p>

                <Button asChild>
                  <Link href="/report">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
