# PrepWise Backend - Node.js + Express + MongoDB

Express REST API backend for the PrepWise AI interview platform, migrated from Firebase to MongoDB.

## Tech Stack

- **Node.js** with ES modules
- **Express** for REST API
- **MongoDB** with Mongoose ODM
- **JWT** + bcrypt for authentication (HTTP-only cookies)
- **Google Gemini AI** for question generation and feedback evaluation
- **Zod** for schema validation

## Architecture

```
server/
├── src/
│   ├── index.js               # Express app entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Interview.js       # Interview schema
│   │   └── Feedback.js        # Feedback schema
│   ├── routes/
│   │   ├── auth.routes.js     # Auth endpoints (signup, signin, signout, me)
│   │   ├── interview.routes.js # Interview CRUD
│   │   ├── feedback.routes.js  # Feedback generation & retrieval
│   │   └── vapi.routes.js      # Question generation via Gemini
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── utils/
│   │   ├── token.js           # JWT creation/verification
│   │   └── covers.js          # Random interview cover images
│   └── schemas/
│       └── feedbackSchema.js  # Feedback Zod schema
├── package.json
└── .env.example
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Sign in with email/password
- `POST /auth/signout` - Clear auth cookie
- `GET /auth/me` - Get current user (protected)

### Interviews
- `GET /interviews/user` - Get current user's interviews (protected)
- `GET /interviews/latest?limit=20` - Get latest interviews from other users (protected)
- `GET /interviews/:id` - Get interview by ID (protected)

### Feedback
- `POST /feedback` - Generate & save feedback (protected)
- `GET /feedback/by-interview/:id` - Get feedback for interview (protected)

### VAPI/AI
- `POST /vapi/generate` - Generate interview questions with Gemini

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up MongoDB

**Option A: MongoDB Atlas (Recommended for Production)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string from "Connect" → "Connect your application"
4. Whitelist your IP or use `0.0.0.0/0` for development

**Option B: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Connection URI:
# mongodb://localhost:27017/prepwise
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
NODE_ENV=development

# Frontend URL(s) - comma-separated for CORS
CLIENT_URL=http://localhost:3000,https://your-frontend.vercel.app

# MongoDB Atlas or local
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prepwise?retryWrites=true&w=majority

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 4. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:4000` by default.

### 5. Test Health Check

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"success": true, "status": "ok"}
```

## Frontend Integration

Update the Next.js frontend `.env.local`:

```env
# Point to your Express backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Existing VAPI credentials
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
```

The frontend uses the `apiFetch` utility in `lib/api.ts` to make authenticated requests with cookies.

## Authentication Flow

1. **Sign Up**: Client sends `{name, email, password}` → Server hashes password → Saves to MongoDB → Returns JWT in HTTP-only cookie
2. **Sign In**: Client sends `{email, password}` → Server verifies with bcrypt → Returns JWT in HTTP-only cookie
3. **Protected Routes**: Client sends cookie automatically → Server verifies JWT → Attaches `req.user.id` → Proceeds
4. **Sign Out**: Clears cookie

## Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Interview
```javascript
{
  _id: ObjectId,
  role: String,
  type: String,
  level: String,
  techstack: [String],
  questions: [String],
  userId: ObjectId (ref: User),
  finalized: Boolean,
  coverImage: String,
  createdAt: String (ISO)
}
```

### Feedback
```javascript
{
  _id: ObjectId,
  interviewId: ObjectId (ref: Interview),
  userId: ObjectId (ref: User),
  totalScore: Number,
  categoryScores: [{
    name: String,
    score: Number,
    comment: String
  }],
  strengths: [String],
  areasForImprovement: [String],
  finalAssessment: String,
  createdAt: String (ISO)
}
```

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your repo
4. Set:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Add all `.env` variables
5. Update `CLIENT_URL` to include your Vercel frontend URL

### Deploy Frontend to Vercel

Update `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

## Migration Notes

### Changes from Firebase

| Firebase | MongoDB/Express |
|----------|----------------|
| Firestore collections | Mongoose models |
| Firebase Auth | JWT + bcrypt |
| Server Actions | REST API endpoints |
| Admin SDK | Express middleware |
| `.doc(id)` | `.findById(id)` |
| `.collection().where()` | `.find({ query })` |

### Breaking Changes
- Auth flow now uses email/password directly (no Firebase client SDK)
- All server actions replaced with API calls via `apiFetch()`
- Interview/Feedback IDs are MongoDB ObjectIds (24-char hex strings)
- Session cookies named `auth_token` instead of `session`

## Troubleshooting

**CORS errors?**
- Add your frontend URL to `CLIENT_URL` in `.env`
- Ensure `credentials: "include"` is set in frontend fetch calls

**MongoDB connection issues?**
- Check network access/IP whitelist in MongoDB Atlas
- Verify connection string format
- Test with MongoDB Compass

**JWT errors?**
- Regenerate `JWT_SECRET` and restart server
- Clear browser cookies

**Gemini AI errors?**
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Check API quota/billing on Google AI Studio

## License

Same as parent project.
