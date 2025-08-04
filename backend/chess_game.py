from __future__ import annotations

"""Minimal server-side chess game wrapper.

This class encapsulates a `python-chess` `Board` and exposes very small helper
methods we will need from the FastAPI WebSocket endpoint:
    • move(uci) – apply a UCI move string if legal.
    • fen() – current board FEN.
    • is_over() – whether the game is finished.
    • result() – PGN-style result (e.g. "1-0", "0-1", "1/2-1/2").

We keep it deliberately tiny so that future iterations (clock support, takebacks,
three-fold repetition, etc.) can layer on without rewriting the endpoint.
"""

import chess


class ChessGame:
    """Server-authoritative game state."""

    def __init__(self) -> None:
        self.board: chess.Board = chess.Board()


    def move(self, uci: str) -> bool:
        """Attempt to play *uci* on the board.

        Returns True if the move was legal and pushed; False otherwise.
        """
        try:
            move = self.board.parse_uci(uci)
        except ValueError:
            return False

        if move not in self.board.legal_moves:
            return False

        self.board.push(move)
        return True

    def fen(self) -> str:
        """Return current position in FEN format."""
        return self.board.fen()

    def is_over(self) -> bool:
        """True if game finished (checkmate, stalemate, etc.)."""
        return self.board.is_game_over()

    def result(self) -> str | None:
        """Return PGN-style result string if game over, else None."""
        if not self.board.is_game_over():
            return None
        return self.board.result()