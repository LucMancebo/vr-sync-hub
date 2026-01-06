import { Socket } from 'socket.io';

interface ConnectedClient {
  id: string;
  socketId: string;
  name: string;
  type: 'admin' | 'vr';
  lastSeen: Date;
  connectedAt: Date;
}

class ClientService {
  private clients: Map<string, ConnectedClient> = new Map();

  // Register a new client
  registerClient(socket: Socket, clientData: { name: string; type: 'admin' | 'vr' }): ConnectedClient {
    const client: ConnectedClient = {
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      socketId: socket.id,
      name: clientData.name,
      type: clientData.type,
      lastSeen: new Date(),
      connectedAt: new Date(),
    };

    this.clients.set(socket.id, client);
    console.log(`👤 Client registered: ${client.name} (${client.type}) - ${socket.id}`);

    return client;
  }

  // Update last seen timestamp
  updateLastSeen(socketId: string) {
    const client = this.clients.get(socketId);
    if (client) {
      client.lastSeen = new Date();
    }
  }

  // Remove a client
  removeClient(socket: Socket) {
    const client = this.clients.get(socket.id);
    if (client) {
      this.clients.delete(socket.id);
      console.log(`👋 Client disconnected: ${client.name} (${client.type}) - ${socket.id}`);
    }
  }

  // Get all connected clients
  getConnectedClients(): ConnectedClient[] {
    return Array.from(this.clients.values());
  }

  // Get clients by type
  getClientsByType(type: 'admin' | 'vr'): ConnectedClient[] {
    return Array.from(this.clients.values()).filter(client => client.type === type);
  }

  // Get client count by type
  getClientCount(): { admin: number; vr: number; total: number } {
    const clients = Array.from(this.clients.values());
    const admin = clients.filter(c => c.type === 'admin').length;
    const vr = clients.filter(c => c.type === 'vr').length;

    return { admin, vr, total: admin + vr };
  }

  // Clean up stale connections (clients that haven't sent heartbeat recently)
  cleanupStaleConnections(maxAge: number = 60000) { // 60 seconds default
    const now = Date.now();
    const staleClients: string[] = [];

    this.clients.forEach((client, socketId) => {
      if (now - client.lastSeen.getTime() > maxAge) {
        staleClients.push(socketId);
      }
    });

    staleClients.forEach(socketId => {
      console.log(`🧹 Removing stale client: ${this.clients.get(socketId)?.name}`);
      this.clients.delete(socketId);
    });

    return staleClients.length;
  }
}

export const clientService = new ClientService();
