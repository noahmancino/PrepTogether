"""Configuration values for the backend service.

Values can be overridden with environment variables at runtime which makes the
service flexible for containerised deployments.
"""

import os


BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")

