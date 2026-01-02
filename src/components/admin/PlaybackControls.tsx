import { Play, Pause, Square, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { PlaybackState, Video } from '@/types/video';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  currentVideo: Video | null;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlaybackControls = ({
  playbackState,
  currentVideo,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: PlaybackControlsProps) => {
  const progress = currentVideo 
    ? (playbackState.currentTime / currentVideo.duration) * 100 
    : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentVideo) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * currentVideo.duration;
    onSeek(time);
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Controles de Reprodução</h3>
        {playbackState.isPlaying && (
          <span className="flex items-center gap-2 text-sm text-success">
            <span className="status-indicator connected" />
            Reproduzindo
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div 
          className="progress-bar h-2 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{formatTime(playbackState.currentTime)}</span>
          <span>{currentVideo ? formatTime(currentVideo.duration) : '0:00'}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          className="control-button w-12 h-12"
          onClick={() => onSeek(Math.max(0, playbackState.currentTime - 10))}
          disabled={!currentVideo}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {playbackState.isPlaying ? (
          <button
            className="control-button w-16 h-16 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onPause}
            disabled={!currentVideo}
          >
            <Pause className="w-7 h-7" />
          </button>
        ) : (
          <button
            className="control-button w-16 h-16 bg-primary text-primary-foreground hover:bg-primary/90 glow-button"
            onClick={onPlay}
            disabled={!currentVideo}
          >
            <Play className="w-7 h-7 ml-1" />
          </button>
        )}

        <button
          className="control-button w-12 h-12"
          onClick={() => currentVideo && onSeek(Math.min(currentVideo.duration, playbackState.currentTime + 10))}
          disabled={!currentVideo}
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          className="control-button w-12 h-12 hover:bg-destructive hover:text-destructive-foreground"
          onClick={onStop}
          disabled={!currentVideo}
        >
          <Square className="w-5 h-5" />
        </button>
      </div>

      {/* Current video info */}
      {currentVideo && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Reproduzindo agora:</p>
          <p className="font-medium truncate">{currentVideo.title}</p>
        </div>
      )}

      {!currentVideo && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Selecione um vídeo para iniciar</p>
        </div>
      )}
    </div>
  );
};
