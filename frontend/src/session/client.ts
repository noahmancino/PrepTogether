type Highlight = {
  id: string;
  startIndex: number;
  endIndex: number;
  type: string;
};

export type SessionEvent =
  | { type: 'highlight'; highlight: Highlight }
  | { type: 'search'; term: string }
  | { type: 'state_update'; patch: unknown }
  | { type: 'view'; view: string }
  | { type: 'question_index'; index: { section: number; question: number } }
  | {
      type: 'state';
      timer: number;
      highlights: Highlight[];
      search: string;
      state: unknown;
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

export async function createSession(state: unknown) {
  const resp = await fetch('http://localhost:8000/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!resp.ok) throw new Error(`Failed to create session: ${resp.status} ${resp.statusText}`);
  return resp.json() as Promise<{ session_id: string; host_token: string }>;
}

export async function joinSession(sessionId: string) {
  const resp = await fetch(`http://localhost:8000/sessions/${sessionId}/join`, {
    method: 'POST',
  });
  if (!resp.ok) throw new Error('Failed to join session');
  return resp.json() as Promise<{ participant_token: string }>;
}

export async function endSession(sessionId: string, token: string) {
  const resp = await fetch(`http://localhost:8000/sessions/${sessionId}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!resp.ok) throw new Error('Failed to end session');
}