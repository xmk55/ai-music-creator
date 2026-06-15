"""Post-process generated audio for smooth, listenable playback."""

from __future__ import annotations

import io
from pathlib import Path

import numpy as np
from pydub import AudioSegment
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SAMPLE_RATE = 32000
FADE_MS = 200
TARGET_PEAK = 0.72


def _to_mono_float(audio: np.ndarray) -> np.ndarray:
    audio = np.asarray(audio, dtype=np.float64)
    if audio.ndim > 1:
        audio = np.mean(audio, axis=0)
    return audio


def _highpass(audio: np.ndarray, sample_rate: int, cutoff_hz: float = 260.0) -> np.ndarray:
    sos = butter(4, cutoff_hz, btype="highpass", fs=sample_rate, output="sos")
    return sosfilt(sos, audio)


def _lowpass(audio: np.ndarray, sample_rate: int, cutoff_hz: float = 12000.0) -> np.ndarray:
    sos = butter(4, cutoff_hz, btype="lowpass", fs=sample_rate, output="sos")
    return sosfilt(sos, audio)


def _despike(audio: np.ndarray, sensitivity: float = 6.0) -> np.ndarray:
    """Smooth isolated glitch spikes that cause harsh clicks."""
    if len(audio) < 4:
        return audio

    cleaned = audio.copy()
    diffs = np.abs(np.diff(cleaned))
    threshold = np.median(diffs) * sensitivity + 1e-8
    spike_indices = np.where(diffs > threshold)[0]

    for idx in spike_indices:
        left = max(0, idx - 1)
        right = min(len(cleaned) - 1, idx + 2)
        cleaned[idx + 1] = (cleaned[left] + cleaned[right]) / 2.0

    return cleaned


def _soft_normalize(audio: np.ndarray, target: float = TARGET_PEAK) -> np.ndarray:
    peak = np.max(np.abs(audio))
    if peak <= 1e-8:
        return audio
    scaled = audio * (target / peak)
    return np.tanh(scaled * 1.15) * target


def prepare_melody_guide(audio: np.ndarray, sample_rate: int) -> np.ndarray:
    """
    Prep uploaded audio for MusicGen Melody.
    The melody model breaks on heavy kick/bass — filter lows and tame dynamics.
    """
    guide = _to_mono_float(audio)
    guide = guide - np.mean(guide)
    guide = _highpass(guide, sample_rate, cutoff_hz=280.0)
    guide = _lowpass(guide, sample_rate, cutoff_hz=8000.0)
    guide = _despike(guide, sensitivity=5.0)
    peak = np.max(np.abs(guide))
    if peak > 1e-8:
        guide = guide / peak * 0.55
    return guide.astype(np.float32)


def prepare_model_output(audio: np.ndarray, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
    """Clean raw model tensor output before encoding."""
    out = _to_mono_float(audio)
    out = out - np.mean(out)
    out = _despike(out, sensitivity=5.5)
    out = _lowpass(out, sample_rate, cutoff_hz=14000.0)
    out = _soft_normalize(out, target=TARGET_PEAK)
    return out.astype(np.float32)


def float_to_int16(audio: np.ndarray) -> np.ndarray:
    clipped = np.clip(audio, -1.0, 1.0)
    return (clipped * 32767).astype(np.int16)


def smooth_audio(audio: np.ndarray, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
    """Apply fades after cleanup for click-free start/end."""
    cleaned = prepare_model_output(audio, sample_rate)
    mono = float_to_int16(cleaned)
    segment = AudioSegment(
        mono.tobytes(),
        frame_rate=sample_rate,
        sample_width=2,
        channels=1,
    )
    fade = min(FADE_MS, max(20, len(segment) // 12))
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
