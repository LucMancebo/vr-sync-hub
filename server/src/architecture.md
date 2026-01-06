# Architecture Document

## Overview

This document outlines the architecture of the CortexVr Server, detailing its main components, their responsibilities, and the overall workflow.

## Main Components

1.  **Express Server**:
    *   **Responsibility**: Handles HTTP requests, manages middleware, and defines API routes.
    *   **Implementation**: Initialized using the `express` library. Configured with middleware for CORS, security headers (helmet), request logging (morgan), and request body parsing (express.json & express.urlencoded).

2.  **Socket.IO Server**:
    *   **Responsibility**: Manages real-time communication using WebSockets. Handles client connections, message routing, and synchronization logic.
    *   **Implementation**: Created using the `socket.io` library, attached to the HTTP server. Configured with CORS settings to allow connections from the client application.

3.  **Routes (appRouter)**:
    *   **Responsibility**: Defines the API endpoints for the server.
    *   **Implementation**: Uses the Express Router to handle different routes under the `/api` path.

4.  **Socket Handler (socketHandler)**:
    *   **Responsibility**: Contains the logic for handling Socket.IO connections and events.
    *   **Implementation**: A separate module (`./app/socket`) that exports a function to attach event listeners to the Socket.IO server instance.

## Workflow

1.  **Initialization**: The server starts by initializing the Express app, HTTP server, and Socket.IO server.
2.  **Middleware**: Express applies a series of middleware functions for security, CORS, logging, and request parsing.
3.  **Routing**: HTTP requests to `/api` are routed to the `appRouter`, which handles specific API endpoints.  A health check endpoint `/health` is also defined.
4.  **Socket Handling**: The `socketHandler` is invoked to manage WebSocket connections, handling events and message routing.
5.  **Listening**: The HTTP server starts listening for incoming connections on the specified port.
6.  **Real-time Communication**: Clients connect via WebSockets, enabling real-time bidirectional communication managed by Socket.IO.

## Connectivity & Synchronization Strategy

### Cross-Device Communication
Unlike the legacy `BroadcastChannel` approach (limited to same-device tabs), this server utilizes **Socket.IO** to enable synchronization across different devices on a network (e.g., Desktop Admin -> VR Headset).

*   **Protocol**: WebSockets (via Socket.IO) for low-latency, bidirectional events.
*   **Topology**: Star topology where the Server acts as the central hub.
*   **Sync Model**: Master-Slave. The Admin client sends control commands (`play`, `pause`, `seek`), and the server broadcasts these as sync events to all connected VR clients.

### Network Configuration Requirements
To ensure the server runs seamlessly on any device and accepts connections:

1.  **Binding**: The server listens on the configured `PORT` on all network interfaces.
2.  **CORS (Cross-Origin Resource Sharing)**:
    *   Controlled via `CLIENT_URL` environment variable.
    *   **Must** be configured to match the origin of the client application.
    *   For LAN usage, this is typically `http://<SERVER_IP>:<CLIENT_PORT>`.
3.  **Client Connection**: The frontend application must be configured to establish the Socket.IO connection to the server's LAN IP address, not `localhost`.