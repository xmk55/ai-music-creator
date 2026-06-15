"""MusicGen text-to-music and melody-conditioned remix generation."""

from __future__ import annotations

import gc
import os
import threading
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import torch
from pydub import AudioSegment
from transformers import (
    AutoProcessor,
    MusicgenForConditionalGeneration,
    MusicgenMelodyForConditionalGeneration,
)

from backend.audio_processor import save_mp3
from backend.job_progress import ProgressCallback, ProgressTicker

MODEL_SMALL = "facebook/musicgen-small"
MODEL_MEDIUM = "facebook/musicgen-medium"
MODEL_MELODY = "facebook/musicgen-melody"
TOKENS_PER_SECOND = 50
MAX_UPLOAD_SECONDS = 30


@dataclass
class GenerationResult:
    mp3_path: str
    prompt: str
    duration_seconds: float
    model_name: str
    device: str
    job_type: str = "create"


def load_audio_file(path: str | Path, target_sr: int = 32000) -> tuple[np.ndarray, int]:
    segment = AudioSegment.from_file(str(path))
    segment = segment.set_channels(1).set_frame_rate(target_sr)

    max_ms = int(MAX_UPLOAD_SECONDS * 1000)
    if len(segment) > max_ms:
        segment = segment[:max_ms]

    samples = np.array(segment.get_array_of_samples(), dtype=np.float32)
    samples = samples / (2**15)
    return samples, target_sr


def _estimate_generate_seconds(max_new_tokens: int, device: str) -> float:
    if device == "cuda":
        return max(15.0, max_new_tokens * 0.12)
    return max(60.0, max_new_tokens * 1.8)


def _run_with_ticker(ticker: ProgressTicker, func):
    stop = threading.Event()

    def loop() -> None:
        while not stop.wait(1.5):
            ticker.tick()

    thread = threading.Thread(target=loop, daemon=True)
    thread.start()
    try:
        return func()
    finally:
        stop.set()
        ticker.finish()
        thread.join(timeout=2)


class TextMusicGenerator:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._model: MusicgenForConditionalGeneration | None = None
        self._processor = None
        self._model_name: str | None = None
        self._device = "cpu"

    @property
    def device(self) -> str:
        return self._device

    @property
    def model_name(self) -> str | None:
        return self._model_name

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def unload(self) -> None:
        with self._lock:
            if self._model is None:
                return
            del self._model
            del self._processor
            self._model = None
            self._processor = None
            self._model_name = None
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

    def _pick_model(self) -> str:
        prefer = os.getenv("MUSICGEN_MODEL", "auto").lower()
        if prefer in {MODEL_SMALL, MODEL_MEDIUM}:
            return prefer
        if torch.cuda.is_available():
            return MODEL_MEDIUM
        return MODEL_SMALL

    def load(self, on_progress: ProgressCallback | None = None) -> None:
        with self._lock:
            if self._model is not None:
                if on_progress:
                    on_progress("loading_model", 28, "AI model ready")
                return

            if on_progress:
                on_progress("downloading_model", 8, "Downloading create model (first run only, ~2 GB)...")

            self._device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model_name = self._pick_model()
            dtype = torch.float16 if self._device == "cuda" else torch.float32

            self._processor = AutoProcessor.from_pretrained(self._model_name)
            if on_progress:
                on_progress("loading_model", 22, "Loading model weights into memory...")

            self._model = MusicgenForConditionalGeneration.from_pretrained(
                self._model_name,
                torch_dtype=dtype,
            )
            self._model.to(self._device)
            self._model.eval()

            if on_progress:
                on_progress("loading_model", 30, "Create model loaded")

    def _duration_to_tokens(self, seconds: float) -> int:
        return max(256, min(int(seconds * TOKENS_PER_SECOND), 1503))

    def generate(
        self,
        prompt: str,
        output_path: str,
        duration_seconds: float = 15.0,
        guidance_scale: float = 3.0,
        temperature: float = 1.0,
        on_progress: ProgressCallback | None = None,
    ) -> GenerationResult:
        prompt = prompt.strip()
        if not prompt:
            raise ValueError("Prompt cannot be empty.")

        duration_seconds = max(5.0, min(duration_seconds, 30.0))
        guidance_scale = max(1.0, min(guidance_scale, 6.0))
        temperature = max(0.5, min(temperature, 2.0))
        max_new_tokens = self._duration_to_tokens(duration_seconds)

        self.load(on_progress)
        assert self._model is not None and self._processor is not None

        if on_progress:
            on_progress("preparing", 32, "Preparing prompt...")

        with self._lock:
            inputs = self._processor(
                text=[prompt],
                padding=True,
                return_tensors="pt",
            )
            inputs = {key: value.to(self._device) for key, value in inputs.items()}

            est = _estimate_generate_seconds(max_new_tokens, self._device)
            ticker = ProgressTicker(
                on_progress or (lambda *_: None),
                "generating",
                35,
                88,
                est,
                lambda elapsed, total: (
                    f"Composing audio... {int(elapsed)}s elapsed"
                    f" (~{max(0, int(total - elapsed))}s remaining on {self._device.upper()})"
                ),
            )

            def _generate():
                with torch.inference_mode():
                    return self._model.generate(
                        **inputs,
                        do_sample=True,
                        guidance_scale=guidance_scale,
                        temperature=temperature,
                        max_new_tokens=max_new_tokens,
                    )

            audio_values = _run_with_ticker(ticker, _generate)

        if on_progress:
            on_progress("exporting", 92, "Encoding smooth MP3...")

        waveform = audio_values[0, 0].detach().cpu().numpy()
        sample_rate = self._model.config.audio_encoder.sampling_rate
        actual_duration = len(waveform) / sample_rate

        save_mp3(waveform, output_path, sample_rate=sample_rate)

        if on_progress:
            on_progress("complete", 100, "Track ready!")

        return GenerationResult(
            mp3_path=output_path,
            prompt=prompt,
            duration_seconds=round(actual_duration, 2),
            model_name=self._model_name or MODEL_SMALL,
            device=self._device,
            job_type="create",
        )


class RemixGenerator:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._model: MusicgenMelodyForConditionalGeneration | None = None
        self._processor = None
        self._model_name = MODEL_MELODY
        self._device = "cpu"

    @property
    def device(self) -> str:
        return self._device

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def unload(self) -> None:
        with self._lock:
            if self._model is None:
                return
            del self._model
            del self._processor
            self._model = None
            self._processor = None
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

    def load(self, on_progress: ProgressCallback | None = None) -> None:
        with self._lock:
            if self._model is not None:
                if on_progress:
                    on_progress("loading_model", 28, "Remix model ready")
                return

            if on_progress:
                on_progress("downloading_model", 8, "Downloading remix model (first run only, ~1.5 GB)...")

            self._device = "cuda" if torch.cuda.is_available() else "cpu"
            dtype = torch.float16 if self._device == "cuda" else torch.float32

            self._processor = AutoProcessor.from_pretrained(self._model_name)
            if on_progress:
                on_progress("loading_model", 22, "Loading remix model weights...")

            self._model = MusicgenMelodyForConditionalGeneration.from_pretrained(
                self._model_name,
                torch_dtype=dtype,
            )
            self._model.to(self._device)
            self._model.eval()

            if on_progress:
                on_progress("loading_model", 30, "Remix model loaded")

    def _duration_to_tokens(self, seconds: float) -> int:
        return max(256, min(int(seconds * TOKENS_PER_SECOND), 1503))

    def remix(
        self,
        prompt: str,
        source_path: str,
        output_path: str,
        duration_seconds: float = 15.0,
        guidance_scale: float = 3.0,
        temperature: float = 1.0,
        on_progress: ProgressCallback | None = None,
    ) -> GenerationResult:
        prompt = prompt.strip()
        if not prompt:
            raise ValueError("Remix prompt cannot be empty.")

        duration_seconds = max(5.0, min(duration_seconds, 30.0))
        guidance_scale = max(1.0, min(guidance_scale, 6.0))
        temperature = max(0.5, min(temperature, 2.0))
        max_new_tokens = self._duration_to_tokens(duration_seconds)

        self.load(on_progress)
        assert self._model is not None and self._processor is not None

        if on_progress:
            on_progress("processing_audio", 32, "Processing your uploaded song...")

        sample_rate = self._model.config.audio_encoder.sampling_rate
        audio_array, sr = load_audio_file(source_path, target_sr=sample_rate)

        if on_progress:
            on_progress("preparing", 34, "Analyzing melody and preparing remix...")

        with self._lock:
            inputs = self._processor(
                audio=audio_array,
                sampling_rate=sr,
                text=[prompt],
                padding=True,
                return_tensors="pt",
            )
            inputs = {key: value.to(self._device) for key, value in inputs.items()}

            est = _estimate_generate_seconds(max_new_tokens, self._device) * 1.2
            ticker = ProgressTicker(
                on_progress or (lambda *_: None),
                "generating",
                38,
                88,
                est,
                lambda elapsed, total: (
                    f"Remixing audio... {int(elapsed)}s elapsed"
                    f" (~{max(0, int(total - elapsed))}s remaining on {self._device.upper()})"
                ),
            )

            def _generate():
                with torch.inference_mode():
                    return self._model.generate(
                        **inputs,
                        do_sample=True,
                        guidance_scale=guidance_scale,
                        temperature=temperature,
                        max_new_tokens=max_new_tokens,
                    )

            audio_values = _run_with_ticker(ticker, _generate)

        if on_progress:
            on_progress("exporting", 92, "Encoding remix MP3...")

        waveform = audio_values[0, 0].detach().cpu().numpy()
        actual_duration = len(waveform) / sample_rate

        save_mp3(waveform, output_path, sample_rate=sample_rate)

        if on_progress:
            on_progress("complete", 100, "Remix ready!")

        return GenerationResult(
            mp3_path=output_path,
            prompt=prompt,
            duration_seconds=round(actual_duration, 2),
            model_name=self._model_name,
            device=self._device,
            job_type="remix",
        )
