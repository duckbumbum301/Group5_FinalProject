@echo off
chcp 65001 >nul
title Clear Backoffice Cache
color 0E

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     🧹 CLEAR BACKOFFICE CACHE                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  Thao tác này sẽ:
echo    1. Xóa localStorage của backoffice
echo    2. Reset về mock data mới
echo    3. Buộc reload trang
echo.

set /p confirm="Bạn có chắc muốn tiếp tục? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo ❌ Đã hủy thao tác
    pause
    exit /b 0
)

echo.
echo 📝 Hướng dẫn:
echo.
echo 1. Mở backoffice trong browser: http://127.0.0.1:5507/backoffice/
echo 2. Nhấn F12 để mở Developer Tools
echo 3. Chuyển sang tab "Console"
echo 4. Copy và paste đoạn code sau:
echo.
echo ────────────────────────────────────────────────────────────
echo.
echo // Clear all backoffice localStorage
echo localStorage.removeItem('vvv_db_v1');
echo localStorage.removeItem('vvv_session');
echo localStorage.removeItem('vvv_audit_v1');
echo console.log('✅ Cache cleared!');
echo location.reload();
echo.
echo ────────────────────────────────────────────────────────────
echo.
echo 5. Nhấn Enter
echo 6. Trang sẽ tự động reload với data mới
echo.
echo 💡 Hoặc dùng cách nhanh:
echo    Ctrl + Shift + Delete ^> Chọn "Cached images and files" ^> Clear
echo.

pause
