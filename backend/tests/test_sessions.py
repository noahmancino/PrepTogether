import sys
from pathlib import Path
from datetime import datetime, timedelta
import asyncio
from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))
from main import app, SESSIONS, cleanup_sessions

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


def test_websocket_highlight_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws,             client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'highlight', 'highlight': {'id': 1, 'text': 'foo'}})
        message = user_ws.receive_json()
        assert message['type'] == 'highlight'
        assert message['highlight'] == {'id': 1, 'text': 'foo'}


def test_websocket_search_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws,             client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'search', 'term': 'logic'})
        message = user_ws.receive_json()
        assert message['type'] == 'search'
        assert message['term'] == 'logic'


def test_websocket_view_change():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws,             client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'view', 'view': 'display', 'testId': 't1'})
        message = user_ws.receive_json()
        assert message['type'] == 'view'
        assert message['view'] == 'display'
        assert message['testId'] == 't1'


def test_websocket_question_index_sync():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws,             client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'question_index', 'index': {'section': 1, 'question': 2}})
        message = user_ws.receive_json()
        assert message['type'] == 'question_index'
        assert message['index'] == {'section': 1, 'question': 2}


def test_websocket_question_update_and_reset():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws,             client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({
            'type': 'question_update',
            'testId': 't1',
            'sectionIndex': 0,
            'questionIndex': 0,
            'question': {'stem': 's', 'choices': ['a', 'b'], 'selectedChoice': 1}
        })
        message = user_ws.receive_json()
        assert message['type'] == 'question_update'
        assert message['question']['stem'] == 's'

        host_ws.send_json({'type': 'reset_test', 'testId': 't1'})
        message = user_ws.receive_json()
        assert message['type'] == 'reset_test'
        assert message['testId'] == 't1'


def test_websocket_submit_test():
    session_id, host_token, participant_token = create_session_and_join()
    with client.websocket_connect(f"/ws/{session_id}?token={host_token}") as host_ws,             client.websocket_connect(f"/ws/{session_id}?token={participant_token}") as user_ws:
        host_ws.receive_json()
        user_ws.receive_json()
        host_ws.send_json({'type': 'submit_test', 'testId': 't1'})
        message = user_ws.receive_json()
        assert message['type'] == 'submit_test'
        assert message['testId'] == 't1'


def test_session_expires_after_two_hours():
    session_id, host_token, participant_token = create_session_and_join()
    session = SESSIONS[session_id]
    session.created_at = datetime.utcnow() - timedelta(hours=3)
    asyncio.get_event_loop().run_until_complete(cleanup_sessions())
    assert session_id not in SESSIONS


def test_session_removed_after_idle():
    session_id, host_token, participant_token = create_session_and_join()
    session = SESSIONS[session_id]
    session.last_active = datetime.utcnow() - timedelta(minutes=6)
    asyncio.get_event_loop().run_until_complete(cleanup_sessions())
    assert session_id not in SESSIONS
