import { Video } from '@/types/video';
import { Play, Trash2, Clock, HardDrive, Image, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoListProps {
  videos: Video[];
  currentVideoId: string | null;
  onSelect: (videoId: string) => void;
  onDelete: (videoId: string) => void;
}

const formatDuration = (seconds: number) => {
  if (seconds === 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatSize = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

export const VideoList = ({ videos, currentVideoId, onSelect, onDelete }: VideoListProps) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum vídeo disponível</p>
        <p className="text-sm">Faça upload de um vídeo para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {videos.map((video) => (
        <div
          key={video.id}
          className={`glass-panel p-4 flex items-center gap-4 transition-all duration-300 cursor-pointer hover:border-primary/50 ${
            currentVideoId === video.id ? 'border-primary bg-primary/10' : ''
          }`}
          onClick={() => onSelect(video.id)}
        >
          <div className="w-24 h-14 bg-secondary rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            ) : video.type === 'image' ? (
              <Image className="w-6 h-6 text-muted-foreground" />
            ) : (
              <Play className="w-6 h-6 text-muted-foreground" />
            )}
            {/* Type badge */}
            <span className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
              video.type === 'image' ? 'bg-blue-500/80 text-white' : 'bg-primary/80 text-white'
            }`}>
              {video.type === 'image' ? 'IMG' : 'VID'}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{video.title}</h4>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              {video.type === 'video' && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(video.duration)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {formatSize(video.size)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentVideoId === video.id && (
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                Ativo
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(video.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
