import { useEffect, useRef, useCallback } from 'react';
import { SyncMessage, PlaybackState, Video, ConnectedDevice } from '@/types/video';

const CHANNEL_NAME = 'cortexvr-local-sync';

interface LocalSyncCallbacks {
  onPlaybackState?: (state: PlaybackState) => void;
  onVideoAdded?: (video: Video) => void;
  onVideoRemoved?: (videoId: string) => void;
  onDeviceUpdate?: (device: ConnectedDevice) => void;
  onRequestState?: () => void;
}

export const useLocalSync = (isAdmin: boolean, callbacks: LocalSyncCallbacks) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const callbacksRef = useRef(callbacks);
  
  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    // BroadcastChannel works on same origin (same network via IP)
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const message = event.data;
      console.log('[LocalSync] Received:', message.type);

      switch (message.type) {
        case 'playback-state':
          if (!isAdmin && message.payload) {
            callbacksRef.current.onPlaybackState?.(message.payload);
          }
          break;
        case 'video-added':
          if (message.payload) {
            callbacksRef.current.onVideoAdded?.(message.payload);
          }
          break;
        case 'video-removed':
          if (message.payload?.videoId) {
            callbacksRef.current.onVideoRemoved?.(message.payload.videoId);
          }
          break;
        case 'device-update':
          if (message.payload) {
            callbacksRef.current.onDeviceUpdate?.(message.payload);
          }
          break;
        case 'request-state':
          if (isAdmin) {
            callbacksRef.current.onRequestState?.();
          }
          break;
      }
    };

    console.log('[LocalSync] Channel initialized');

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [isAdmin]);

  const broadcast = useCallback((message: SyncMessage) => {
    if (channelRef.current) {
      console.log('[LocalSync] Broadcasting:', message.type);
      channelRef.current.postMessage(message);
    }
  }, []);

  return { broadcast };
};
