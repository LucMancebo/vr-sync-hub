import { useState, useEffect, useCallback, useRef } from 'react';
import { PlaybackState, SyncMessage, ConnectedDevice, Video } from '@/types/video';

// Simulated sync state - in production, this would use WebSockets
const SYNC_CHANNEL = new BroadcastChannel('vr-sync');

export const useSyncState = (isAdmin: boolean = false) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    timestamp: Date.now(),
  });
  
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      title: 'Demo VR Experience',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 596,
      uploadedAt: new Date(),
      size: 158008374,
    },
    {
      id: '2',
      title: '360° Ocean View',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: 653,
      uploadedAt: new Date(),
      size: 114984274,
    },
  ]);
  
  const deviceId = useRef(`device-${Math.random().toString(36).substr(2, 9)}`);

  // Register device on mount
  useEffect(() => {
    const device: ConnectedDevice = {
      id: deviceId.current,
      name: isAdmin ? 'Admin Console' : `VR Headset ${Math.floor(Math.random() * 100)}`,
      type: isAdmin ? 'browser' : 'vr',
      status: 'connected',
      lastSeen: new Date(),
    };

    // Broadcast device connection
    SYNC_CHANNEL.postMessage({ type: 'device-connect', device });

    // Listen for sync messages
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      
      if (data.type === 'sync-state' && !isAdmin) {
        setPlaybackState(data.state);
      }
      
      if (data.type === 'device-connect' && isAdmin) {
        setConnectedDevices(prev => {
          const exists = prev.find(d => d.id === data.device.id);
          if (exists) return prev;
          return [...prev, data.device];
        });
      }
      
      if (data.type === 'device-disconnect' && isAdmin) {
        setConnectedDevices(prev => prev.filter(d => d.id !== data.device.id));
      }
    };

    SYNC_CHANNEL.addEventListener('message', handleMessage);

    // Cleanup on unmount
    return () => {
      SYNC_CHANNEL.postMessage({ type: 'device-disconnect', device });
      SYNC_CHANNEL.removeEventListener('message', handleMessage);
    };
  }, [isAdmin]);

  // Admin controls
  const broadcastState = useCallback((newState: Partial<PlaybackState>) => {
    if (!isAdmin) return;
    
    const updatedState = {
      ...playbackState,
      ...newState,
      timestamp: Date.now(),
    };
    
    setPlaybackState(updatedState);
    SYNC_CHANNEL.postMessage({ type: 'sync-state', state: updatedState });
  }, [isAdmin, playbackState]);

  const play = useCallback(() => {
    broadcastState({ isPlaying: true });
  }, [broadcastState]);

  const pause = useCallback(() => {
    broadcastState({ isPlaying: false });
  }, [broadcastState]);

  const seek = useCallback((time: number) => {
    broadcastState({ currentTime: time });
  }, [broadcastState]);

  const loadVideo = useCallback((videoId: string) => {
    broadcastState({ videoId, currentTime: 0, isPlaying: false });
  }, [broadcastState]);

  const stop = useCallback(() => {
    broadcastState({ videoId: null, currentTime: 0, isPlaying: false });
  }, [broadcastState]);

  const addVideo = useCallback((video: Omit<Video, 'id' | 'uploadedAt'>) => {
    const newVideo: Video = {
      ...video,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date(),
    };
    setVideos(prev => [...prev, newVideo]);
    return newVideo;
  }, []);

  const removeVideo = useCallback((videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
  }, []);

  return {
    playbackState,
    setPlaybackState,
    connectedDevices,
    videos,
    controls: {
      play,
      pause,
      seek,
      loadVideo,
      stop,
    },
    videoActions: {
      addVideo,
      removeVideo,
    },
  };
};
