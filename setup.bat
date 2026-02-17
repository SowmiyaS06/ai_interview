@echo off
REM PrepWise Setup Script for Windows
REM This script helps you quickly set up the development environment

echo.
echo =================================
echo   PrepWise Setup Script
echo =================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% found
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed
echo.

REM Setup environment files
echo Setting up environment files...

REM Frontend .env.local
if not exist .env.local (
    copy .env.example .env.local >nul
    echo [OK] Created .env.local from .env.example
    echo [WARNING] Please edit .env.local and add your VAPI credentials
) else (
    echo [INFO] .env.local already exists, skipping...
)

REM Backend .env
if not exist server\.env (
    (
        echo # Server Configuration
        echo NODE_ENV=development
        echo PORT=4000
        echo.
        echo # Client URL ^(for CORS^)
        echo CLIENT_URL=http://localhost:3000
        echo.
        echo # MongoDB Connection
        echo MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/prepwise
        echo.
        echo # JWT Secret ^(generate with: node -e "console.log(require('crypto'^).randomBytes(64^).toString('hex'^))"^)
        echo JWT_SECRET=your_jwt_secret_here
        echo.
        echo # Google Gemini AI
        echo GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
    ) > server\.env
    echo [OK] Created server\.env
    echo [WARNING] Please edit server\.env and configure:
    echo    - MONGODB_URI: Your MongoDB Atlas connection string
    echo    - JWT_SECRET: Generate with: node -e "console.log(require('crypto'^).randomBytes(64^).toString('hex'^))"
    echo    - GOOGLE_GENERATIVE_AI_API_KEY: Your Gemini API key
) else (
    echo [INFO] server\.env already exists, skipping...
)

echo.
echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env.local with your VAPI credentials
echo   2. Edit server\.env with MongoDB URI, JWT secret, and Gemini API key
echo   3. Start the backend: cd server ^&^& npm run dev
echo   4. Start the frontend ^(in new terminal^): npm run dev
echo   5. Visit http://localhost:3000
echo.
echo Documentation:
echo   - Testing Guide: TESTING_GUIDE.md
echo   - Production Deployment: PRODUCTION_DEPLOYMENT.md
echo   - Migration Guide: MIGRATION_GUIDE.md
echo.
echo Happy coding!
echo.
pause
