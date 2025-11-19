# 1. Project Title

ChatHTML – Lightweight Local Real-Time Chat Application

# 2. Problem Statement

Students, small teams, and local groups often need a quick, low-friction chat system for collaboration without accounts, cloud setup, or database overhead. Existing tools can be heavy, require logins, or depend on external services. This project addresses the need for a simple, local, real-time chat that works immediately on a LAN or single machine.

# 3. Solution Overview

ChatHTML is a minimal real-time chat app that runs locally. A small Node.js + Express server hosts static frontend files and upgrades connections to WebSockets for real-time communication. The server broadcasts messages to all connected clients with no authentication or database, enabling instant, low-latency conversation for local teams.

# 4. Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, WebSocket library (ws)
- Environment: Node.js ≥ 16

Detected dependencies (typical):
- express
- ws

Optional dev tools (not required):
- nodemon

# 5. Core Features

- Real-time messaging
  - Why it matters: instant communication for quick coordination without refreshes.
- WebSocket-based broadcast system
  - Why it matters: efficient, low-latency message distribution across connected clients.
- Simple UI
  - Why it matters: minimal learning curve; immediate use in meetings or study groups.
- Lightweight local server
  - Why it matters: runs on a laptop or small VM with minimal resources; no cloud required.
- Auto-broadcast to all connected clients
  - Why it matters: everyone sees messages simultaneously without manual forwarding.

# 6. Setup & Run Instructions

1. Install Node.js (v16 or higher): https://nodejs.org/
2. Clone the repo:
   - git clone <repo-url>
   - cd chat-html
3. Install dependencies:
   - npm install
4. Run the server:
   - node server.js
   - (or) npm start if configured
5. Open the app in a browser:
   - http://localhost:3000
6. Open multiple browser tabs or machines on the same LAN to test real-time messaging.

# 7. .env.example

Example environment variables:

PORT=3000

# 8. Key Endpoints & APIs

- HTTP
  - GET /  — Serves the frontend static files (index.html, CSS, JS)
- WebSocket events (server-side)
  - connection — fired when a client connects
  - message — fired when a client sends a message to the server
  - broadcast — server broadcasts received messages to all connected clients

Typical message flow:
- Client -> server: JSON { type: "message", text: "...", name?: "..." }
- Server -> all clients: JSON { type: "broadcast", text: "...", from: "...", time?: "..." }

# 9. Impact & Metrics

- Low memory usage: small Node process and in-memory socket list only.
- Works offline: runs on local machine / LAN with no external dependencies.
- Near-zero latency over LAN: immediate delivery in typical local networks.
- Practical capacity: supports ~20–50 local users in typical sessions (depends on host machine and network).

# 10. What’s Next (Future Improvements)

Planned enhancements:
- Username support and lightweight presence indicators
- Chat history persistence (file or lightweight DB)
- Improved UI and accessibility
- Mobile responsiveness and touch improvements
- Message timestamps and ordering guarantees
- Theme support (light/dark)

# 11. Final Summary

ChatHTML is a focused, easy-to-run demonstration of real-time messaging using plain web technologies and a minimal Node.js server. It prioritizes clarity, simplicity, and educational value, making it ideal for demos, classroom use, and small-team local collaboration.

