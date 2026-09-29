# backend/database.py
"""SQLAlchemy database configuration with Supabase PostgreSQL support."""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "quantum_learn.db"


def _load_local_env() -> None:
    """Load backend/.env for local runs without overriding real environment variables."""
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_local_env()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
IS_PRODUCTION = os.getenv("APP_ENV", "development").lower() in {"production", "prod"}

if DATABASE_URL:
    # SQLAlchemy expects the driver-qualified PostgreSQL scheme.
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgres://"):]
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]
elif IS_PRODUCTION and SUPABASE_URL:
    raise RuntimeError(
        "Supabase REST URL detected, but no PostgreSQL connection string was configured. "
        "Set SUPABASE_DB_URL or DATABASE_URL from Supabase Dashboard > Connect."
    )
else:
    DATABASE_URL = f"sqlite:///{DB_PATH}"

is_sqlite = DATABASE_URL.startswith("sqlite")
engine_options = {
    "connect_args": {"check_same_thread": False} if is_sqlite else {"connect_timeout": 10},
    "pool_pre_ping": True,
    "pool_recycle": 1800,
    "echo": False,
}
if not is_sqlite:
    engine_options.update({"pool_size": 5, "max_overflow": 10})

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency for yielding database session with auto-cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
