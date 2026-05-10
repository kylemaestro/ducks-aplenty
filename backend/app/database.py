import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_DEFAULT_DB = _BACKEND_ROOT / "data" / "ducks.db"


def get_db_path() -> Path:
    return Path(os.environ.get("DUCK_DB_PATH", _DEFAULT_DB))


@contextmanager
def get_connection():
    path = get_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
