import { Server, Socket } from 'socket.io';
import { syncService } from '../services/syncService';
import { clientService } from '../services/clientService';

export const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Handle client registration
    socket.on('register', (clientData: { name: string; type: 'admin' | 'vr' }) => {
      const client = clientService.registerClient(socket, clientData);

      // Send current state to new client
      socket.emit('sync-state', syncService.getPlaybackState());
      socket.emit('video-library', syncService.getVideos());
      socket.emit('clients-list', clientService.getConnectedClients());
    });

    // Handle playback controls (admin only)
    socket.on('play', (data) => {
      syncService.handlePlay(socket, data);
    });

    socket.on('pause', (data) => {
      syncService.handlePause(socket, data);
    });

    socket.on('seek', (data) => {
      syncService.handleSeek(socket, data);
    });

    socket.on('load-video', (data) => {
      syncService.handleLoadVideo(socket, data);
    });

    socket.on('stop', (data) => {
      syncService.handleStop(socket, data);
    });

    // Handle video management
    socket.on('add-video', (videoData) => {
      syncService.addVideo(videoData);
      // Broadcast updated library to all clients
      io.to('vr-room').emit('video-library', syncService.getVideos());
    });

    socket.on('remove-video', (videoId) => {
      syncService.removeVideo(videoId);
      // Broadcast updated library to all clients
      io.to('vr-room').emit('video-library', syncService.getVideos());
    });

    // Handle heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      clientService.updateLastSeen(socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      clientService.removeClient(socket);
    });

    // Handle custom events
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    // TODO: Implement cleanup logic for disconnected clients
  }, 30000); // Check every 30 seconds
};
