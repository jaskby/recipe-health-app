#!/bin/bash

echo "========================================"
echo "食谱健康APP 启动脚本"
echo "========================================"

echo ""
echo "[1/4] 检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "错误: 未安装Node.js，请先安装Node.js"
    exit 1
fi

echo ""
echo "[2/4] 安装后端依赖..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "错误: 后端依赖安装失败"
    exit 1
fi

echo ""
echo "[3/4] 初始化数据库..."
npm run init-db

echo ""
echo "[4/4] 启动后端服务..."
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'
echo "后端服务已启动: http://localhost:3000"

cd ..

echo ""
echo "安装前端依赖..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "错误: 前端依赖安装失败"
    exit 1
fi

echo ""
echo "========================================"
echo "请选择启动模式:"
echo "1. H5模式 (浏览器预览)"
echo "2. 微信小程序模式"
echo "========================================"
echo ""

read -p "请输入选项 (1/2): " mode

if [ "$mode" = "1" ]; then
    echo "启动H5模式..."
    npm run dev:h5
elif [ "$mode" = "2" ]; then
    echo "启动微信小程序模式..."
    echo "请使用微信开发者工具打开 client/dist/dev/mp-weixin 目录"
    npm run dev:mp-weixin
else
    echo "无效选项"
fi
