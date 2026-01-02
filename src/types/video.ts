export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration: number;
  uploadedAt: Date;
  size: number;
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
}

export interface SyncMessage {
  type: 'play' | 'pause' | 'seek' | 'load' | 'stop';
  videoId?: string;
  currentTime?: number;
  timestamp: number;
}
