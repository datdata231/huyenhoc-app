"""Web Push Service for Daily 8:00 AM Notifications and PWA Messaging."""
from __future__ import annotations

import base64
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from pywebpush import WebPushException, webpush

from backend.config import (
    DEFAULT_TIMEZONE,
    VAPID_CLAIMS_EMAIL,
    VAPID_PRIVATE_KEY,
    VAPID_PUBLIC_KEY,
)
from backend.services.storage import (
    add_push_subscription,
    delete_push_subscription,
    list_push_subscriptions,
)

logger = logging.getLogger(__name__)


def get_private_pem() -> str:
    """Decodes private key from base64 or returns as string."""
    key = VAPID_PRIVATE_KEY.strip()
    if key.startswith("-----BEGIN"):
        return key
    try:
        decoded = base64.b64decode(key).decode("utf-8")
        if decoded.startswith("-----BEGIN"):
            return decoded
    except Exception:
        pass
    return key


def send_web_push(subscription_info: Dict[str, Any], payload: Dict[str, Any]) -> bool:
    """Sends a single web push notification to a browser subscription."""
    try:
        sub_data = {
            "endpoint": subscription_info["endpoint"],
            "keys": {
                "p256dh": subscription_info["p256dh"],
                "auth": subscription_info["auth"],
            },
        }

        private_key = get_private_pem()
        webpush(
            subscription_info=sub_data,
            data=json.dumps(payload),
            vapid_private_key=private_key,
            vapid_claims={"sub": VAPID_CLAIMS_EMAIL},
        )
        return True
    except WebPushException as ex:
        logger.warning(f"WebPushException sending to {subscription_info.get('endpoint')[:40]}...: {ex}")
        # 404 or 410 means subscription is expired or unregistered
        if ex.response is not None and ex.response.status_code in (404, 410):
            logger.info("Cleaning up expired push subscription...")
            delete_push_subscription(subscription_info["endpoint"])
        return False
    except Exception as e:
        logger.error(f"Error sending push: {e}")
        return False


def broadcast_daily_8am_notification() -> Dict[str, Any]:
    """Broadcasts the morning 8:00 AM Eastern Numerology notification to all subscribed phones."""
    subscriptions = list_push_subscriptions()
    if not subscriptions:
        logger.info("No active push subscriptions found.")
        return {"status": "ok", "total": 0, "sent": 0, "failed": 0}

    now_str = datetime.now().strftime("%d/%m/%Y")
    payload = {
        "title": "Huyền Học Ngày Mới 🌿 (8:00 AM)",
        "body": f"Giờ Thìn cát khí ngày {now_str}: Bàn Kỳ Môn & Vận trình hôm nay đã sẵn sàng. Chạm để xem lời dặn ngày mới!",
        "url": "/?src=notification_8am",
        "icon": "/icon-192.png",
        "badge": "/icon-192.png",
    }

    sent = 0
    failed = 0
    for sub in subscriptions:
        ok = send_web_push(sub, payload)
        if ok:
            sent += 1
        else:
            failed += 1

    return {
        "status": "ok",
        "total": len(subscriptions),
        "sent": sent,
        "failed": failed,
        "timestamp": datetime.now().isoformat(),
    }
