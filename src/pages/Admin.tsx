import { useRef, useCallback } from 'react';
import { Settings, MonitorPlay, Upload, Wifi, WifiOff, CloudOff } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { VideoPlayer, VideoPlayerRef } from '@/components/VideoPlayer';
import { VideoUploader } from '@/components/admin/VideoUploader';
import { VideoList } from '@/components/admin/VideoList';
import { PlaybackControls } from '@/components/admin/PlaybackControls';
import { DeviceList } from '@/components/admin/DeviceList';

const Admin = () => {
  const { 
    playbackState, 
    setPlaybackState,
    connectedDevices, 
    videos, 
    controls, 
    videoActions,
    isConnected,
    isOnline,
    lowBatteryWarning,
    dismissBatteryWarning,
  } = useRealtimeSync(true);
  
  const playerRef = useRef<VideoPlayerRef>(null);

  const currentVideo = videos.find(v => v.id === playbackState.videoId) || null;

  const handleTimeUpdate = useCallback((time: number) => {
    setPlaybackState(prev => ({ ...prev, currentTime: time }));
  }, [setPlaybackState]);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CortexVr</h1>
                <p className="text-xs text-muted-foreground">Painel de Administração</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Offline mode indicator */}
              {!isOnline && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-warning/20 text-warning">
                  <CloudOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Modo Local</span>
                </div>
              )}
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isConnected 
                  ? 'bg-success/20 text-success' 
                  : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="hidden sm:inline">Sincronização Ativa</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Conectando...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Video preview and controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <MonitorPlay className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Preview</h2>
              </div>
              
              <div className="video-container">
                {currentVideo ? (
                  currentVideo.type === 'image' ? (
                    <img 
                      src={currentVideo.url} 
                      alt={currentVideo.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <VideoPlayer
                      ref={playerRef}
                      url={currentVideo.url}
                      playbackState={playbackState}
                      onTimeUpdate={handleTimeUpdate}
                      isAdmin={true}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MonitorPlay className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Selecione um vídeo para visualizar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <PlaybackControls
              playbackState={playbackState}
              currentVideo={currentVideo}
              onPlay={controls.play}
              onPause={controls.pause}
              onStop={controls.stop}
              onSeek={controls.seek}
            />
          </div>

          {/* Right column - Video library and devices */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Upload de Mídia</h2>
              </div>
              <VideoUploader onUpload={videoActions.addVideo} />
              
              {/* Offline warning for uploads */}
              {!isOnline && (
                <p className="mt-3 text-xs text-warning">
                  ⚠️ Arquivos locais não sincronizam entre dispositivos. Use URLs externas para sincronização.
                </p>
              )}
            </div>

            {/* Video Library */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <MonitorPlay className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Biblioteca</h2>
              </div>
              <VideoList
                videos={videos}
                currentVideoId={playbackState.videoId}
                onSelect={controls.loadVideo}
                onDelete={videoActions.removeVideo}
              />
            </div>

            {/* Connected Devices */}
            <DeviceList 
              devices={connectedDevices} 
              lowBatteryWarning={lowBatteryWarning}
              onDismissWarning={dismissBatteryWarning}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
