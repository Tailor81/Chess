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
- Game status display
- Player color indication
- Error notifications

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
4. Make moves by clicking and dragging pieces
5. Watch for real-time updates from your opponent

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
