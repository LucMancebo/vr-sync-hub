import { useState, useEffect, useCallback, useRef } from 'react';
import { PlaybackState, ConnectedDevice, Video } from '@/types/video';

// Simulated sync state - in production, this would use WebSockets
const SYNC_CHANNEL = new BroadcastChannel('cortexvr-sync');

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

      // When a new video is added by admin, receive it (as a Blob/File) and create an object URL locally
      if (data.type === 'video-added' && !isAdmin) {
        try {
          const incoming = data.video as any;
          const file = data.file as Blob | undefined;
          const url = file ? URL.createObjectURL(file) : incoming.url;
          const newVideo: Video = {
            id: incoming.id,
            title: incoming.title,
            url,
            duration: incoming.duration,
            uploadedAt: new Date(incoming.uploadedAt),
            size: incoming.size,
          };

          setVideos(prev => [...prev, newVideo]);
        } catch (err) {
          console.error('Failed to add incoming video', err);
        }
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

  // Accept optional file when adding a video (admin will pass the File)
  const addVideo = useCallback((video: { title: string; duration: number; size: number; file?: File; url?: string }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const uploadedAt = new Date();

    // If admin uploaded a File, create an object URL for local playback
    if (isAdmin && video.file) {
      const file = video.file as File;
      const url = URL.createObjectURL(file);
      const videoWithUrl: Video = {
        id,
        title: video.title,
        url,
        duration: video.duration,
        uploadedAt,
        size: video.size,
      };

      setVideos(prev => [...prev, videoWithUrl]);

      // Broadcast to other clients so they can create their own object URL
      SYNC_CHANNEL.postMessage({ type: 'video-added', video: { ...videoWithUrl, uploadedAt: videoWithUrl.uploadedAt.toISOString() }, file });

      return videoWithUrl;
    }

    // If no file provided, expect a URL to be available
    const newVideo: Video = {
      id,
      title: video.title,
      url: video.url || '',
      duration: video.duration,
      uploadedAt,
      size: video.size,
    };

    setVideos(prev => [...prev, newVideo]);
    return newVideo;
  }, [isAdmin]);

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
