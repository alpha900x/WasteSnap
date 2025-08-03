import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void;
  preview?: string;
  onClearPhoto?: () => void;
}

export function PhotoCapture({ onPhotoCapture, preview, onClearPhoto }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            onPhotoCapture(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  }, [onPhotoCapture, stopCamera]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoCapture(file);
    }
  };

  if (preview) {
    return (
      <div className="relative">
        <img 
          src={preview} 
          alt="Preview" 
          className="w-full h-64 object-cover rounded-lg"
        />
        {onClearPhoto && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onClearPhoto}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  if (isStreaming) {
    return (
      <div className="space-y-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover rounded-lg bg-black"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3 justify-center">
          <Button onClick={capturePhoto} className="flex-1">
            <Camera className="w-4 h-4 mr-2" />
            Capture Photo
          </Button>
          <Button variant="outline" onClick={stopCamera}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-primary/30 dark:border-primary/50 rounded-xl p-8 text-center bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Camera className="text-primary w-8 h-8" />
      </div>
      <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        Open camera to take a photo
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Click to capture or drag and drop an image
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={startCamera}>
          <Camera className="w-4 h-4 mr-2" />
          Open Camera
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
