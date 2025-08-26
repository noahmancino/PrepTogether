"""FastAPI backend providing collaborative session functionality."""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import local_config
from fastapi import Body, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from schemas import AppState
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

class Session:
    """Simple in-memory representation of a collaborative session."""

    def __init__(self, host_token: str, state: AppState) -> None:
        self.host_token = host_token
        self.participants: set[str] = set()
        self.connections: Dict[str, WebSocket] = {}
        self.highlights: List[dict] = []
        self.search: str = ""
        # store a plain dict for easy mutation
        self.state: Dict = state.dict()
        self.view: str = self.state.get("viewMode", "home")
        self.active_test_id: Optional[str] = self.state.get("activeTestId")
        self.question_index: dict = {"section": 0, "question": 0}
        now = datetime.utcnow()
        self.created_at: datetime = now
        self.last_active: datetime = now


# session_id -> Session
SESSIONS: Dict[str, Session] = {}

SESSION_MAX_AGE = timedelta(hours=2)
SESSION_IDLE_TIMEOUT = timedelta(minutes=5)


def session_expired(session: Session) -> bool:
    now = datetime.utcnow()
    if now - session.created_at > SESSION_MAX_AGE:
        return True
    if not session.connections and now - session.last_active > SESSION_IDLE_TIMEOUT:
        return True
    return False


async def cleanup_sessions() -> None:
    now = datetime.utcnow()
    expired = [sid for sid, sess in SESSIONS.items() if session_expired(sess)]
    for sid in expired:
        session = SESSIONS.pop(sid, None)
        if session:
            for ws in list(session.connections.values()):
                try:
                    await ws.close()
                except Exception:
                    pass


async def _cleanup_loop() -> None:
    while True:
        await cleanup_sessions()
        await asyncio.sleep(60)


@app.on_event("startup")
async def _startup() -> None:
    asyncio.create_task(_cleanup_loop())

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
    if session is None or session_expired(session):
        SESSIONS.pop(session_id, None)
        raise HTTPException(status_code=404, detail="Session not found")

    session.last_active = datetime.utcnow()
    participant_token = uuid.uuid4().hex
    session.participants.add(participant_token)
    return {
        "participant_token": participant_token,
        "session_id": session_id,
        "state": session.state,
    }


@app.post("/sessions/{session_id}/leave")
async def leave_session(session_id: str, token: str) -> None:
    """Leave a session."""
    session = SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    session.participants.discard(token)
    session.last_active = datetime.utcnow()
    if not session.participants and not session.connections:
        SESSIONS.pop(session_id, None)


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------


async def broadcast(session: Session, message: dict) -> None:
    """Broadcast a message to all connected clients of a session."""
    session.last_active = datetime.utcnow()
    disconnected = []
    for token, connection in list(session.connections.items()):
        try:
            await connection.send_json(message)
        except Exception:
            disconnected.append(token)

    for token in disconnected:
        session.connections.pop(token, None)


@app.websocket("/ws/{session_id}")
async def session_ws(websocket: WebSocket, session_id: str, token: str) -> None:
    """Handle websocket connections for a session."""
    session = SESSIONS.get(session_id)
    if session is None or session_expired(session):
        SESSIONS.pop(session_id, None)
        await websocket.close(code=4004)
        return

    # validate token
    if token != session.host_token and token not in session.participants:
        await websocket.close(code=4401)
        return

    await websocket.accept()
    session.connections[token] = websocket
    session.last_active = datetime.utcnow()

    # send current state
    await websocket.send_json(
        {
            "type": "state",
            "state": session.state,
            "highlights": session.highlights,
            "search": session.search,
            "view": session.view,
            "question_index": session.question_index,
        }
    )

    try:
        while True:
            data = await websocket.receive_json()
            session.last_active = datetime.utcnow()
            msg_type = data.get("type")

            if msg_type == "highlight":
                highlight = data.get("highlight")
                if highlight is not None:
                    session.highlights.append(highlight)
            elif msg_type == "search":
                session.search = data.get("term", "")
            elif msg_type == "view":
                session.view = data.get("view", "home")
                test_id = data.get("testId")
                session.state["viewMode"] = session.view
                session.highlights = []
                session.search = ""
                if test_id is not None:
                    session.state["activeTestId"] = test_id
                    session.active_test_id = test_id
                    data["testId"] = test_id
                else:
                    session.state["activeTestId"] = None
                    session.active_test_id = None
            elif msg_type == "question_index":
                index = data.get("index")
                if isinstance(index, dict):
                    session.question_index = index
                    session.highlights = []
                    session.search = ""
            elif msg_type == "question_update":
                test_id = data.get("testId")
                section_idx = data.get("sectionIndex")
                question_idx = data.get("questionIndex")
                question = data.get("question")
                try:
                    session.state.setdefault("tests", {})
                    session.state["tests"].setdefault(test_id, {"sections": []})
                    sections = session.state["tests"][test_id].setdefault("sections", [])
                    while len(sections) <= section_idx:
                        sections.append({"passage": "", "questions": []})
                    questions = sections[section_idx].setdefault("questions", [])
                    while len(questions) <= question_idx:
                        questions.append({})
                    questions[question_idx] = question
                except Exception:
                    pass
            elif msg_type == "reset_test":
                test_id = data.get("testId")
                test = session.state.get("tests", {}).get(test_id)
                if test:
                    for section in test.get("sections", []):
                        for q in section.get("questions", []):
                            q.pop("selectedChoice", None)
                            q.pop("revealedIncorrectChoice", None)
                            q.pop("eliminatedChoices", None)
            elif msg_type == "submit_test":
                pass

            await broadcast(session, data)
    except WebSocketDisconnect:
        pass
    except Exception:
        logging.exception("Websocket error in session %s", session_id)
    finally:
        session.connections.pop(token, None)
        session.participants.discard(token)
        if not session.connections:
            session.last_active = datetime.utcnow()


# ---------------------------------------------------------------------------
# Basic sanity check endpoints
# ---------------------------------------------------------------------------


@app.get("/")
async def root() -> dict:
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str) -> dict:
    return {"message": f"Hello {name}"}

