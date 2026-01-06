import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlaybackState, ConnectedDevice, Video } from '@/types/video';
import { RealtimeChannel } from '@supabase/supabase-js';

const ROOM_NAME = 'cortexvr-sync';

// Demo videos
const DEMO_VIDEOS: Video[] = [
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
];

export const useRealtimeSync = (isAdmin: boolean = false) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    timestamp: Date.now(),
  });

  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [videos, setVideos] = useState<Video[]>(DEMO_VIDEOS);
  const [isConnected, setIsConnected] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const deviceId = useRef(`device-${Math.random().toString(36).substr(2, 9)}`);

  // Setup realtime channel
  useEffect(() => {
    const device: ConnectedDevice = {
      id: deviceId.current,
      name: isAdmin ? 'Admin Console' : `VR Headset ${Math.floor(Math.random() * 100)}`,
      type: isAdmin ? 'browser' : 'vr',
      status: 'connected',
      lastSeen: new Date(),
    };

    console.log(`[RealtimeSync] Connecting as ${isAdmin ? 'Admin' : 'VR Client'}...`);

    const channel = supabase.channel(ROOM_NAME, {
      config: {
        presence: { key: deviceId.current },
        broadcast: { self: false },
      },
    });

    // Handle presence for device tracking
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('[RealtimeSync] Presence sync:', state);
      
      const devices: ConnectedDevice[] = Object.entries(state).map(([key, presences]) => {
        const presence = (presences as any[])[0];
        return {
          id: key,
          name: presence?.name || key,
          type: presence?.type || 'browser',
          status: 'connected' as const,
          lastSeen: new Date(),
        };
      });
      
      setConnectedDevices(devices);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('[RealtimeSync] Device joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('[RealtimeSync] Device left:', key, leftPresences);
    });

    // Handle broadcast messages for playback sync
    channel.on('broadcast', { event: 'playback-state' }, ({ payload }) => {
      console.log('[RealtimeSync] Received playback state:', payload);
      if (!isAdmin) {
        setPlaybackState(payload as PlaybackState);
      }
    });

    channel.on('broadcast', { event: 'video-added' }, ({ payload }) => {
      console.log('[RealtimeSync] Received new video:', payload);
      const incoming = payload as Video;
      setVideos(prev => {
        if (prev.find(v => v.id === incoming.id)) return prev;
        return [...prev, { ...incoming, uploadedAt: new Date(incoming.uploadedAt) }];
      });
    });

    channel.on('broadcast', { event: 'video-removed' }, ({ payload }) => {
      console.log('[RealtimeSync] Video removed:', payload);
      setVideos(prev => prev.filter(v => v.id !== payload.videoId));
    });

    // Handle request for current state (new clients asking for sync)
    channel.on('broadcast', { event: 'request-state' }, () => {
      if (isAdmin && channelRef.current) {
        console.log('[RealtimeSync] Sending current state to new client');
        channelRef.current.send({
          type: 'broadcast',
          event: 'playback-state',
          payload: playbackState,
        });
      }
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      console.log('[RealtimeSync] Channel status:', status);
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        
        // Track presence
        await channel.track({
          name: device.name,
          type: device.type,
          online_at: new Date().toISOString(),
        });

        // If not admin, request current state from admin
        if (!isAdmin) {
          channel.send({
            type: 'broadcast',
            event: 'request-state',
            payload: {},
          });
        }
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('[RealtimeSync] Cleaning up channel...');
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [isAdmin]);

  // Broadcast state changes (admin only)
  const broadcastState = useCallback((newState: Partial<PlaybackState>) => {
    if (!isAdmin || !channelRef.current) return;

    const updatedState: PlaybackState = {
      ...playbackState,
      ...newState,
      timestamp: Date.now(),
    };

    console.log('[RealtimeSync] Broadcasting state:', updatedState);
    setPlaybackState(updatedState);
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'playback-state',
      payload: updatedState,
    });
  }, [isAdmin, playbackState]);

  // Playback controls
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

  // Video management
  const addVideo = useCallback((video: { title: string; duration: number; size: number; file?: File; url?: string }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const uploadedAt = new Date();

    let url = video.url || '';
    if (video.file) {
      url = URL.createObjectURL(video.file);
    }

    const newVideo: Video = {
      id,
      title: video.title,
      url,
      duration: video.duration,
      uploadedAt,
      size: video.size,
    };

    setVideos(prev => [...prev, newVideo]);

    // Broadcast to other clients (note: File/Blob URLs won't work cross-device)
    if (channelRef.current && video.url) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'video-added',
        payload: { ...newVideo, uploadedAt: uploadedAt.toISOString() },
      });
    }

    return newVideo;
  }, []);

  const removeVideo = useCallback((videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'video-removed',
        payload: { videoId },
      });
    }
  }, []);

  return {
    playbackState,
    setPlaybackState,
    connectedDevices,
    videos,
    isConnected,
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
