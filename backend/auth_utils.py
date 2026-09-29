# backend/auth_utils.py
"""
Authentication and Password Utilities.
Provides robust password hashing with fallback and JWT token generation/validation.
"""

import hashlib
import hmac
import os
import time
import json
from typing import Optional, Dict, Any

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "quantum_learn_super_secure_development_secret_2026")
ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 86400 * 7  # 7 days


def hash_password(password: str) -> str:
    """Generate a salted SHA-256 hash with HMAC for reliable multi-platform support."""
    salt = "ql_salt_v1_"
    return hmac.new(SECRET_KEY.encode('utf-8'), (salt + password).encode('utf-8'), hashlib.sha256).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    return hmac.compare_digest(hash_password(plain_password), hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    """Create lightweight signature-verified token."""
    payload = data.copy()
    now = int(time.time())
    expire = now + (expires_delta if expires_delta else TOKEN_EXPIRY_SECONDS)
    payload.update({"iat": now, "exp": expire})
    
    payload_bytes = json.dumps(payload, sort_keys=True).encode('utf-8')
    sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()
    
    import base64
    encoded_payload = base64.urlsafe_b64encode(payload_bytes).decode('utf-8')
    return f"ql.{encoded_payload}.{sig}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify token validity."""
    if not token or not token.startswith("ql."):
        return None
    parts = token.split(".")
    if len(parts) != 3:
        return None
    
    encoded_payload = parts[1]
    sig = parts[2]
    
    import base64
    try:
        payload_bytes = base64.urlsafe_b64decode(encoded_payload.encode('utf-8'))
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(payload_bytes.decode('utf-8'))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None
