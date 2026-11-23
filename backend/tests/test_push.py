import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.storage import list_push_subscriptions

client = TestClient(app)


def test_vapid_public_key():
    response = client.get("/api/push/vapid-public-key")
    assert response.status_code == 200
    data = response.json()
    assert "publicKey" in data
    assert len(data["publicKey"]) > 20


def test_push_subscribe_and_cron():
    sub_payload = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/fake-test-token-12345",
        "keys": {
            "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVYOIxBOCYnuNTjmfdDhCLfBp92hO_gahJ5OctEICg",
            "auth": "tBHItJI5svbpez7KI4CCXg",
        },
        "profile_id": "test_profile",
    }

    # Subscribe endpoint
    sub_res = client.post("/api/push/subscribe", json=sub_payload)
    assert sub_res.status_code == 200
    assert sub_res.json()["status"] == "ok"

    # Verify subscription is saved in DB
    subs = list_push_subscriptions()
    assert any(s["endpoint"] == sub_payload["endpoint"] for s in subs)

    # Trigger daily 8am cron endpoint (should wake and broadcast)
    cron_res = client.post("/api/cron/daily-8am")
    assert cron_res.status_code == 200
    data = cron_res.json()
    assert data["status"] == "ok"
