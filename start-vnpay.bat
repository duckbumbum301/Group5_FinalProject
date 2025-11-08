@echo off
REM ===================================================================
REM  VNPAY INTEGRATION - STARTUP SCRIPT
REM  Khoi dong VNPay backend va main project
REM ===================================================================

echo.
echo ========================================
echo   VUA VUI VE - VNPAY INTEGRATION
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js chua duoc cai dat!
    echo Vui long tai tai: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js OK

echo.
echo [2/3] Starting VNPay Backend (Port 8888)...
cd vnpay_nodejs
start cmd /k "title VNPay Backend && npm start"
cd ..
echo ✓ VNPay Backend starting...

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Main Project...
echo    - Frontend: http://localhost:8000
echo    - API: http://localhost:3000
start cmd /k "title Main Project && npm start"
echo ✓ Main Project starting...

echo.
echo ========================================
echo   READY TO TEST!
echo ========================================
echo.
echo VNPay Backend: http://localhost:8888
echo Frontend:      http://localhost:8000
echo.
echo Test credentials (VNPay Sandbox):
echo   Bank:     NCB
echo   Card:     9704198526191432198
echo   Name:     NGUYEN VAN A
echo   Expiry:   07/15
echo   OTP:      123456
echo.
echo Doc huong dan day du tai: README_VNPAY.md
echo.
pause
