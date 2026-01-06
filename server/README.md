# CortexVr Server

Backend server for the CortexVr video synchronization system, built with Node.js, Express, and Socket.IO.

## Architecture

The server follows a clean, modular architecture with clear separation of concerns:

### Project Structure
```
server/
├── src/
│   ├── app/              # Application layer
│   │   ├── app.ts        # Express routes and middleware
│   │   └── socket.ts     # Socket.IO event handlers
│   ├── services/         # Service layer
│   │   ├── syncService.ts    # Video synchronization logic
│   │   └── clientService.ts  # Client management
│   └── index.ts          # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

### Layers

#### 1. Server Layer (`index.ts`)
- HTTP server setup with Express
- Socket.IO integration
- Middleware configuration
- Basic health checks

#### 2. Application Layer (`app/`)
- Express routing and middleware
- Socket.IO event handling
- Request/response processing

#### 3. Service Layer (`services/`)
- Business logic encapsulation
- Video synchronization management
- Client connection handling
- Event broadcasting

## Features

- **Real-time Communication**: Socket.IO for instant video sync
- **Video Management**: Upload, store, and manage video library
- **Client Management**: Track connected VR devices and admin consoles
- **Playback Control**: Synchronized play/pause/seek/stop across devices
- **Health Monitoring**: Connection status and heartbeat monitoring

## API Endpoints

### REST API
- `GET /health` - Server health check
- `GET /api/status` - Application status
- `GET /api/videos` - Get video library
- `POST /api/videos` - Upload new video

### Socket.IO Events

#### Client Registration
- `register` - Register client (admin/vr)
- `heartbeat` - Connection health check

#### Playback Control (Admin → VR)
- `play` - Start video playback
- `pause` - Pause video playback
- `seek` - Seek to specific time
- `load-video` - Load specific video
- `stop` - Stop playback

#### Video Management
- `add-video` - Add video to library
- `remove-video` - Remove video from library

#### Synchronization (Server → Clients)
- `sync-state` - Current playback state
- `sync-play` - Play command
- `sync-pause` - Pause command
- `sync-seek` - Seek command
- `sync-load` - Load video command
- `sync-stop` - Stop command
- `video-library` - Updated video library
- `clients-list` - Connected clients list

## Installation

```bash
cd server
npm install
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:8080)

## Usage

1. Start the server: `npm run dev`
2. Connect admin client to manage videos
3. Connect VR clients for synchronized playback
4. Use admin controls to manage playback across all connected devices

## Architecture Benefits

- **Modular**: Clear separation between server, app, and services
- **Scalable**: Easy to add new features and endpoints
- **Maintainable**: Well-organized code structure
- **Real-time**: Socket.IO enables instant synchronization
- **Type-safe**: TypeScript ensures code reliability
- **Production-ready**: Includes security, logging, and compression middleware

## Network Configuration (LAN Access)

To run the server on a local network and allow connections from VR devices:

1.  **Identify Server IP**: Find the local IP address of the host machine (e.g., `192.168.1.X`).
2.  **Configure Environment**:
    *   Set `CLIENT_URL` to the address where your frontend is running.
    *   Example: `CLIENT_URL=http://192.168.1.5:8080`
3.  **Start Server**:
    ```bash
    # Example with inline env var
    CLIENT_URL=http://192.168.1.5:8080 npm run dev
    ```
4.  **Firewall**: Ensure the server port (default `3001`) is open to incoming traffic on the local network.
