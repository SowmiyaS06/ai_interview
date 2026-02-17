#!/bin/bash

# PrepWise Setup Script
# This script helps you quickly set up the development environment

set -e

echo "🚀 PrepWise Setup Script"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version) found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm --version) found"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
echo -e "${GREEN}✓${NC} Frontend dependencies installed"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..
echo -e "${GREEN}✓${NC} Backend dependencies installed"
echo ""

# Setup environment files
echo "⚙️  Setting up environment files..."

# Frontend .env.local
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} Created .env.local from .env.example"
    echo -e "${YELLOW}⚠️  Please edit .env.local and add your VAPI credentials${NC}"
else
    echo -e "${YELLOW}ℹ${NC}  .env.local already exists, skipping..."
fi

# Backend .env
if [ ! -f server/.env ]; then
    cat > server/.env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=4000

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/prepwise

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_jwt_secret_here

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
EOF
    echo -e "${GREEN}✓${NC} Created server/.env"
    echo -e "${YELLOW}⚠️  Please edit server/.env and configure:${NC}"
    echo "   - MONGODB_URI: Your MongoDB Atlas connection string"
    echo "   - JWT_SECRET: Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    echo "   - GOOGLE_GENERATIVE_AI_API_KEY: Your Gemini API key"
else
    echo -e "${YELLOW}ℹ${NC}  server/.env already exists, skipping..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env.local with your VAPI credentials"
echo "   2. Edit server/.env with MongoDB URI, JWT secret, and Gemini API key"
echo "   3. Start the backend: cd server && npm run dev"
echo "   4. Start the frontend (in new terminal): npm run dev"
echo "   5. Visit http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - Testing Guide: TESTING_GUIDE.md"
echo "   - Production Deployment: PRODUCTION_DEPLOYMENT.md"
echo "   - Migration Guide: MIGRATION_GUIDE.md"
echo ""
echo "🎉 Happy coding!"
