"""Configuration module for Numerology Backend."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env if present
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

VENDOR_DIR = BASE_DIR / "vendor" / "Numerologist_skills"
DATA_DIR = BASE_DIR / "backend" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "numerology.db"

# LLM Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Default Timezone
DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh"

# VAPID Web Push Keys for Daily 8:00 AM Notifications
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "BAbr7Tx30mOZOJd5wkGSpTBXtx63-jwRdHL5tDYdnh9qzp20HC-Jv58hRRsQYOI3ReiuYAG3lBGVuAGpkEKaamk")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JR0hBZ0VBTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEJHMHdhd0lCQVFRZzEvb2cxUVFscW9DNm9qYjIKaWNFMmt1ZzJXTkNOSVZDVndvVkpUc3p4RC9taFJBTkNBQVFHNiswOGQ5SmptVGlYZWNKQmtxVXdWN2NldC9vOApFWFJ5K2JRMkhaNGZhczZkdEJ3dmliK2ZJVVViRUdEaU4wWG9ybUFCdDVRUmxiZ0JxWkJDbW1wcAotLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tCg==")
VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:datdata231@users.noreply.github.com")
