# 🚀 Getting Started with PrepWise

## Prerequisites
- Node.js 18+ installed
- Backend and Frontend both need to run

## Quick Start

### 1️⃣ Frontend Setup (Already Done ✓)

Your `.env.local` is configured:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_id
```

**For development**, the frontend defaults to `http://localhost:4000` if env vars aren't set.

### 2️⃣ Backend Setup

Your `server/.env` file is ready:
```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/prepwise
JWT_SECRET=your_secret_here
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

**For full functionality**, you'll need:
- MongoDB instance (local or Atlas)
- Google Gemini API key
- Strong JWT secret

---

## Development Mode

### Option A: Without MongoDB (Quick Dev)

```bash
# Terminal 1 - Frontend
npm run dev
# Opens http://localhost:3000

# Terminal 2 - Backend  
cd server
npm run dev
# Runs on http://localhost:4000
```

**Status**: ✅ API endpoints available, database operations will fail until MongoDB is configured

### Option B: With MongoDB (Full Setup)

1. **Start MongoDB**
   ```bash
   # If using local MongoDB:
   mongod
   
   # Or use MongoDB Atlas (cloud):
   # Update server/.env with your connection string
   ```

2. **Start Backend**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend** (new terminal)
   ```bash
   npm run dev
   ```

---

## Testing the Connection

### Test Backend Health
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok"
}
```

### Test Frontend
- Visit http://localhost:3000
- Should NOT see the API URL error anymore ✅

---

## Common Issues

### ❌ "Cannot connect to backend"
- Start backend: `cd server && npm run dev`
- Check backend is on port 4000
- Verify `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

### ❌ "Database connection failed"
- Start MongoDB locally or use MongoDB Atlas
- Update `server/.env` with correct `MONGODB_URI`

### ❌ "Gemini API error"
- Get API key from: https://ai.google.dev/
- Add to `server/.env`: `GOOGLE_GENERATIVE_AI_API_KEY=your_key`

---

## Build & Production

### Build Frontend
```bash
npm run build
npm start  # or npm run dev for HMR
```

### Build Backend
```bash
cd server
npm start  # or npm run dev for hot reload
```

---

## Next Steps

1. ✅ **Environment files configured** 
2. ⏭️ **Start development servers**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   cd server && npm run dev
   ```
3. ⏭️ **Test sign up at** http://localhost:3000/sign-up
4. ⏭️ **Follow** [TESTING_GUIDE.md](./TESTING_GUIDE.md) for full testing

---

## 📚 Documentation

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Developer cheatsheet
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Complete testing workflows
- [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - Deploy to production
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

---

## 🎯 Your First Interview

1. Sign up at http://localhost:3000/sign-up
2. Go to dashboard
3. Click "Start Interview"
4. Select tech stack and experience level
5. Answer questions via voice (requires VAPI token)
6. Get AI-generated feedback

---

Good luck! 🚀
