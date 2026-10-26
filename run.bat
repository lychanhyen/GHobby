@echo off
title GHobby - Next.js Gunpla & Figure Shop
echo ========================================================
echo   KHOI DONG HE THONG GHOBBY (NEXT.JS + PRISMA)
echo ========================================================
echo.

set PATH=D:\;D:\node_modules\npm\bin;%PATH%

echo [1/2] Dang kiem tra Node.js va npm...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Khong tim thay Node.js tai D:\node.exe!
    pause
    exit /b 1
)

echo.
echo [2/2] Dang khoi dong may chu Next.js tai cong 3000...
echo Mo trinh duyet tai dia chi: http://localhost:3000
echo.
npm.cmd run dev
pause
