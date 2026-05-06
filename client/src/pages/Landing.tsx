import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Map, Users, BarChart3 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Camera className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            WasteSnap
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Civic Reporting Platform for a Cleaner Community
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Report garbage, track cleanup progress, and help make your city cleaner. 
            Take photos, pin locations, and collaborate with your community and local authorities.
          </p>
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <a href="/">
              Get Started
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
  <a href="/admin-login">
    Admin Login
  </a>
</Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Camera className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Photo Reports
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Capture garbage with your camera and create detailed reports
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Map className="text-green-600 dark:text-green-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Location Mapping
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pin exact locations and view reports on an interactive map
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Community Driven
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Connect with your community to tackle waste issues together
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-purple-600 dark:text-purple-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Monitor cleanup progress and see the impact of your reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Join our community of civic-minded citizens working together to keep our neighborhoods clean.
              </p>
              <Button size="lg" asChild>
                <a href="/">
                  Start Reporting Today
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
