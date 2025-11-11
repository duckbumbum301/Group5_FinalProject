@echo off
chcp 65001 >nul
title Vựa Vui Vẻ - Full Stack Launcher
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           VỰA VUI VẺ - KHỞI ĐỘNG DỰ ÁN                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Lỗi: Node.js chưa được cài đặt!
    echo    Vui lòng tải Node.js tại: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js: 
node --version
echo.

REM Dừng các process Node.js cũ nếu có
echo 🔄 Dừng các process cũ...
taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 /nobreak >nul

REM Kiểm tra dependencies
echo.
echo 🔍 Kiểm tra dependencies...
if not exist "node_modules" (
    echo ⚠️  Thiếu dependencies cho dự án chính
    echo 📦 Đang cài đặt...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Lỗi khi cài đặt dependencies!
        pause
        exit /b 1
    )
)

if not exist "vnpay_nodejs\node_modules" (
    echo ⚠️  Thiếu dependencies cho VNPay
    echo 📦 Đang cài đặt...
    cd vnpay_nodejs
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Lỗi khi cài đặt VNPay dependencies!
        pause
        exit /b 1
    )
)

echo ✅ Dependencies đã sẵn sàng
echo.

REM Khởi động các services
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          🌟 ĐANG KHỞI ĐỘNG CÁC SERVICES                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 1️⃣  Khởi động VNPay Backend (Port 8888)...
start "VNPay Backend - Port 8888" cmd /k "cd /d %~dp0vnpay_nodejs && color 0E && npm start"
timeout /t 3 /nobreak >nul

echo 2️⃣  Khởi động API Backend (Port 3000)...
start "API Backend - Port 3000" cmd /k "cd /d %~dp0 && color 0B && npm run backend"
timeout /t 3 /nobreak >nul

echo 3️⃣  Khởi động Frontend (Port 8000)...
start "Frontend - Port 8000" cmd /k "cd /d %~dp0 && color 0D && npm run frontend"
timeout /t 3 /nobreak >nul

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          ✅ HOÀN TẤT! DỰ ÁN ĐANG CHẠY                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Truy cập ứng dụng:
echo    ├─ 🏠 Trang chủ:        http://localhost:8000/Home/Hôm/index.html
echo    ├─ 🛒 Sản phẩm:         http://localhost:8000/html/index.html
echo    ├─ 🛒 Giỏ hàng:         http://localhost:8000/html/cart.html
echo    ├─ 👤 Tài khoản:        http://localhost:8000/html/account.html
echo    ├─ 📊 Backoffice:       http://localhost:8000/backoffice/
echo    └─ 🧪 Test VNPay:       http://localhost:8000/test-vnpay-flow.html
echo.
echo 🔧 API Endpoints:
echo    ├─ 📦 Products API:     http://localhost:3000/products
echo    ├─ 👥 Users API:        http://localhost:3000/users
echo    ├─ 🛍️  Orders API:       http://localhost:3000/orders
echo    └─ 💳 VNPay API:        http://localhost:8888/order/create_payment_url
echo.
echo 💡 Mẹo:
echo    • Để dừng: Đóng các cửa sổ terminal hoặc Ctrl+C
echo    • Để khởi động lại: Chạy lại file start-all.bat
echo    • Xem log: Kiểm tra các cửa sổ terminal màu
echo.
echo 💳 Thông tin test VNPay:
echo    ├─ Ngân hàng:  NCB
echo    ├─ Số thẻ:     9704198526191432198
echo    ├─ Tên:        NGUYEN VAN A
echo    ├─ Hết hạn:    07/15
echo    └─ OTP:        123456
echo.
echo ⏳ Đang kiểm tra services...
timeout /t 5 /nobreak >nul

REM Kiểm tra các ports
echo.
echo  Trạng thái services:
netstat -ano | findstr ":8888 :3000 :8000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✅ Services đang chạy tốt!
    netstat -ano | findstr ":8888 :3000 :8000" | findstr "LISTENING"
) else (
    echo ⚠️  Một số services có thể chưa khởi động xong
    echo    Hãy đợi thêm vài giây...
)

echo.
echo 🎉 Chúc bạn code vui vẻ!
echo.

REM Mở browser tự động
timeout /t 3 /nobreak >nul
echo 🌐 Đang mở browser...
echo    ├─ Trang chủ...
start http://localhost:8000/Home/Hôm/index.html
timeout /t 1 /nobreak >nul
echo    └─ Backoffice...
start http://localhost:8000/backoffice/

echo.
echo 💡 Cửa sổ này có thể đóng. Services sẽ tiếp tục chạy.
echo.
pause
