"""FastAPI backend providing collaborative session functionality."""

from __future__ import annotations

import uuid
from typing import Dict, List
import local_config
from fastapi import Body, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from schemas import AppState, Test, Section, Question
import logging

logging.basicConfig(level=logging.INFO)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[local_config.client_address],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# In-memory session management
# ---------------------------------------------------------------------------
class appState:



class Session:
    """Simple in-memory representation of a collaborative session."""

    def __init__(self, host_token: str, state: AppState) -> None:
        self.host_token = host_token
        self.participants: set[str] = set()
        self.connections: Dict[str, WebSocket] = {}
        self.highlights: List[dict] = []
        self.search: str = ""
        self.state: AppState = state
        self.question_index: dict = {"section": 0, "question": 0}


# session_id -> Session
SESSIONS: Dict[str, Session] = {}

# ---------------------------------------------------------------------------
# HTTP endpoints
# ---------------------------------------------------------------------------


@app.post("/sessions")
async def create_session(state: AppState) -> dict:
    """Create a new collaborative session and return identifiers."""
    print("creating session... ", end="", flush=True)
    session_id = uuid.uuid4().hex
    host_token = uuid.uuid4().hex
    SESSIONS[session_id] = Session(host_token=host_token, state=state)
    return {"session_id": session_id, "host_token": host_token}

@app.post("/sessions/{session_id}/join")
async def join_session(session_id: str) -> dict:
    """Join an existing session and receive a participant token."""
    session = SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    participant_token = uuid.uuid4().hex
    session.participants.add(participant_token)
    return {"participant_token": participant_token, "session_id": session_id, "state": session.state}


@app.post("/sessions/{session_id}/leave")
async def leave_session(session_id: str, token: str) -> None:
    """Leave a session."""
    session = SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    else:
        session.participants.discard(token)
        if not session.participants:
            SESSIONS.pop(session_id)


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
    await websocket.send_json(
        {
            "type": "state",
            "highlights": session.highlights,
            "search": session.search,
            "view": session.view,
            "question_index": session.question_index,
        }
    )

    try:
        while True:
            data = await websocket.receive_json()
            print(data)
            msg_type = data.get("type")

            if msg_type == "highlight":
                highlight = data.get("highlight")
                if highlight is not None:
                    session.highlights.append(highlight)
            elif msg_type == "search":
                session.search = data.get("term", "")
            elif msg_type == "view":
                session.view = data.get("view", "home")
                session.state["viewMode"] = session.view
                session.highlights = []
                session.search = ""
            elif msg_type == "question_index":
                index = data.get("index")
                if isinstance(index, dict):
                    session.question_index = index
                    session.highlights = []
                    session.search = ""
            else:
                message = "invalid or missing message type: " + str(msg_type)
                data = {"type": "error", "message": message}

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

