# Real-Time Multiplayer Chess

A real-time two-player multiplayer chess game built with FastAPI and chessboard.js, featuring full chess rules and WebSocket-based communication.

## 🎮 Overview

This project implements a complete multiplayer chess system where players can:
- Join or create a game using a unique game ID
- Get automatically assigned white or black pieces based on join order
- Play chess with full rule enforcement
- See opponent's moves in real-time
- Experience seamless gameplay with server-side validation

## 🔧 Key Features

### ♟️ Gameplay
- Complete turn-based gameplay for 2 players
- Full chess rule enforcement:
  - Check and checkmate detection
  - Legal move validation
  - Special moves (castling, en passant, pawn promotion)
  - Stalemate detection
- Server-side move validation using python-chess
- Click-to-move or drag-and-drop piece interaction
- Instant promotion dialog with choice of **Queen / Rook / Bishop / Knight**

### 🔄 Real-Time Communication
- WebSocket-based real-time updates using FastAPI
- Simple room system for game isolation
- Instant move broadcasting to opponents
- Real-time game status messages
- Automated game state management

### 🖥️ Frontend
- Clean and responsive chess board using chessboard.js
- Simple and intuitive UI
- Real-time move updates
- Game status display (whose turn, check, checkmate, stalemate)
- Player color indication & pre-game side selection (White, Black, Random)
- Error notifications
- Highlight legal destination squares on selection
- Red highlight on king in check
- Built-in sounds for move, capture, check, and game end
- Play-again button to reload a fresh board

## 🧠 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend | FastAPI | REST + WebSocket server |
| Real-time Communication | FastAPI WebSocket | Two-way messaging |
| Chess Logic | python-chess | Move validation & rules |
| Frontend | HTML + JS + chessboard.js | UI & Interaction |
| State Management | In-memory/Redis | Session & move storage |

## 🚀 Getting Started

### Prerequisites
- Python 3.7+
- Node.js (for package management)
- Redis (optional, for scalable state management)

### Installation
1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn python-chess websockets
   ```
3. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
4. Open `http://localhost:8000` in your browser

## 🎯 How to Play

1. Open the game URL in your browser
2. Create a new game or join an existing one with a game ID
3. Wait for an opponent (if creating a new game)
4. Make moves by clicking **once** on a piece then on a highlighted square, **or** drag & drop as usual
5. Choose a promotion piece when a pawn reaches the back rank
6. Listen for audio cues: move, capture, check, game over
7. Click **Play Again** to start a new match

## 🔍 Project Structure

```
├── backend/
│   ├── main.py           # FastAPI application
│   ├── chess_game.py     # Chess game logic
│   └── websocket.py      # WebSocket handling
├── frontend/
│   ├── index.html        # Main game page
│   ├── js/              
│   │   └── game.js       # Game logic & WebSocket client
│   └── css/
│       └── styles.css    # Custom styling
└── chessboardjs-1.0.0/   # Chess board UI library
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 🆕 Recent Updates  
*(2025-08-04)*

### Frontend
- Added **local-play** mode via the “Start Game” button – lets you practice against yourself without opening a socket.
- Game-ID now displayed prominently, auto-copied to clipboard on *Create*.
- Colour selection logic revamped – creator is always **White**; joiner defaults to **Black** (or chosen side). UI prevents duplicate colours.
- Move ownership enforced: you can only move **your** pieces on **your** turn (both drag-and-drop and click-to-move).
- Rich debug logging (`[chess-debug] …`) to aid troubleshooting.

### Backend
- `ConnectionManager.connect()` now rejects duplicate-colour joins and returns a success flag.
- WebSocket handler aborts cleanly when a colour is already taken (no more `RuntimeError: Cannot call "send" once a close message has been sent`).

### UX
- Match info banner (`Game ID — playing as …`) stays visible after controls hide.
- Automatic clipboard copy plus larger font for easy sharing.

---

## 🌐 Deployment Guide

The server is a plain FastAPI + WebSocket app (no database). You can deploy **as-is** to any platform that supports long-lived WebSockets.

### Free-tier options
| Provider | Notes | One-liner start command |
|----------|-------|-------------------------|
| Render.com | Works out-of-box, auto-HTTPS | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| Railway.app | Quick GitHub import, add Redis later if horizontal scaling | same |
| Fly.io | Global edge runtime, generous free allowance | same |
| Heroku (eco dyno) | Sleeps when idle; add *Heroku-Redis* if multi-dyno | same |

1. Create **requirements.txt**:
   ```txt
   fastapi
   uvicorn[standard]
   python-chess
   ```
2. (Optional) `Procfile` for Heroku:
   ```procfile
   web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
3. Push to the chosen provider – that’s it.

### Room Persistence & Scaling
The current implementation stores game state in RAM. For multiple server instances you’ll need sticky sessions **or** a shared datastore (Redis). A minimal Redis adapter would store `fen` per `game_id` and load/persist on move.

---

## 🎮 Local Play vs Online Play
| Mode | How to start | Networking | Use case |
|------|--------------|------------|----------|
| Local | Click **Start Game** | none | Solo practice & testing |
| Online | **Create** → share ID → **Join** | WebSocket `/ws/{game_id}/{color}` | Real matches |

---
- Added click-to-move controls with legal-move highlighting
- Added audio feedback (move / capture / check / game end)
- Added king-in-check red highlight & UI status messages
- Added side-selection controls and play-again button
- Fixed pawn promotion sync; now prompts immediately with chosen piece
- Integrated smooth piece animation speeds
