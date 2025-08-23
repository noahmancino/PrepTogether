from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def create_session_and_join():
    resp = client.post('/sessions')
    data = resp.json()
    session_id = data['session_id']
    host_token = data['host_token']
    join_resp = client.post(f'/sessions/{session_id}/join')
    participant_token = join_resp.json()['participant_token']
    return session_id, host_token, participant_token


def test_create_and_join_session():
    session_id, host_token, participant_token = create_session_and_join()
    assert session_id
    assert host_token
    assert participant_token


def test_websocket_state_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws, \
            client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        # initial state is empty for both clients
        assert host_ws.receive_json() == {"type": "state", "state": {}}
        assert user_ws.receive_json() == {"type": "state", "state": {}}

        new_state = {"timer": 123, "search": "logic", "highlights": [1, 2]}
        host_ws.send_json({"type": "state", "state": new_state})
        message = user_ws.receive_json()
        assert message["type"] == "state"
        assert message["state"] == new_state
