import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PlaybackState } from '@/types/video';

interface VideoPlayerProps {
  url: string;
  playbackState: PlaybackState;
  onTimeUpdate?: (time: number) => void;
  isAdmin?: boolean;
  className?: string;
}

export interface VideoPlayerRef {
  seek: (time: number) => void;
  getCurrentTime: () => number;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ url, playbackState, onTimeUpdate, isAdmin = false, className = '' }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastSyncTime = useRef(0);

    useImperativeHandle(ref, () => ({
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      getCurrentTime: () => videoRef.current?.currentTime || 0,
    }));

    // Sync playback state
    useEffect(() => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      
      // Only sync if the state is newer than our last sync
      if (playbackState.timestamp <= lastSyncTime.current && !isAdmin) {
        return;
      }
      lastSyncTime.current = playbackState.timestamp;

      // Sync play/pause
      if (playbackState.isPlaying && video.paused) {
        video.play().catch(console.error);
      } else if (!playbackState.isPlaying && !video.paused) {
        video.pause();
      }

      // Sync position (with tolerance for network latency)
      if (!isAdmin) {
        const timeDiff = Math.abs(video.currentTime - playbackState.currentTime);
        if (timeDiff > 0.5) {
          video.currentTime = playbackState.currentTime;
        }
      }
    }, [playbackState, isAdmin]);

    // Report time updates to admin
    useEffect(() => {
      if (!videoRef.current || !isAdmin) return;

      const video = videoRef.current;
      const handleTimeUpdate = () => {
        onTimeUpdate?.(video.currentTime);
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [isAdmin, onTimeUpdate]);

    return (
      <video
        ref={videoRef}
        src={url}
        className={`w-full h-full object-contain ${className}`}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
