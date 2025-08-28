import type {AppState, Question} from "../Types.tsx";
import { BACKEND_HOST, BACKEND_PORT } from "../config";

type Highlight = {
  id: string;
  startIndex: number;
  endIndex: number;
  type: string;
};

export type SessionEvent =
  | { type: 'highlight'; highlight: Highlight }
  | { type: 'search'; term: string }
  | { type: 'view'; view: AppState['viewMode']; testId?: string }
  | { type: 'question_index'; index: { section: number; question: number } }
  | {
      type: 'question_update';
      testId: string;
      sectionIndex: number;
      questionIndex: number;
      question: Question;
    }
  | { type: 'reset_test'; testId: string }
  | { type: 'submit_test'; testId: string }
  | { type: 'error'; message: string }
  | {
      type: 'state';
      state: AppState;
      highlights: Highlight[];
      search: string;
      view: string;
      question_index: { section: number; question: number };
    };

export type SessionConnection = {
  send: (event: SessionEvent) => void;
  close: () => void;
};

export function connectSession(
  sessionId: string,
  token: string,
  onEvent: (event: SessionEvent) => void
): SessionConnection {
  const ws = new WebSocket(`ws://${BACKEND_HOST}:${BACKEND_PORT}/ws/${sessionId}?token=${token}`);
  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      onEvent(data as SessionEvent);
    } catch (err) {
      console.error('Failed to parse session message', err);
    }
  };
  return {
    send: (event: SessionEvent) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(event)),
    close: () => ws.close(),
  };
}

export async function createSession(state: AppState) {
  const resp = await fetch(`http://${BACKEND_HOST}:${BACKEND_PORT}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!resp.ok) throw new Error(`Failed to create session: ${resp.status} ${resp.statusText}`);
  return resp.json() as Promise<{ session_id: string; host_token: string }>;
}

export async function joinSession(sessionId: string) {
  const resp = await fetch(`http://${BACKEND_HOST}:${BACKEND_PORT}/sessions/${sessionId}/join`, {
    method: 'POST',
  });
  if (!resp.ok) throw new Error('Failed to join session');
  return resp.json() as Promise<{
    state: AppState;
    participant_token: string }>;
}

export async function endSession(sessionId: string, token: string) {
  const resp = await fetch(`http://${BACKEND_HOST}:${BACKEND_PORT}/sessions/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, token: token }),
  });
  if (!resp.ok) throw new Error('Failed to end session');
}
