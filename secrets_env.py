"""
Read API keys without ever putting them in the repo.

Order: the process environment first (GitHub Actions secrets), then the local, gitignored
`.env` file next to this script (KEY=value lines; template in .env.example).

    from secrets_env import secret
    key = secret("REINFOLIB_API_KEY")          # None when not configured
"""

import os
from pathlib import Path

ENV_FILE = Path(__file__).with_name(".env")


def _dotenv():
    out = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def secret(name, required=False):
    val = os.environ.get(name) or _dotenv().get(name) or None
    if required and not val:
        raise SystemExit(f"{name} is not set (environment or .env — see .env.example)")
    return val
