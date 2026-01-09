import { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, Wifi, WifiOff, Volume2, VolumeX, CloudOff, Image } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { VideoPlayer, VideoPlayerRef } from '@/components/VideoPlayer';

const VRPlayer = () => {
  const { playbackState, videos, isConnected, isOnline } = useRealtimeSync(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VideoPlayerRef>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  const currentVideo = videos.find(v => v.id === playbackState.videoId) || null;

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      
      hideControlsTimeout.current = setTimeout(() => {
        if (playbackState.isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [playbackState.isPlaying]);

  // Fullscreen handlers
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentVideo && currentVideo.type === 'video' && currentVideo.duration > 0
    ? (playbackState.currentTime / currentVideo.duration) * 100 
    : 0;

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden"
    >
      {/* Connection status */}
      <div 
        className={`absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm transition-all duration-500 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {!isOnline && (
          <div className="flex items-center gap-2 mr-2 pr-2 border-r border-white/20">
            <CloudOff className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning">Local</span>
          </div>
        )}
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-success" />
            <span className="text-sm text-white">Sincronizado</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-white">Conectando...</span>
          </>
        )}
      </div>

      {/* Video/Image player */}
      {currentVideo ? (
        <div className="w-full h-full">
          {currentVideo.type === 'image' ? (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={currentVideo.url} 
                alt={currentVideo.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <VideoPlayer
              ref={playerRef}
              url={currentVideo.url}
              playbackState={playbackState}
              isAdmin={false}
              isMuted={isMuted}
            />
          )}
        </div>
      ) : (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center animate-float">
            <Wifi className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CortexVr</h1>
          <p className="text-muted-foreground text-lg">
            Aguardando seleção de conteúdo...
          </p>
          <p className="text-muted-foreground text-sm mt-4">
            O administrador controla a reprodução
          </p>
          {!isOnline && (
            <p className="text-warning text-sm mt-2">
              Modo offline - sincronização local ativa
            </p>
          )}
        </div>
      )}

      {/* Bottom controls overlay */}
      {currentVideo && (
        <div 
          className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-all duration-500 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Progress bar (only for videos) */}
          {currentVideo.type === 'video' && (
            <div className="mb-4">
              <div className="progress-bar h-1">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/70 font-mono mt-2">
                <span>{formatTime(playbackState.currentTime)}</span>
                <span>{formatTime(currentVideo.duration)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                {currentVideo.type === 'image' && (
                  <Image className="w-4 h-4 text-blue-400" />
                )}
                <h2 className="text-white font-semibold">{currentVideo.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                {currentVideo.type === 'video' ? (
                  playbackState.isPlaying ? (
                    <>
                      <span className="status-indicator connected" />
                      <span>Reproduzindo</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Pausado</span>
                    </>
                  )
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Imagem panorâmica</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentVideo.type === 'video' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VRPlayer;
