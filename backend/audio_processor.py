"""Post-process generated audio for smooth playback and high-quality MP3 export."""

from __future__ import annotations

import io
from pathlib import Path

import numpy as np
from pydub import AudioSegment
from scipy.io import wavfile


SAMPLE_RATE = 32000
FADE_MS = 80
TARGET_PEAK = 0.92


def _to_mono_int16(audio: np.ndarray) -> np.ndarray:
    if audio.ndim > 1:
        audio = np.mean(audio, axis=0)
    audio = np.asarray(audio, dtype=np.float32)
    peak = np.max(np.abs(audio))
    if peak > 0:
        audio = audio * (TARGET_PEAK / peak)
    audio = np.clip(audio, -1.0, 1.0)
    return (audio * 32767).astype(np.int16)


def smooth_audio(audio: np.ndarray, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
    """Normalize peaks and apply short fades to avoid clicks at start/end."""
    mono = _to_mono_int16(audio)
    segment = AudioSegment(
        mono.tobytes(),
        frame_rate=sample_rate,
        sample_width=2,
        channels=1,
    )
    fade = min(FADE_MS, max(10, len(segment) // 20))
    segment = segment.fade_in(fade).fade_out(fade)
    return np.array(segment.get_array_of_samples(), dtype=np.int16)


def wav_to_mp3_bytes(wav_path: Path, bitrate: str = "320k") -> bytes:
    audio = AudioSegment.from_wav(str(wav_path))
    buffer = io.BytesIO()
    audio.export(
        buffer,
        format="mp3",
        bitrate=bitrate,
        parameters=["-qscale:a", "0"],
    )
    buffer.seek(0)
    return buffer.read()


def save_wav(audio: np.ndarray, path: Path, sample_rate: int = SAMPLE_RATE) -> None:
    smoothed = smooth_audio(audio, sample_rate)
    wavfile.write(str(path), sample_rate, smoothed)


def save_mp3(audio: np.ndarray, path: Path | str, sample_rate: int = SAMPLE_RATE) -> None:
    path = Path(path)
    wav_path = path.with_suffix(".wav")
    save_wav(audio, wav_path, sample_rate)
    mp3_bytes = wav_to_mp3_bytes(wav_path)
    path.write_bytes(mp3_bytes)
    wav_path.unlink(missing_ok=True)
