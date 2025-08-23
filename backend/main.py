"""FastAPI backend providing collaborative session functionality."""

from __future__ import annotations

import uuid
from typing import Dict

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect


app = FastAPI()


# ---------------------------------------------------------------------------
# In-memory session management
# ---------------------------------------------------------------------------


class Session:
    """Simple in-memory representation of a collaborative session."""

    def __init__(self, host_token: str) -> None:
        self.host_token = host_token
        self.participants: set[str] = set()
        self.connections: Dict[str, WebSocket] = {}
        # store the entire shared application state for the session
        self.state: dict = {}


# session_id -> Session
SESSIONS: Dict[str, Session] = {}


# ---------------------------------------------------------------------------
# HTTP endpoints
# ---------------------------------------------------------------------------


@app.post("/sessions")
async def create_session() -> dict:
    """Create a new collaborative session and return identifiers."""
    session_id = uuid.uuid4().hex
    host_token = uuid.uuid4().hex
    SESSIONS[session_id] = Session(host_token=host_token)
    return {"session_id": session_id, "host_token": host_token}


@app.post("/sessions/{session_id}/join")
async def join_session(session_id: str) -> dict:
    """Join an existing session and receive a participant token."""
    session = SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    participant_token = uuid.uuid4().hex
    session.participants.add(participant_token)
    return {"participant_token": participant_token}


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------


async def broadcast(session: Session, message: dict) -> None:
    """Broadcast a message to all connected clients of a session."""
    disconnected = []
    for token, connection in session.connections.items():
        try:
            await connection.send_json(message)
        except WebSocketDisconnect:
            disconnected.append(token)

    for token in disconnected:
        session.connections.pop(token, None)


@app.websocket("/ws/{session_id}")
async def session_ws(websocket: WebSocket, session_id: str, token: str) -> None:
    """Handle websocket connections for a session."""
    session = SESSIONS.get(session_id)
    if session is None:
        await websocket.close(code=4004)
        return

    # validate token
    if token != session.host_token and token not in session.participants:
        await websocket.close(code=4401)
        return

    await websocket.accept()
    session.connections[token] = websocket

    # send current state
    await websocket.send_json({"type": "state", "state": session.state})

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "state":
                # replace the session's shared state with the provided one
                session.state = data.get("state", {})
                # broadcast the authoritative state to all clients
                await broadcast(session, {"type": "state", "state": session.state})
            else:
                # forward any other message types unchanged
                await broadcast(session, data)
    except WebSocketDisconnect:
        pass
    finally:
        session.connections.pop(token, None)
        session.participants.discard(token)


# ---------------------------------------------------------------------------
# Basic sanity check endpoints
# ---------------------------------------------------------------------------


@app.get("/")
async def root() -> dict:
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str) -> dict:
    return {"message": f"Hello {name}"}

