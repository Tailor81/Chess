"""FastAPI server skeleton for real-time chess.

This intentionally keeps networking logic minimal so we can iterate quickly.

Routes
------
GET /create               → generates and returns a new 8-char game_id.
WS  /ws/{game_id}/{color} → joins game room as white/black, exchanges JSON:
    {
        "type": "move", "uci": "e2e4"       }  client → server
    {
        "type": "move", "uci": "e2e4", "fen": "…" }  server → clients
    { "type": "game_over", "result": "1-0" }        server → clients
    { "type": "init", "fen": "…" }                   server → client on connect
"""
from __future__ import annotations

from typing import Dict
from uuid import uuid4

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .chess_game import ChessGame

app = FastAPI(title="Realtime Chess Server")

# Serve all static assets under /static to avoid clashing with API & WS routes
app.mount("/static", StaticFiles(directory="frontend", html=False), name="static")

# Serve vendor chessboardjs assets (they live at project root)
app.mount("/chessboardjs-1.0.0", StaticFiles(directory="chessboardjs-1.0.0"), name="chessboardjs")

# Root path just returns index.html
@app.get("/")
async def root() -> FileResponse:
    return FileResponse("frontend/index.html")


class ConnectionManager:
    """Tracks sockets and game state per room."""

    def __init__(self) -> None:
        self.games: Dict[str, ChessGame] = {}
        self.clients: Dict[str, Dict[str, WebSocket]] = {}

    # ------------------------------------------------------------------
    # Connection lifecycle helpers
    # ------------------------------------------------------------------

    async def connect(self, game_id: str, color: str, ws: WebSocket) -> None:
        await ws.accept()
        self.clients.setdefault(game_id, {})[color] = ws
        # First player creates the server-authoritative game object.
        self.games.setdefault(game_id, ChessGame())

    def get_opponent(self, game_id: str, color: str) -> WebSocket | None:
        opp_color = "white" if color == "black" else "black"
        return self.clients.get(game_id, {}).get(opp_color)

    async def broadcast(self, game_id: str, payload: dict) -> None:
        """Send *payload* to every client in the room."""
        for ws in self.clients.get(game_id, {}).values():
            await ws.send_json(payload)

    async def disconnect(self, game_id: str, color: str) -> None:
        self.clients.get(game_id, {}).pop(color, None)
        # Purge room when no players remain.
        if not self.clients.get(game_id):
            self.clients.pop(game_id, None)
            self.games.pop(game_id, None)


manager = ConnectionManager()


# ----------------------------------------------------------------------
# REST endpoints
# ----------------------------------------------------------------------

@app.get("/create")
def create_game() -> dict[str, str]:
    """Return a fresh game_id so the frontend can build a join URL."""
    game_id = uuid4().hex[:8]
    return {"game_id": game_id}


# ----------------------------------------------------------------------
# WebSocket endpoint
# ----------------------------------------------------------------------

@app.websocket("/ws/{game_id}/{color}")
async def game_ws(ws: WebSocket, game_id: str, color: str):
    if color not in {"white", "black"}:
        await ws.close(code=4000)
        return

    await manager.connect(game_id, color, ws)
    game = manager.games[game_id]

    # Send initial board state.
    await ws.send_json({"type": "init", "fen": game.fen()})

    try:
        while True:
            data = await ws.receive_json()
            if data.get("type") != "move":
                continue

            uci: str = data.get("uci", "")
            if not game.move(uci):
                continue  # illegal, ignore for now (could send error)

            await manager.broadcast(game_id, {"type": "move", "uci": uci, "fen": game.fen()})

            if game.is_over():
                await manager.broadcast(game_id, {"type": "game_over", "result": game.result()})
    except WebSocketDisconnect:
        await manager.disconnect(game_id, color)