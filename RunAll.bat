@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

title MyLibrary - Setup Build Run (logging)

REM ===== Paths =====
cd /d "%~dp0"
set "PROJ_DIR=%CD%"
set "LOG_DIR=%PROJ_DIR%\logs"

if not exist "%LOG_DIR%" md "%LOG_DIR%"

for /f %%i in ('powershell -NoProfile -Command "$d=Get-Date; $d.ToString(\"yyyyMMdd_HHmmss\")"') do set "TS=%%i"
set "LOG_FILE=%LOG_DIR%\run_%TS%.log"

echo [INFO] Log file: "%LOG_FILE%"
echo [INFO] Project: "%PROJ_DIR%"
echo [INFO] Started at: %DATE% %TIME%
echo [INFO] Log file: "%LOG_FILE%" > "%LOG_FILE%"
echo [INFO] Project: "%PROJ_DIR%" >> "%LOG_FILE%"
echo [INFO] Started at: %DATE% %TIME% >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM ---------- STEP: check node & npm ----------
call :log "[STEP] Checking Node.js and npm..."
where node >> "%LOG_FILE%" 2>&1 || ( call :fail "Node.js is not installed or not on PATH." )
where npm  >> "%LOG_FILE%" 2>&1 || ( call :fail "npm is not installed or not on PATH." )
call :ok "Detected node and npm."

REM ---------- STEP: install deps ----------
call :log "[STEP] Installing dependencies (npm ci || npm install)"
if exist package-lock.json (
  call npm ci >> "%LOG_FILE%" 2>&1 || ( call :fail "npm ci failed." )
) else (
  call npm install >> "%LOG_FILE%" 2>&1 || ( call :fail "npm install failed." )
)
call :ok "Dependencies installed."

REM ---------- STEP: ensure dev types AFTER install ----------
call :log "[STEP] Ensuring dev types (@types/better-sqlite3)"
if exist "node_modules\@types\better-sqlite3\index.d.ts" (
  call :ok "Types already present."
) else (
  call npm i -D @types/better-sqlite3 >> "%LOG_FILE%" 2>&1
  if errorlevel 1 (
    echo [WARN] Could not install @types/better-sqlite3, creating local stub...>> "%LOG_FILE%"
    if not exist "src\types" md "src\types"
    (echo.> "src\types\better-sqlite3.d.ts") & (
      echo declare module 'better-sqlite3';>> "src\types\better-sqlite3.d.ts"
    )
  )
)
call :ok "Dev types ensured."

REM ---------- STEP: ensure .env ----------
call :log "[STEP] Ensuring .env file"
if not exist ".env" (
  if exist ".env.example" ( copy /Y ".env.example" ".env" >> "%LOG_FILE%" 2>&1 ) else ( type nul > ".env" )
)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p='.env'; $t = (Get-Content $p -Raw -EA SilentlyContinue) -as [string]; if(-not $t){$t=''}; " ^
  "function SetLine([string]$k,[string]$v){ if($t -match \"(?m)^\s*$k\s*=\s*.*$\"){ $script:t=[regex]::Replace($t, \"(?m)^\s*$k\s*=.*$\", \"$k=$v\") } else { $script:t+=\"$k=$v`n\" } } " ^
  "SetLine 'PORT' '3000'; SetLine 'ALLOWED_ORIGINS' 'http://localhost:3000,http://127.0.0.1:3000'; SetLine 'DB_FILE' './data/books.db'; SetLine 'AUTO_ENRICH' '1'; " ^
  "Set-Content -Path $p -Value $t -Encoding UTF8" >> "%LOG_FILE%" 2>&1 || ( call :fail "Failed to update .env" )
call :ok ".env is ready."

REM ---------- STEP: clean dist ----------
call :log "[STEP] Cleaning old build (dist)"
if exist "dist" ( rmdir /s /q "dist" >> "%LOG_FILE%" 2>&1 )
call :ok "Cleaned."

REM ---------- STEP: build ----------
call :log "[STEP] Building TypeScript"
call npm run build >> "%LOG_FILE%" 2>&1 || ( call :fail "Build failed." )
call :ok "Build succeeded."

REM ---------- STEP: start ----------
call :log "[STEP] Starting server in a new window (logging enabled)"
cmd.exe /c start "MyLibrary Server" "%SystemRoot%\System32\cmd.exe" /k "cd /d ""%~dp0"" && npm start"

timeout /t 3 >nul
start "" "http://localhost:3000/"

echo.
echo [OK] Done. Server started in a new window.
echo [INFO] All output and errors are logged to:
echo        %LOG_FILE%
echo.
echo Press any key to exit this launcher...
pause >nul
exit /b 0

:log
  set "msg=%~1"
  echo %msg%
  echo %msg%>> "%LOG_FILE%"
  goto :eof

:ok
  set "msg=%~1"
  echo [OK] %msg%
  echo [OK] %msg%>> "%LOG_FILE%"
  goto :eof

:fail
  set "msg=%~1"
  echo [ERROR] %msg%
  echo [ERROR] %msg%>> "%LOG_FILE%"
  echo.
  echo Last 50 log lines:
  powershell -NoProfile -Command "Get-Content -Path '%LOG_FILE%' -Tail 50"
  echo.
  echo Full log saved to: %LOG_FILE%
  echo Opening log in Notepad...
  start notepad "%LOG_FILE%"
  echo.
  echo Press any key to close...
  pause >nul
  exit /b 1
