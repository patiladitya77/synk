# Synk

A real-time collaborative whiteboard application that allows multiple users to create, edit, and share diagrams with intelligent arrow routing. Built for teams who need to visualize ideas and work together seamlessly.

<!-- ![License](https://img.shields.io/badge/license-MIT-blue.svg) -->

## Overview

Synk is a collaborative canvas application designed for teams to visualize ideas, create diagrams, and work together in real-time. Users can draw shapes (rectangles, ovals, diamonds), connect them with smart arrows that automatically route around obstacles using A\* pathfinding, and invite collaborators to work on the same board simultaneously. All changes sync instantly across connected clients via WebSocket connections.

### Key Features

- **Real-time Collaboration** - Multiple users can edit the same canvas simultaneously with instant synchronization
- **Smart Arrow Routing** - Arrows automatically find optimal paths around shapes using A\* pathfinding algorithm
- **Undo/Redo Support** - Full operation history using the Command design pattern
- **Infinite Canvas** - Unlimited workspace with pan and zoom capabilities
- **Secure Authentication** - JWT-based auth with refresh tokens and Google OAuth support
- **Board Sharing** - Generate invite links with 24-hour expiration to add collaborators
- **Password Recovery** - OTP-based password reset via email

## Tech Stack

- **Next.js** - React framework with server-side rendering and App Router
- **TypeScript** - Type-safe development across frontend and backend
- **Redux Toolkit** - Global state management for auth and canvas data
- **Socket.IO** - WebSocket communication for real-time synchronization
- **PostgreSQL** - Relational database with Prisma ORM

## System Architecture

The application follows a client-server architecture with real-time synchronization:

```mermaid
flowchart TB
    Client[Browser Client]
    NextJS[Next.js App]
    Redux[Redux Store]
    Canvas[Canvas Engine]
    SocketClient[Socket.IO Client]

    Client --> NextJS
    NextJS --> Redux
    NextJS --> Canvas
    NextJS --> SocketClient

    SocketClient -->|WebSocket| SocketServer[Socket.IO Server]
    NextJS -->|HTTP/REST| Express[Express API]

    Express --> AuthMiddleware[JWT Auth Middleware]
    AuthMiddleware --> Controllers[Controllers]

    SocketServer --> Prisma[Prisma ORM]
    Controllers --> Prisma

    Prisma -->|SQL| PostgreSQL[(PostgreSQL Database)]

    Controllers -->|Email| SMTP[Brevo SMTP]
    Controllers -->|OAuth| Google[Google OAuth API]

    Canvas -->|A* Pathfinding| Router[Arrow Router]
    Router -->|Grid/Obstacles| Astar[A* Algorithm]
```

### Architecture Components

**Frontend (Next.js)**

- **App Router** - File-based routing (`/login`, `/dashboard`, `/workspace/[slug]`)
- **Canvas Engine** - Custom HTML5 Canvas renderer with shape drawing and camera controls
- **Redux Store** - Authentication state and canvas list management
- **Socket.IO Client** - WebSocket connection for real-time updates

**Backend (Express)**

- **REST API** - Authentication, board CRUD, invite generation
- **Socket.IO Server** - Real-time shape operations (draw, update, delete)
- **Middleware** - JWT verification for protected routes
- **Controllers** - Business logic for auth, boards, and Google OAuth

**Database (PostgreSQL)**

- **Models** - User, Board, Shape, AuthProvider, Session, BoardCollaborator
- **Relations** - One-to-many (User → Boards), many-to-many (Users ↔ Boards)
- **Soft Deletes** - Shapes use `isDeleted` flag for undo/redo support

**Canvas Engine**

- **Renderer** - Redraws entire canvas on each frame (60fps)
- **Camera** - Pan (middle mouse) and zoom (Ctrl+wheel) support
- **Shape Registry** - Pluggable renderers (rectangle, oval, diamond, arrow)
- **Command Pattern** - Undo/redo stack for all operations
- **A\* Router** - Arrow pathfinding around obstacles using 20px grid

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/synk.git
cd synk
```

2. Install dependencies

```bash
# Install server dependencies
cd synk-server
npm install

# Install web dependencies
cd ../synk-web
npm install
```

3. Set up environment variables

```bash
# synk-server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/synk"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"

# synk-web/.env
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

4. Run database migrations

```bash
cd synk-server
npx prisma migrate dev
```

5. Start the development servers

```bash
# Terminal 1 - Backend
cd synk-server
npm run dev

# Terminal 2 - Frontend
cd synk-web
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Using Docker

```bash
docker-compose up
```
