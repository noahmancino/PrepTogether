from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def create_session_and_join():
    resp = client.post('/sessions', json={})
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


def test_websocket_timer_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws, \
            client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()  # init state
        user_ws.receive_json()  # init state
        host_ws.send_json({'type': 'timer', 'remaining': 123})
        message = user_ws.receive_json()
        assert message['type'] == 'timer'
        assert message['remaining'] == 123


def test_websocket_highlight_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws, \
            client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'highlight', 'highlight': {'id': 1, 'text': 'foo'}})
        message = user_ws.receive_json()
        assert message['type'] == 'highlight'
        assert message['highlight'] == {'id': 1, 'text': 'foo'}


def test_websocket_search_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws, \
            client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'search', 'term': 'logic'})
        message = user_ws.receive_json()
        assert message['type'] == 'search'
        assert message['term'] == 'logic'


def test_websocket_view_change():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws, \
            client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'view', 'view': 'display'})
        message = user_ws.receive_json()
        assert message['type'] == 'view'
        assert message['view'] == 'display'


def test_websocket_question_index_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws, \
            client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'question_index', 'index': {'section': 1, 'question': 2}})
        message = user_ws.receive_json()
        assert message['type'] == 'question_index'
        assert message['index'] == {'section': 1, 'question': 2}
