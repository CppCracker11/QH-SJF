$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (!(Test-Path ".venv\Scripts\python.exe")) {
  if (Get-Command py -ErrorAction SilentlyContinue) { & py -3 -m venv .venv }
  else { & python -m venv .venv }
}
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw "API dependency installation failed." }
& .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
