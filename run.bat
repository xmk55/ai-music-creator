@echo off
cd /d "%~dp0"

echo.
echo  AI Music Creator - Setup and Launch
echo  ====================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo.
    echo  WARNING: ffmpeg not found in PATH.
    echo  MP3 export requires ffmpeg. Install it with:
    echo    winget install Gyan.FFmpeg
    echo  or download from https://ffmpeg.org
    echo.
)

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing dependencies (first run may take several minutes)...
pip install -r requirements.txt -q

echo.
echo Starting server...
python run.py
