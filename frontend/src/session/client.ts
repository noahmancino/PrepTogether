import type {AppState} from "../Types.tsx";

export type SessionEvent =
  | { type: 'timer'; remaining: number }
  | { type: 'highlight'; highlight: any }
  | { type: 'search'; term: string };

export type SessionConnection = {
  send: (event: SessionEvent) => void;
  close: () => void;
};

export function connectSession(
  sessionId: string,
  token: string,
  onEvent: (event: SessionEvent) => void
): SessionConnection {
  const ws = new WebSocket(`ws://localhost:8000/ws/${sessionId}?token=${token}`);
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

export async function createSession() {
  const resp = await fetch('http://localhost:8000/sessions', { method: 'POST' });
  if (!resp.ok) throw new Error(`Failed to create session: ${resp.status} ${resp.statusText}`);
  return resp.json() as Promise<{ session_id: string; host_token: string }>;
}

export async function joinSession(sessionId: string) {
  const resp = await fetch(`/sessions/${sessionId}/join`, { method: 'POST' });
  if (!resp.ok) throw new Error('Failed to join session');
  return resp.json() as Promise<{ participant_token: string }>;
}
