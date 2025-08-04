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
- Added click-to-move controls with legal-move highlighting
- Added audio feedback (move / capture / check / game end)
- Added king-in-check red highlight & UI status messages
- Added side-selection controls and play-again button
- Fixed pawn promotion sync; now prompts immediately with chosen piece
- Integrated smooth piece animation speeds
