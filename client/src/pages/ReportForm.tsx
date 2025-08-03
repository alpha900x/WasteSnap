import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PhotoCapture } from '@/components/PhotoCapture';
import { Map } from '@/components/Map';
import { insertReportSchema, type InsertReportData } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { z } from 'zod';
import { Trash, Recycle, Leaf, AlertTriangle, MapPin } from 'lucide-react';

const wasteTypes = [
  { value: 'general', label: 'General Waste', icon: Trash },
  { value: 'recyclables', label: 'Recyclables', icon: Recycle },
  { value: 'organic', label: 'Organic', icon: Leaf },
  { value: 'hazardous', label: 'Hazardous', icon: AlertTriangle },
] as const;

export default function ReportForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<InsertReportData>({
    resolver: zodResolver(insertReportSchema.extend({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required")
    })),
    defaultValues: {
      title: '',
      description: '',
      wasteType: 'general',
      latitude: '0',
      longitude: '0',
      address: '',
    },
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setSelectedLocation(location);
          form.setValue('latitude', location.lat.toString());
          form.setValue('longitude', location.lng.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to NYC coordinates
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          setSelectedLocation(defaultLocation);
          form.setValue('latitude', defaultLocation.lat.toString());
          form.setValue('longitude', defaultLocation.lng.toString());
        }
      );
    }
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertReportData & { photo?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photo' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      if (data.photo) {
        formData.append('photo', data.photo);
      }

      const response = await apiRequest('POST', '/api/reports', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Report submitted successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/stats'] });
      navigate('/');
    },
    onError: (error) => {
      console.error('Report submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertReportData) => {
    if (!selectedLocation) {
      toast({
        title: 'Location Required',
        description: 'Please select a location on the map.',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({
      ...data,
      photo: selectedPhoto || undefined,
    });
  };

  const handlePhotoCapture = (file: File) => {
    setSelectedPhoto(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    form.setValue('latitude', lat.toString());
    form.setValue('longitude', lng.toString());
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Report Garbage</h2>
          <p className="text-slate-600 dark:text-slate-400">Take a photo to report garbage in your area</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <Card>
              <CardContent className="p-6">
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                  Photo Evidence
                </FormLabel>
                <PhotoCapture
                  onPhotoCapture={handlePhotoCapture}
                  preview={photoPreview || undefined}
                  onClearPhoto={handleClearPhoto}
                />
              </CardContent>
            </Card>

            {/* Location Selection */}
            <Card>
              <CardContent className="p-6">
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                  Location
                </FormLabel>
                <div className="h-64 mb-4 rounded-lg overflow-hidden">
                  <Map
                    reports={[]}
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation || undefined}
                    height="100%"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {selectedLocation 
                      ? `Location: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
                      : 'Click on the map to select location'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Report Form */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of the issue"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the garbage location or contents..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Street address or landmark"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wasteType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Type</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {wasteTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <Button
                              key={type.value}
                              type="button"
                              variant={field.value === type.value ? "default" : "outline"}
                              className={`p-4 h-auto flex-col space-y-2 ${
                                field.value === type.value
                                  ? 'bg-primary text-primary-foreground'
                                  : ''
                              }`}
                              onClick={() => field.onChange(type.value)}
                            >
                              <Icon className="w-6 h-6" />
                              <span className="text-sm font-medium">{type.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
