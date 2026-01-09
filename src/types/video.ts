export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration: number;
  uploadedAt: Date;
  size: number;
  type: 'video' | 'image'; // Support for panoramic images
}

export interface PlaybackState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  timestamp: number; // Server timestamp for sync
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'vr' | 'browser';
  status: 'connected' | 'syncing' | 'disconnected';
  lastSeen: Date;
  batteryLevel?: number;
  batteryCharging?: boolean;
}

export interface SyncMessage {
  type: 'play' | 'pause' | 'seek' | 'load' | 'stop' | 'video-added' | 'video-removed' | 'request-state' | 'playback-state' | 'device-update';
  videoId?: string;
  currentTime?: number;
  timestamp: number;
  payload?: any;
}
