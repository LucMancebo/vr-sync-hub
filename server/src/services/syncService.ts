import { Socket } from 'socket.io';

interface PlaybackState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  timestamp: number;
}

interface VideoData {
  id: string;
  title: string;
  url: string;
  duration: number;
}

class SyncService {
  private playbackState: PlaybackState = {
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    timestamp: Date.now(),
  };

  private videos: VideoData[] = [];

  // Handle play event
  handlePlay(socket: Socket, data: any) {
    this.playbackState.isPlaying = true;
    this.playbackState.timestamp = Date.now();

    // Broadcast to all clients in the same room
    socket.to('vr-room').emit('sync-play', this.playbackState);
    console.log(`▶️  Video play initiated by ${socket.id}`);
  }

  // Handle pause event
  handlePause(socket: Socket, data: any) {
    this.playbackState.isPlaying = false;
    this.playbackState.timestamp = Date.now();

    socket.to('vr-room').emit('sync-pause', this.playbackState);
    console.log(`⏸️  Video pause initiated by ${socket.id}`);
  }

  // Handle seek event
  handleSeek(socket: Socket, data: { time: number }) {
    this.playbackState.currentTime = data.time;
    this.playbackState.timestamp = Date.now();

    socket.to('vr-room').emit('sync-seek', this.playbackState);
    console.log(`⏩ Video seek to ${data.time}s by ${socket.id}`);
  }

  // Handle video load
  handleLoadVideo(socket: Socket, data: { videoId: string }) {
    const video = this.videos.find(v => v.id === data.videoId);
    if (video) {
      this.playbackState.videoId = data.videoId;
      this.playbackState.currentTime = 0;
      this.playbackState.isPlaying = false;
      this.playbackState.timestamp = Date.now();

      socket.to('vr-room').emit('sync-load', {
        ...this.playbackState,
        video
      });
      console.log(`📹 Video loaded: ${video.title} by ${socket.id}`);
    }
  }

  // Handle stop event
  handleStop(socket: Socket, data: any) {
    this.playbackState.videoId = null;
    this.playbackState.isPlaying = false;
    this.playbackState.currentTime = 0;
    this.playbackState.timestamp = Date.now();

    socket.to('vr-room').emit('sync-stop', this.playbackState);
    console.log(`⏹️  Video stopped by ${socket.id}`);
  }

  // Add video to library
  addVideo(video: VideoData) {
    this.videos.push(video);
    console.log(`📁 Video added to library: ${video.title}`);
  }

  // Remove video from library
  removeVideo(videoId: string) {
    const index = this.videos.findIndex(v => v.id === videoId);
    if (index > -1) {
      const removed = this.videos.splice(index, 1)[0];
      console.log(`🗑️  Video removed from library: ${removed.title}`);
    }
  }

  // Get current playback state
  getPlaybackState(): PlaybackState {
    return { ...this.playbackState };
  }

  // Get video library
  getVideos(): VideoData[] {
    return [...this.videos];
  }
}

export const syncService = new SyncService();
