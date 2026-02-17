# Testing Guide

## Local Development Testing

This guide walks through testing the complete application stack before production deployment.

## Prerequisites

1. **Node.js**: v18.0.0 or higher
2. **MongoDB**: Atlas account or local MongoDB installation
3. **Git**: Latest version
4. **API Keys**:
   - Google Gemini API key
   - VAPI credentials

## Setup Instructions

### 1. Clone & Install

```bash
# Navigate to project root
cd ai_mock_interviews-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Backend Environment

Create `server/.env`:

```env
# Server
NODE_ENV=development
PORT=4000

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://your_user:your_pass@cluster.mongodb.net/prepwise

# Authentication
JWT_SECRET=your_64_character_random_secret_here

# AI Integration
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Configure Frontend Environment

Create `.env.local` in project root:

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# VAPI Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id
```

## Testing Workflow

### Phase 1: Backend API Testing

#### Start Backend Server

```bash
cd server
npm run dev
```

**Expected Output:**
```
🚀 Server is running...
   ⚙️  Mode: development
   📡 Port: 4000
   🔗 URL: http://localhost:4000
   🍃 MongoDB: Connected successfully
```

#### Test 1: Health Check

```bash
curl http://localhost:4000/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.123
}
```

#### Test 2: User Signup

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com"
  },
  "message": "User registered successfully"
}
```

**Check:**
- ✅ Response status: 201
- ✅ Cookie `token` is set
- ✅ Password not returned in response
- ✅ User appears in MongoDB

#### Test 3: User Signin

```bash
curl -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Check:**
- ✅ Response status: 200
- ✅ Cookie saved to `cookies.txt`
- ✅ Wrong password returns 401

#### Test 4: Get Current User

```bash
curl http://localhost:4000/api/auth/me \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Check:**
- ✅ Response status: 200
- ✅ Without cookie returns 401

#### Test 5: Generate Interview Questions

```bash
curl -X POST http://localhost:4000/api/vapi/generate \
  -H "Content-Type: application/json" \
  -d '{
    "interviewType": "technical",
    "techStack": ["React", "Node.js"],
    "experienceLevel": "intermediate",
    "amount": 5
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "questions": [
    "Explain React's virtual DOM and reconciliation process...",
    "How does Node.js handle asynchronous operations?",
    "..."
  ]
}
```

**Check:**
- ✅ Returns 5 questions
- ✅ Questions are relevant to tech stack
- ✅ API key works with Google Gemini

#### Test 6: Create Interview

```bash
curl -X POST http://localhost:4000/api/interviews \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "interviewType": "technical",
    "techStack": ["React", "Node.js"],
    "experienceLevel": "intermediate",
    "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "interview": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "interviewType": "technical",
    "techStack": ["React", "Node.js"],
    "experienceLevel": "intermediate",
    "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"],
    "finalized": false,
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Check:**
- ✅ Interview saved to database
- ✅ userId matches authenticated user
- ✅ finalized is false

#### Test 7: Get User Interviews

```bash
curl http://localhost:4000/api/interviews/user \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "interviews": [
    {
      "id": "507f1f77bcf86cd799439012",
      "interviewType": "technical",
      "techStack": ["React", "Node.js"],
      "experienceLevel": "intermediate",
      "finalized": false,
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

#### Test 8: Get Latest Interviews

```bash
curl "http://localhost:4000/api/interviews/latest?limit=3" \
  -b cookies.txt
```

**Check:**
- ✅ Returns max 3 interviews
- ✅ Sorted by createdAt descending

#### Test 9: Get Interview by ID

```bash
curl http://localhost:4000/api/interviews/507f1f77bcf86cd799439012 \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "interview": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "interviewType": "technical",
    "techStack": ["React", "Node.js"],
    "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"],
    "finalized": false
  }
}
```

#### Test 10: Create Feedback

```bash
curl -X POST http://localhost:4000/api/feedback \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "interviewId": "507f1f77bcf86cd799439012",
    "transcript": [
      {"question": "Q1", "answer": "My answer to Q1"},
      {"question": "Q2", "answer": "My answer to Q2"}
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "feedback": {
    "id": "507f1f77bcf86cd799439013",
    "interviewId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "transcript": [...],
    "rating": 7,
    "overallFeedback": "Good understanding of concepts...",
    "improvements": ["Work on explaining edge cases", "..."],
    "createdAt": "2024-01-15T10:40:00.000Z"
  }
}
```

**Check:**
- ✅ Feedback generated via Gemini AI
- ✅ Interview marked as finalized
- ✅ Rating between 1-10

#### Test 11: Get Feedback by Interview

```bash
curl http://localhost:4000/api/feedback/by-interview/507f1f77bcf86cd799439012 \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "feedback": {
    "id": "507f1f77bcf86cd799439013",
    "rating": 7,
    "overallFeedback": "...",
    "improvements": ["..."],
    "transcript": [...]
  }
}
```

#### Test 12: Rate Limiting

```bash
# Try to signup 6 times rapidly
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"User$i\",\"email\":\"user$i@test.com\",\"password\":\"Pass123!\"}"
  echo ""
done
```

**Expected:**
- First 5 requests: Success
- 6th request: 429 Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

### Phase 2: Frontend Integration Testing

#### Start Frontend Server

```bash
# In project root (not server/)
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.2.2
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

#### Test 1: Sign Up Flow

1. Visit http://localhost:3000/sign-up
2. Fill form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "SecurePass123!"
3. Click "Sign Up"

**Check:**
- ✅ Redirects to `/` (dashboard)
- ✅ User data visible
- ✅ No console errors

#### Test 2: Sign In Flow

1. Visit http://localhost:3000/sign-in
2. Enter credentials
3. Click "Sign In"

**Check:**
- ✅ Redirects to dashboard
- ✅ Welcome message shows user name
- ✅ Auth persists on page refresh

#### Test 3: Create Interview

1. On dashboard, click "Start Interview"
2. Select:
   - Type: "Technical"
   - Tech Stack: React, Node.js
   - Experience: "Intermediate"
3. Click "Generate Interview"

**Check:**
- ✅ Loading state shows
- ✅ Questions generated (5 items)
- ✅ Page redirects to `/interview/[id]`
- ✅ Questions display correctly

#### Test 4: Voice Interview (VAPI)

1. On interview page, click "Start Interview"
2. Allow microphone access
3. Answer questions via voice
4. Click "End Interview"

**Check:**
- ✅ VAPI initializes
- ✅ Voice recognition works
- ✅ Transcript captured
- ✅ Redirects to feedback page

#### Test 5: View Feedback

1. On feedback page after interview
2. Review:
   - Overall rating
   - Feedback text
   - Improvement suggestions
   - Transcript

**Check:**
- ✅ Rating 1-10 displayed
- ✅ Feedback from AI is relevant
- ✅ Transcript shows Q&A pairs
- ✅ Can navigate back to dashboard

#### Test 6: Interview History

1. Go to dashboard
2. View "Recent Interviews" section
3. Click on a previous interview

**Check:**
- ✅ All interviews listed
- ✅ Shows status (completed/pending)
- ✅ Click navigates to interview/feedback

#### Test 7: Sign Out

1. Click "Sign Out" button
2. Observe behavior

**Check:**
- ✅ Redirects to sign-in page
- ✅ Cookie cleared
- ✅ Can't access protected pages

### Phase 3: Error Handling Testing

#### Backend Errors

```bash
# Invalid MongoDB ObjectId
curl http://localhost:4000/api/interviews/invalid_id \
  -b cookies.txt

# Expected: 400 Bad Request

# Missing required fields
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Expected: 400 with validation errors

# Unauthorized access
curl http://localhost:4000/api/interviews/user

# Expected: 401 Unauthorized
```

#### Frontend Errors

1. **Network Error**: Stop backend, try to sign in
   - Should show error message
   
2. **Validation**: Submit empty form
   - Should show field errors

3. **404 Page**: Visit `/nonexistent`
   - Should show Next.js 404 page

### Phase 4: Database Verification

#### Connect to MongoDB

```bash
# Using mongosh
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/prepwise"
```

#### Verify Data

```javascript
// Check users collection
db.users.find().pretty()

// Expected: All test users with hashed passwords

// Check indexes
db.users.getIndexes()
// Expected: Index on 'email'

// Check interviews
db.interviews.find().pretty()

// Expected: Interview documents with correct userId references

// Check feedback
db.feedback.find().pretty()

// Expected: Feedback with interviewId references
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench (ab)
# On Windows: Use WSL or download Apache

# Test signup endpoint
ab -n 100 -c 10 -p signup.json -T application/json \
  http://localhost:4000/api/auth/signup

# signup.json:
# {"name":"LoadTest","email":"load@test.com","password":"Test123!"}

# Check:
# - Requests per second
# - Average response time
# - Failed requests (should be 0 after first 5 due to rate limiting)
```

### Response Time Benchmarks

| Endpoint | Expected Time |
|----------|---------------|
| GET /health | < 50ms |
| POST /api/auth/signin | < 200ms |
| GET /api/interviews/user | < 300ms |
| POST /api/vapi/generate | < 5000ms (AI call) |
| POST /api/feedback | < 6000ms (AI call) |

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Error**: `MongooseError: connect ECONNREFUSED`

**Solution**:
1. Check MongoDB Atlas network access
2. Verify connection string in `.env`
3. Ensure IP address is whitelisted

### Issue: CORS Error

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
1. Check `CLIENT_URL` in backend `.env`
2. Ensure frontend URL matches
3. Restart backend server

### Issue: JWT Verification Failed

**Error**: `401 Unauthorized - Invalid token`

**Solution**:
1. Check `JWT_SECRET` matches between requests
2. Clear cookies and sign in again
3. Verify token in browser DevTools → Application → Cookies

### Issue: Gemini API Error

**Error**: `Failed to generate questions/feedback`

**Solution**:
1. Verify `GOOGLE_GENERATIVE_AI_API_KEY` is correct
2. Check Gemini API quota/billing
3. Test API key: https://aistudio.google.com/

### Issue: VAPI Not Starting

**Error**: Voice interview doesn't initialize

**Solution**:
1. Check VAPI credentials in `.env.local`
2. Verify microphone permissions
3. Check browser console for errors
4. Test VAPI separately: https://vapi.ai/dashboard

## Pre-Deployment Checklist

- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] No console errors or warnings
- [ ] Database indexes created
- [ ] Error handling works correctly
- [ ] Rate limiting is effective
- [ ] CORS configured properly
- [ ] Environment variables documented
- [ ] Build succeeds: `npm run build`
- [ ] Production environment variables ready

## Next Steps

After successful local testing:

1. Review [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
2. Set up MongoDB Atlas production cluster
3. Deploy backend to Render
4. Deploy frontend to Vercel
5. Configure production environment variables
6. Test production deployment

## Testing Checklist Summary

### Backend API ✅
- [x] Health check
- [x] User signup
- [x] User signin
- [x] Get current user
- [x] Generate questions
- [x] Create interview
- [x] Get user interviews
- [x] Get latest interviews
- [x] Get interview by ID
- [x] Create feedback
- [x] Get feedback by interview
- [x] Rate limiting

### Frontend Integration ✅
- [x] Sign up flow
- [x] Sign in flow
- [x] Create interview
- [x] Voice interview
- [x] View feedback
- [x] Interview history
- [x] Sign out

### Error Handling ✅
- [x] Invalid requests
- [x] Unauthorized access
- [x] Network errors
- [x] Validation errors

### Database ✅
- [x] Data persisted
- [x] Indexes created
- [x] References valid

🎉 **Ready for production deployment!**
