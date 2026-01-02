import { useState, useCallback } from 'react';
import { Upload, Film, X } from 'lucide-react';
import { Video } from '@/types/video';

interface VideoUploaderProps {
  onUpload: (video: Omit<Video, 'id' | 'uploadedAt'>) => void;
}

export const VideoUploader = ({ onUpload }: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione um arquivo de vídeo válido.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Create object URL for the video
    const url = URL.createObjectURL(file);

    // Get video duration
    const video = document.createElement('video');
    video.src = url;
    
    await new Promise<void>(resolve => {
      video.onloadedmetadata = () => resolve();
    });

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      onUpload({
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        duration: video.duration,
        size: file.size,
      });

      setIsUploading(false);
      setUploadProgress(0);
    }, 2500);
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="space-y-4">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="video-upload"
          disabled={isUploading}
        />
        <label htmlFor="video-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            {isUploading ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Film className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="w-full max-w-xs">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enviando... {uploadProgress}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center transition-all group-hover:bg-primary/20">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">Arraste um vídeo aqui</p>
                  <p className="text-sm text-muted-foreground">
                    ou clique para selecionar
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: MP4, WebM, MOV
                </p>
              </>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};
