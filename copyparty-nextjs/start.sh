#!/bin/bash

# CopyParty Next.js Frontend - Quick Start Script

set -e

echo "========================================="
echo "CopyParty Next.js Frontend Quick Start"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
    echo ""
fi

# Check if .next exists
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}Building application...${NC}"
    npm run build
    echo -e "${GREEN}✓ Application built${NC}"
    echo ""
else
    echo -e "${YELLOW}Build directory exists. Rebuilding...${NC}"
    npm run build
    echo -e "${GREEN}✓ Application rebuilt${NC}"
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local configuration...${NC}"
    cat > .env.local << EOF
# CopyParty Backend URL
# Leave empty if backend is on the same origin
# Example: http://localhost:3923
NEXT_PUBLIC_API_URL=

# Frontend port (default: 3000)
PORT=3000
EOF
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo -e "${YELLOW}Please edit .env.local to configure your CopyParty backend URL${NC}"
    echo ""
fi

echo "========================================="
echo -e "${GREEN}Ready to start!${NC}"
echo "========================================="
echo ""
echo "Starting Next.js server..."
echo ""
echo -e "${GREEN}Frontend will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}Make sure your CopyParty backend is running!${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
