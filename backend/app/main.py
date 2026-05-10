import json
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_connection

app = FastAPI(title="Duck Picker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _row_to_species(row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "scientific_name": row["scientific_name"],
    }


def _parse_citations(raw: str | None) -> list[str]:
    if not raw or not raw.strip():
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(u) for u in data if isinstance(u, str) and u.strip()]
        return []
    except json.JSONDecodeError:
        return []


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/facts/random")
def random_facts(count: int = 3):
    """One random fact per species, then `count` species chosen at random."""
    if count < 1 or count > 10:
        raise HTTPException(status_code=400, detail="count must be between 1 and 10")
    with get_connection() as conn:
        n_species = conn.execute(
            "SELECT COUNT(DISTINCT species_id) FROM fun_facts"
        ).fetchone()[0]
        if n_species < count:
            raise HTTPException(
                status_code=503,
                detail="Not enough species with facts in database. Run the seed script.",
            )
        cur = conn.execute(
            """
            SELECT id, fact, citations FROM (
                SELECT id, fact, citations,
                       ROW_NUMBER() OVER (PARTITION BY species_id ORDER BY RANDOM()) AS rn
                FROM fun_facts
            )
            WHERE rn = 1
            ORDER BY RANDOM()
            LIMIT ?
            """,
            (count,),
        )
        rows = cur.fetchall()
    if len(rows) < count:
        raise HTTPException(
            status_code=503,
            detail="Could not sample enough distinct clues. Run the seed script.",
        )
    return {
        "facts": [
            {
                "id": r["id"],
                "fact": r["fact"],
                "citations": _parse_citations(r["citations"]),
            }
            for r in rows
        ]
    }


@app.get("/api/facts/{fact_id}/reveal")
def reveal_fact(fact_id: int):
    with get_connection() as conn:
        cur = conn.execute(
            """
            SELECT f.id AS fact_id, f.fact, f.citations,
                   s.id AS species_id, s.name, s.scientific_name
            FROM fun_facts f
            JOIN species s ON s.id = f.species_id
            WHERE f.id = ?
            """,
            (fact_id,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Fact not found")
    return {
        "duck": {
            "id": row["species_id"],
            "name": row["name"],
            "scientific_name": row["scientific_name"],
        },
        "fun_fact": row["fact"],
        "citations": _parse_citations(row["citations"]),
    }
