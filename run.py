#!/usr/bin/env python3
"""Launch the AI Music Creator web server."""

import sys
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))


def main() -> None:
    print("\n  AI Music Creator")
    print("  ----------------")
    print("  Open http://127.0.0.1:8000 in your browser\n")
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
    )


if __name__ == "__main__":
    main()
