@echo off
echo ========================================
echo 食谱健康APP 启动脚本
echo ========================================

echo.
echo [1/4] 检查Node.js环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo 错误: 未安装Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo [2/4] 安装后端依赖...
cd server
call npm install
if errorlevel 1 (
    echo 错误: 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo [3/4] 初始化数据库...
call npm run init-db

echo.
echo [4/4] 启动后端服务...
start "Recipe Health API" cmd /k "npm run dev"

echo.
echo ========================================
echo 后端服务已启动: http://localhost:3000
echo ========================================
echo.

cd ..

echo 安装前端依赖...
cd client
call npm install
if errorlevel 1 (
    echo 错误: 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 请选择启动模式:
echo 1. H5模式 (浏览器预览)
echo 2. 微信小程序模式
echo ========================================
echo.

set /p mode="请输入选项 (1/2): "

if "%mode%"=="1" (
    echo 启动H5模式...
    call npm run dev:h5
) else if "%mode%"=="2" (
    echo 启动微信小程序模式...
    echo 请使用微信开发者工具打开 client/dist/dev/mp-weixin 目录
    call npm run dev:mp-weixin
) else (
    echo 无效选项
    pause
)
