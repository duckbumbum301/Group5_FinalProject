#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear
echo ""
echo "========================================"
echo "  VỰA VUI VẺ - GROUP 5 SETUP SCRIPT"
echo "========================================"
echo ""

# Check Node.js
echo "[1/5] Kiểm tra Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERROR: Node.js chưa được cài đặt!${NC}"
    echo -e "${YELLOW}💡 Vui lòng cài đặt tại: https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ OK: Node.js đã được cài đặt${NC}"
node --version
echo ""

# Install dependencies
echo "[2/5] Cài đặt dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lỗi khi cài đặt dependencies!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Đã cài đặt dependencies${NC}"
echo ""

# Install JSON Server globally
echo "[3/5] Cài đặt JSON Server..."
npm install -g json-server 2>/dev/null || npm install json-server --save-dev
echo -e "${GREEN}✅ Đã cài đặt JSON Server${NC}"
echo ""

# Sync products to database
echo "[4/5] Đồng bộ sản phẩm vào database..."
npm run sync
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Lỗi khi sync products${NC}"
    echo -e "${YELLOW}💡 Bạn có thể chạy lại sau: npm run sync${NC}"
fi
echo ""

# Done
echo "[5/5] Setup hoàn tất!"
echo ""
echo "========================================"
echo "  CÁCH CHẠY PROJECT:"
echo "========================================"
echo ""
echo -e "${BLUE}  🚀 Chạy tự động (khuyến nghị):${NC}"
echo "     npm start"
echo ""
echo -e "${BLUE}  🔧 Hoặc chạy thủ công:${NC}"
echo "     Terminal 1: npm run backend"
echo "     Terminal 2: npm run frontend"
echo ""
echo "========================================"
echo "  TRUY CẬP:"
echo "========================================"
echo ""
echo -e "${GREEN}  🌐 Frontend:${NC}  http://localhost:8000"
echo -e "${GREEN}  📦 Recipes:${NC}   http://localhost:8000/html/recipes.html"
echo -e "${GREEN}  🔐 Admin:${NC}     http://localhost:8000/backoffice"
echo -e "${GREEN}  🛠️  API:${NC}       http://localhost:3000"
echo ""
echo "========================================"
echo ""
