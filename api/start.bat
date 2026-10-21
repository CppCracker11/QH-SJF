@echo off
setlocal
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  where py >nul 2>nul
  if not errorlevel 1 (
    py -3 -m venv .venv
  ) else (
    python -m venv .venv
  )
)
call .venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 (
  echo API dependencies could not be installed.
  pause
  exit /b 1
)
call .venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
pause
