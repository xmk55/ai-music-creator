# AI Music Creator

Professional AI music studio — compose tracks from text prompts or remix your own songs with AI.

## Features

### Create Music
- Text-to-music using Meta **MusicGen**
- Adjustable duration (5–30s), prompt strength, and creativity
- Smooth 320 kbps MP3 output with normalization and fade in/out

### AI Remix
- Upload your own **MP3, WAV, M4A, OGG, or FLAC**
- Describe how you want it transformed (genre, mood, style)
- Powered by **MusicGen Melody** — uses your audio as a melodic guide

### Themes
Six visual themes with animated emoji decorations and dynamic backgrounds:
- Midnight Studio, Tropical, Cosmic, Forest, Sunset, Neon City

## Requirements

- Python 3.10+
- ffmpeg (for MP3 export)
- ~2 GB disk (create model) + ~1.5 GB (remix model, loaded on first remix)
- NVIDIA GPU optional but recommended

### Install ffmpeg (Windows)

```powershell
winget install Gyan.FFmpeg
```

## Quick start

Double-click **`run.bat`**, or:

```powershell
cd "c:\cursor nigger\music creation tool"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Open **http://127.0.0.1:8000**

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST JSON | Create music from prompt |
| `/api/remix` | POST multipart | Remix uploaded audio |
| `/api/status/{job_id}` | GET | Poll job status |
| `/api/download/{job_id}` | GET | Download MP3 |
| `/api/health` | GET | System info |

## Configuration

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `MUSICGEN_MODEL` | `auto` | `small`, `medium`, or `auto` |

## License

Uses Meta MusicGen models — see [Hugging Face model cards](https://huggingface.co/facebook/musicgen-small) for terms.
