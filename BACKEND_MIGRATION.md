# Backend Migration: Firebase → MongoDB + Express

## ✅ Migration Complete

Your PrepWise backend has been successfully migrated from Firebase to a Node.js/Express + MongoDB architecture.

## 📁 What Was Created

### New Backend Server (`/server`)
- Express REST API with JWT authentication
- MongoDB database with Mongoose ODM
- Gemini AI integration for questions & feedback
- HTTP-only cookie-based sessions

### Updated Frontend Files
- `lib/api.ts` - New API client with cookie support
- `lib/actions/auth.action.ts` - Auth calls Express API
- `lib/actions/general.action.ts` - Data calls Express API
- `components/AuthForm.tsx` - Direct credential submission
- `types/index.d.ts` - Updated auth types

### Documentation
- `server/README.md` - Backend setup & API docs
- `MIGRATION_GUIDE.md` - Detailed migration instructions

## 🚀 Quick Start

### 1. Set Up MongoDB

**MongoDB Atlas (Recommended):**
```bash
# 1. Create free account at mongodb.com/cloud/atlas
# 2. Create cluster → Get connection string
# 3. Use format: mongodb+srv://user:pass@cluster.mongodb.net/prepwise
```

**Local MongoDB:**
```bash
brew install mongodb-community && brew services start mongodb-community
# Connection: mongodb://localhost:27017/prepwise
```

### 2. Configure Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
CLIENT_URL=http://localhost:3000
```

### 3. Configure Frontend

Create/update `.env.local` in root:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
```

### 4. Start Both Servers

Terminal 1 (Backend):
```bash
cd server
npm run dev
# Runs on http://localhost:4000
```

Terminal 2 (Frontend):
```bash
npm run dev
# Runs on http://localhost:3000
```

### 5. Test It

1. Visit `http://localhost:3000/sign-up`
2. Create an account
3. Sign in and start an interview

## 📊 Backend API Endpoints

```
Auth:
  POST   /auth/signup        Create account
  POST   /auth/signin        Sign in
  POST   /auth/signout       Sign out
  GET    /auth/me            Get current user

Interviews:
  GET    /interviews/user    User's interviews
  GET    /interviews/latest  Latest from others
  GET    /interviews/:id     Get by ID

Feedback:
  POST   /feedback           Create feedback
  GET    /feedback/by-interview/:id

VAPI:
  POST   /vapi/generate      Generate questions
```

## 🔄 Key Changes

| Feature | Before (Firebase) | After (Express) |
|---------|------------------|-----------------|
| Auth | Firebase Auth SDK | JWT + bcrypt |
| Database | Firestore | MongoDB |
| Session | Session cookie | HTTP-only JWT cookie |
| Backend | Server Actions | REST API |
| User IDs | Firebase UID | MongoDB ObjectId |

## 📦 Optional Cleanup

You can now remove these files (if not using Firebase):
```bash
rm -rf firebase/
rm app/api/vapi/generate/route.ts
```

## 🚢 Deployment

### Backend → Render
1. Push to GitHub
2. Create Web Service on Render.com
3. Build: `cd server && npm install`
4. Start: `cd server && npm start`
5. Add environment variables

### Frontend → Vercel
Update `.env`:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

## 🐛 Troubleshooting

**CORS errors?**
Add your frontend URL to `CLIENT_URL` in backend `.env`

**Unauthorized errors?**
Check cookies in DevTools → Application → Cookies

**Connection refused?**
Ensure both servers are running (ports 3000 & 4000)

**MongoDB issues?**
- Verify IP whitelist in MongoDB Atlas
- Test connection with MongoDB Compass

## 📖 Full Documentation

- `server/README.md` - Complete backend guide
- `MIGRATION_GUIDE.md` - Detailed migration walkthrough

## ✨ Benefits

✅ No vendor lock-in  
✅ Full backend control  
✅ Standard Node.js stack  
✅ Deploy anywhere  
✅ Better debugging  
✅ Cost control  

Your backend is now powered by Express + MongoDB! 🎉
