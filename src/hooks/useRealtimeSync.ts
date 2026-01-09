import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlaybackState, ConnectedDevice, Video } from '@/types/video';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useLocalSync } from './useLocalSync';

const ROOM_NAME = 'cortexvr-sync';

// Demo videos with external URLs that work across devices
const DEMO_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Demo VR Experience',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
    uploadedAt: new Date(),
    size: 158008374,
    type: 'video',
  },
  {
    id: '2',
    title: '360° Ocean View',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
    uploadedAt: new Date(),
    size: 114984274,
    type: 'video',
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  const [lowBatteryWarning, setLowBatteryWarning] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const deviceId = useRef(`device-${Math.random().toString(36).substring(2, 11)}`);
  const playbackStateRef = useRef(playbackState);
  const videosRef = useRef(videos);

  // Keep refs updated
  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  // Local sync for offline/local network mode
  const { broadcast: localBroadcast } = useLocalSync(isAdmin, {
    onPlaybackState: (state) => {
      if (!isAdmin) {
        setPlaybackState(state);
      }
    },
    onVideoAdded: (video) => {
      setVideos(prev => {
        if (prev.find(v => v.id === video.id)) return prev;
        return [...prev, { ...video, uploadedAt: new Date(video.uploadedAt) }];
      });
    },
    onVideoRemoved: (videoId) => {
      setVideos(prev => prev.filter(v => v.id !== videoId));
    },
    onDeviceUpdate: (device) => {
      setConnectedDevices(prev => {
        const existing = prev.findIndex(d => d.id === device.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = device;
          return updated;
        }
        return [...prev, device];
      });
    },
    onRequestState: () => {
      if (isAdmin) {
        // Send current state to new clients via local broadcast
        localBroadcast({
          type: 'playback-state',
          timestamp: Date.now(),
          payload: playbackStateRef.current,
        });
        // Also send videos
        videosRef.current.forEach(video => {
          localBroadcast({
            type: 'video-added',
            timestamp: Date.now(),
            payload: { ...video, uploadedAt: video.uploadedAt.toISOString() },
          });
        });
      }
    },
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Setup realtime channel
  useEffect(() => {
    const device: ConnectedDevice = {
      id: deviceId.current,
      name: isAdmin ? 'Admin Console' : `VR Headset ${Math.floor(Math.random() * 100)}`,
      type: isAdmin ? 'browser' : 'vr',
      status: 'connected',
      lastSeen: new Date(),
    };

    console.log(`[RealtimeSync] Connecting as ${isAdmin ? 'Admin' : 'VR Client'}... Online: ${isOnline}`);

    // Battery monitoring for VR devices
    let batteryManager: any = null;
    
    const setupBattery = async () => {
      try {
        // @ts-ignore - Battery API is not in TypeScript types
        if (navigator.getBattery) {
          // @ts-ignore
          batteryManager = await navigator.getBattery();
          
          const updateBattery = () => {
            const level = Math.round(batteryManager.level * 100);
            const charging = batteryManager.charging;
            
            const info = { level, charging };
            setBatteryInfo(info);
            
            console.log('[RealtimeSync] Battery update:', info);
            
            // Check for low battery warning (40%)
            if (level <= 40 && !charging) {
              setLowBatteryWarning(`${device.name}: Bateria em ${level}%`);
            } else {
              setLowBatteryWarning(null);
            }
            
            // Update presence with battery info via Supabase
            if (channelRef.current && isOnline) {
              channelRef.current.track({
                name: device.name,
                type: device.type,
                online_at: new Date().toISOString(),
                batteryLevel: level,
                batteryCharging: charging,
              });
            }
            
            // Also broadcast via local channel for offline mode
            localBroadcast({
              type: 'device-update',
              timestamp: Date.now(),
              payload: {
                ...device,
                batteryLevel: level,
                batteryCharging: charging,
                lastSeen: new Date(),
              },
            });
          };
          
          updateBattery();
          batteryManager.addEventListener('levelchange', updateBattery);
          batteryManager.addEventListener('chargingchange', updateBattery);
          
          // Update battery every 30 seconds
          const batteryInterval = setInterval(updateBattery, 30000);
          
          return () => {
            clearInterval(batteryInterval);
            if (batteryManager) {
              batteryManager.removeEventListener('levelchange', updateBattery);
              batteryManager.removeEventListener('chargingchange', updateBattery);
            }
          };
        } else {
          console.log('[RealtimeSync] Battery API not supported');
        }
      } catch (error) {
        console.log('[RealtimeSync] Battery API not available:', error);
      }
      return () => {};
    };

    let batteryCleanup: () => void = () => {};
    setupBattery().then(cleanup => { batteryCleanup = cleanup; });

    // Setup local broadcast for offline/local network
    if (!isAdmin) {
      // Request state from admin via local channel
      localBroadcast({
        type: 'request-state',
        timestamp: Date.now(),
      });
    }

    // Only connect to Supabase if online
    if (!isOnline) {
      console.log('[RealtimeSync] Offline mode - using local sync only');
      setIsConnected(true); // Mark as connected for local sync
      return () => { batteryCleanup(); };
    }

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
          batteryLevel: presence?.batteryLevel,
          batteryCharging: presence?.batteryCharging,
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
        // Use ref to get current state
        channelRef.current.send({
          type: 'broadcast',
          event: 'playback-state',
          payload: playbackStateRef.current,
        });
        // Also send videos
        videosRef.current.forEach(video => {
          channelRef.current?.send({
            type: 'broadcast',
            event: 'video-added',
            payload: { ...video, uploadedAt: video.uploadedAt.toISOString() },
          });
        });
      }
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      console.log('[RealtimeSync] Channel status:', status);
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        
        // Track presence with initial battery info
        const trackData: any = {
          name: device.name,
          type: device.type,
          online_at: new Date().toISOString(),
        };
        
        if (batteryInfo) {
          trackData.batteryLevel = batteryInfo.level;
          trackData.batteryCharging = batteryInfo.charging;
        }
        
        await channel.track(trackData);

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
      batteryCleanup();
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [isAdmin, isOnline, localBroadcast]);

  // Broadcast state changes (admin only) - both Supabase and Local
  const broadcastState = useCallback((newState: Partial<PlaybackState>) => {
    if (!isAdmin) return;

    const updatedState: PlaybackState = {
      ...playbackStateRef.current,
      ...newState,
      timestamp: Date.now(),
    };

    console.log('[RealtimeSync] Broadcasting state:', updatedState);
    setPlaybackState(updatedState);
    
    // Broadcast via Supabase (if online)
    if (channelRef.current && isOnline) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'playback-state',
        payload: updatedState,
      });
    }
    
    // Also broadcast via local channel (works offline)
    localBroadcast({
      type: 'playback-state',
      timestamp: Date.now(),
      payload: updatedState,
    });
  }, [isAdmin, isOnline, localBroadcast]);

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
  const addVideo = useCallback((video: { title: string; duration: number; size: number; file?: File; url?: string; type?: 'video' | 'image' }) => {
    const id = Math.random().toString(36).substring(2, 11);
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
      type: video.type || 'video',
    };

    setVideos(prev => [...prev, newVideo]);

    // Broadcast to other clients
    // Note: Blob URLs won't work cross-device, only external URLs will sync
    const isExternalUrl = video.url && !video.url.startsWith('blob:');
    
    if (isExternalUrl) {
      if (channelRef.current && isOnline) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'video-added',
          payload: { ...newVideo, uploadedAt: uploadedAt.toISOString() },
        });
      }
      
      localBroadcast({
        type: 'video-added',
        timestamp: Date.now(),
        payload: { ...newVideo, uploadedAt: uploadedAt.toISOString() },
      });
    } else {
      console.warn('[RealtimeSync] Blob URL detected - video will only be available locally');
    }

    return newVideo;
  }, [isOnline, localBroadcast]);

  const removeVideo = useCallback((videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    
    if (channelRef.current && isOnline) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'video-removed',
        payload: { videoId },
      });
    }
    
    localBroadcast({
      type: 'video-removed',
      timestamp: Date.now(),
      payload: { videoId },
    });
  }, [isOnline, localBroadcast]);

  // Dismiss low battery warning
  const dismissBatteryWarning = useCallback(() => {
    setLowBatteryWarning(null);
  }, []);

  return {
    playbackState,
    setPlaybackState,
    connectedDevices,
    videos,
    isConnected,
    isOnline,
    batteryInfo,
    lowBatteryWarning,
    dismissBatteryWarning,
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
