# CortexVr Archive Documentation

## Project Overview

CortexVr is a Progressive Web App (PWA) designed for synchronized video playback across multiple VR devices. It provides an admin interface for managing video libraries and controlling playback, while connected VR devices receive real-time synchronization updates. The application is built as a single-page application (SPA) using modern web technologies.

### Key Features
- **Admin Panel**: Upload videos, manage library, control playback, monitor connected devices
- **VR Player**: Immersive player optimized for VR headsets with auto-hiding controls
- **Real-time Synchronization**: LAN-based sync using BroadcastChannel API
- **PWA Support**: Offline-capable with service worker
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend Framework
- **React 18**: Component-based UI library with hooks
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Vite**: Fast build tool and development server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Re-usable UI components built on Radix UI primitives
- **Lucide React**: Icon library
- **React Router**: Client-side routing

### State Management & Data
- **React Query**: Server state management (though currently used minimally)
- **BroadcastChannel API**: Real-time communication between browser tabs/windows
- **Custom Hooks**: `useSyncState` for synchronization logic

### Build & Deployment
- **Vite PWA Plugin**: Service worker and manifest generation
- **ESLint + Prettier**: Code linting and formatting
- **TypeScript Compiler**: Type checking

### Development Tools
- **Vite Dev Server**: Hot module replacement
- **TypeScript**: Static type checking
- **ESLint**: Code quality enforcement

## Architecture

### Application Structure
The application follows a component-based architecture with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── admin/          # Admin-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── pwa/                # PWA-related code
```

### State Management
- **Local State**: React hooks (`useState`, `useEffect`)
- **Sync State**: Custom `useSyncState` hook using BroadcastChannel
- **No Global State**: Each component manages its own state, with sync handled via broadcast messages

### Communication Pattern
- **BroadcastChannel**: Used for real-time synchronization between admin and VR player instances
- **Event-driven**: Components listen for broadcast messages and update accordingly
- **Admin-led**: Admin controls playback, VR players follow passively

## Main Components

### Pages
1. **Index (`/`)**: Landing page with feature overview and navigation
2. **Admin (`/admin`)**: Full admin interface for video management and playback control
3. **VRPlayer (`/vr`)**: Immersive player for VR devices
4. **NotFound (`*`)**: 404 error page

### Core Components

#### VideoPlayer
- **Purpose**: Handles video playback with synchronization
- **Features**: Auto-sync with admin controls, time updates, play/pause/seek
- **Props**: `url`, `playbackState`, `onTimeUpdate`, `isAdmin`
- **Ref Methods**: `seek()`, `getCurrentTime()`

#### Admin Components
- **VideoUploader**: Drag-and-drop file upload with progress
- **VideoList**: Displays video library with play/delete actions
- **PlaybackControls**: Transport controls (play/pause/stop/seek)
- **DeviceList**: Shows connected VR devices

#### UI Components
- Extensive shadcn/ui component library (buttons, dialogs, forms, etc.)
- Custom styled components with Tailwind classes

### Custom Hooks
- **useSyncState**: Manages synchronized state across browser instances
- **useIsMobile**: Responsive breakpoint detection
- **useToast**: Notification system

## Workflow

### User Journey

#### Admin Workflow
1. **Access Admin Panel**: Navigate to `/admin`
2. **Upload Videos**: Use drag-and-drop uploader
3. **Manage Library**: View, select, or delete videos
4. **Control Playback**: Play/pause/stop/seek videos
5. **Monitor Devices**: View connected VR headsets

#### VR Player Workflow
1. **Access Player**: Navigate to `/vr` or scan QR code
2. **Wait for Sync**: Player shows waiting state until admin selects video
3. **Synchronized Playback**: Follows admin controls in real-time
4. **Fullscreen Mode**: Toggle fullscreen for immersive experience

### Synchronization Flow
1. **Admin Action**: User interacts with playback controls
2. **State Update**: `useSyncState` updates local state and broadcasts
3. **Broadcast Message**: `BroadcastChannel.postMessage()` sends sync data
4. **VR Player Receive**: Other tabs/windows receive message
5. **State Sync**: VR players update their playback state
6. **Video Sync**: VideoPlayer component syncs HTML5 video element

### Data Flow
- **Video Upload**: File → Object URL → Broadcast → VR Players create local URLs
- **Playback State**: Admin controls → Broadcast → VR players sync
- **Device Registration**: Auto-registration on mount with unique IDs

## File Structure

```
cortexvr/
├── public/              # Static assets
│   ├── icons/          # PWA icons
│   ├── manifest.json   # PWA manifest
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/         # shadcn/ui components (40+ files)
│   │   ├── admin/      # Admin components
│   │   │   ├── VideoUploader.tsx
│   │   │   ├── VideoList.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   └── DeviceList.tsx
│   │   └── VideoPlayer.tsx
│   ├── hooks/
│   │   ├── useSyncState.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts    # cn() utility for class merging
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── Admin.tsx
│   │   ├── VRPlayer.tsx
│   │   └── NotFound.tsx
│   ├── pwa/
│   │   └── registerServiceWorker.ts
│   ├── types/
│   │   └── video.ts    # TypeScript interfaces
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Build configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Dependencies

### Core Dependencies
- `react` & `react-dom`: UI framework
- `react-router-dom`: Routing
- `@tanstack/react-query`: Data fetching (minimal use)
- `@radix-ui/*`: UI primitives for shadcn/ui
- `tailwindcss`: Styling framework
- `lucide-react`: Icons

### Development Dependencies
- `@vitejs/plugin-react-swc`: React plugin for Vite
- `vite-plugin-pwa`: PWA support
- `typescript`: Type checking
- `eslint`: Linting
- `prettier`: Code formatting

## Build and Deployment

### Development
```bash
npm run dev          # Start dev server on :8080
npm run type-check   # TypeScript checking
npm run lint         # ESLint
npm run format       # Prettier formatting
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### PWA Features
- **Service Worker**: Auto-generated by vite-plugin-pwa
- **Manifest**: Configured in vite.config.ts
- **Offline Support**: Caches assets for offline use
- **Installable**: Can be installed as native app

## Future Development Notes

### Potential Enhancements
1. **WebRTC/WebSockets**: Replace BroadcastChannel for cross-device sync
2. **Video Streaming**: Support for streaming large videos
3. **User Authentication**: Multi-user support with access control
4. **Video Processing**: Server-side transcoding and thumbnail generation
5. **Analytics**: Playback metrics and device usage tracking
6. **Multi-language**: Internationalization support

### Architecture Considerations
- **Scalability**: Current BroadcastChannel limits to same-origin tabs
- **Performance**: Large video files may cause memory issues
- **Security**: No authentication - consider for production use
- **Testing**: Add unit and integration tests for critical components

### Maintenance Tasks
- Update dependencies regularly
- Monitor PWA compatibility across browsers
- Add error boundaries for better error handling
- Implement proper logging and monitoring

This archive serves as a comprehensive reference for understanding, maintaining, and extending the CortexVr application.
