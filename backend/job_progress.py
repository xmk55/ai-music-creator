"""Job progress tracking helpers."""

from __future__ import annotations

import time
from typing import Callable

ProgressCallback = Callable[[str, int, str], None]


def make_job_updater(jobs: dict, job_id: str) -> ProgressCallback:
    def update(stage: str, progress: int, message: str) -> None:
        job = jobs.get(job_id)
        if not job:
            return
        started = job.get("started_at", time.time())
        job.update(
            {
                "stage": stage,
                "progress": max(0, min(100, progress)),
                "message": message,
                "elapsed_seconds": round(time.time() - started, 1),
            }
        )

    return update


class ProgressTicker:
    """Bump progress during long blocking calls based on elapsed vs estimated time."""

    def __init__(
        self,
        on_progress: ProgressCallback,
        stage: str,
        start_pct: int,
        end_pct: int,
        estimated_seconds: float,
        message_fn: Callable[[float, float], str],
    ) -> None:
        self._on_progress = on_progress
        self._stage = stage
        self._start_pct = start_pct
        self._end_pct = end_pct
        self._estimated = max(estimated_seconds, 1.0)
        self._message_fn = message_fn
        self._start_time = time.time()
        self._stop = False

    def tick(self) -> None:
        if self._stop:
            return
        elapsed = time.time() - self._start_time
        ratio = min(1.0, elapsed / self._estimated)
        pct = int(self._start_pct + ratio * (self._end_pct - self._start_pct))
        self._on_progress(self._stage, pct, self._message_fn(elapsed, self._estimated))

    def finish(self) -> None:
        self._stop = True
