# Firebase → MongoDB + Express Migration Guide

Complete migration from Firebase (Firestore + Auth) to Node.js/Express with MongoDB.

## What Changed

### Backend Architecture

**Before (Firebase):**
- Firestore NoSQL database
- Firebase Admin SDK for server-side operations
- Firebase Auth for authentication
- Next.js Server Actions for backend logic

**After (Express + MongoDB):**
- MongoDB with Mongoose ODM
- Express REST API
- JWT + bcrypt authentication with HTTP-only cookies
- Separate Node.js backend server

### File Changes

#### New Backend Files
```
server/
├── src/
│   ├── index.js                 # Express app
│   ├── config/db.js             # MongoDB connection
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # API endpoints
│   ├── middleware/auth.js       # JWT auth
│   ├── utils/token.js           # JWT utilities
│   └── schemas/feedbackSchema.js
├── package.json
└── .env.example
```

#### Modified Frontend Files
- `lib/api.ts` - New fetch wrapper with cookie handling
- `lib/actions/auth.action.ts` - Calls Express API instead of Firebase
- `lib/actions/general.action.ts` - Calls Express API
- `components/AuthForm.tsx` - Removed Firebase client SDK
- `types/index.d.ts` - Updated SignInParams, SignUpParams
- `.env.example` - Updated environment variables

#### Files You Can Remove (Optional)
- `firebase/admin.ts`
- `firebase/client.ts`
- `app/api/vapi/generate/route.ts` (moved to Express backend)

## Setup Steps

### 1. Backend Setup

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure MongoDB

**MongoDB Atlas (Recommended):**
```bash
# Get connection string from MongoDB Atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/prepwise
```

**Local MongoDB:**
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or follow official MongoDB installation guide

# Start MongoDB
brew services start mongodb-community

# Connection string
mongodb://localhost:27017/prepwise
```

### 3. Environment Variables

**server/.env:**
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prepwise
JWT_SECRET=generate_random_64_char_string
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Frontend .env.local:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
```

### 4. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd ..
npm run dev
```

## API Mapping

### Authentication

| Firebase | Express |
|----------|---------|
| `createUserWithEmailAndPassword()` | `POST /auth/signup` |
| `signInWithEmailAndPassword()` | `POST /auth/signin` |
| `auth.signOut()` | `POST /auth/signout` |
| `auth.currentUser` | `GET /auth/me` |

### Data Operations

| Firebase (Server Action) | Express API |
|-------------------------|-------------|
| `getInterviewById(id)` | `GET /interviews/:id` |
| `getInterviewsByUserId(userId)` | `GET /interviews/user` |
| `getLatestInterviews()` | `GET /interviews/latest` |
| `createFeedback()` | `POST /feedback` |
| `getFeedbackByInterviewId()` | `GET /feedback/by-interview/:id` |
| `/api/vapi/generate` | `POST /vapi/generate` |

## Authentication Flow Changes

### Before (Firebase)
1. Client → Firebase Auth SDK (client-side)
2. Get ID token from Firebase
3. Server Action validates token + creates session cookie
4. Subsequent requests use session cookie

### After (JWT + Express)
1. Client → POST credentials to `/auth/signup` or `/auth/signin`
2. Server hashes password with bcrypt
3. Server creates JWT and sets HTTP-only cookie
4. Subsequent requests include cookie automatically
5. Middleware verifies JWT on protected routes

## Data Model Mapping

### User
```javascript
// Firebase
{
  uid: "firebase_uid",
  name: "John",
  email: "john@example.com"
}

// MongoDB
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John",
  email: "john@example.com",
  passwordHash: "$2a$10$...",
  createdAt: Date,
  updatedAt: Date
}
```

### Interview
```javascript
// Firebase
{
  id: "firestore_doc_id",
  role: "Frontend Developer",
  userId: "user_firebase_uid",
  ...
}

// MongoDB
{
  _id: ObjectId("..."),
  role: "Frontend Developer",
  userId: ObjectId("user_mongodb_id"),
  ...
}
```

## Testing the Migration

### 1. Test Authentication
```bash
# Sign Up
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}' \
  -c cookies.txt

# Get Current User
curl http://localhost:4000/auth/me -b cookies.txt
```

### 2. Test Interview Generation
```bash
curl -X POST http://localhost:4000/vapi/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Technical",
    "role": "Software Engineer",
    "level": "Mid",
    "techstack": "React,Node.js",
    "amount": 5,
    "userid": "user_mongodb_id"
  }'
```

### 3. Test in Browser
1. Go to `http://localhost:3000/sign-up`
2. Create an account
3. Verify redirect to dashboard
4. Check browser DevTools → Application → Cookies for `auth_token`

## Deployment

### Backend (Render)
1. Push to GitHub
2. Create Web Service on Render
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Update `NEXT_PUBLIC_API_BASE_URL` to Render URL
2. Deploy via Vercel dashboard or CLI

### CORS Configuration
Ensure backend `.env` includes:
```env
CLIENT_URL=https://your-app.vercel.app,http://localhost:3000
```

## Common Issues

### "Unauthorized" on protected routes
- Ensure cookies are being sent (`credentials: "include"`)
- Check JWT_SECRET is set correctly
- Verify token hasn't expired

### CORS errors
- Add frontend URL to `CLIENT_URL` in backend `.env`
- Restart backend server after changing CORS config

### MongoDB connection failed
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Test with MongoDB Compass

### Feedback generation fails
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Check Google AI Studio quota/billing

## Rollback Plan

If you need to revert to Firebase:
1. Restore backup of these files:
   - `lib/actions/auth.action.ts`
   - `lib/actions/general.action.ts`
   - `components/AuthForm.tsx`
   - `types/index.d.ts`
2. Remove `lib/api.ts`
3. Restore Firebase config in `.env.local`
4. Stop Express server

## Benefits of Migration

✅ **Full control** over backend logic and database  
✅ **No vendor lock-in** - standard Node.js/MongoDB stack  
✅ **Better debugging** - direct access to database and logs  
✅ **Cost control** - MongoDB Atlas free tier is generous  
✅ **Scalability** - Easy to optimize queries and add caching  
✅ **Portability** - Deploy anywhere (Render, Heroku, AWS, etc.)

## Next Steps

After successful migration:
1. Set up database backups (MongoDB Atlas automated backups)
2. Add rate limiting (express-rate-limit)
3. Add request logging (morgan)
4. Set up monitoring (Sentry, LogRocket)
5. Add database indexes for frequent queries
6. Implement refresh tokens for better security

## Support

For issues or questions about the migration, open an issue on GitHub.
