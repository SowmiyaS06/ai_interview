# PrepWise - Developer Quick Reference

## 🚀 Quick Start Commands

### Development
```bash
# Backend
cd server && npm run dev

# Frontend (new terminal)
npm run dev

# Visit
http://localhost:3000 (Frontend)
http://localhost:4000 (Backend)
```

### Production Build
```bash
# Backend
cd server && npm start

# Frontend
npm run build && npm start
```

---

## 🔑 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_VAPI_WEB_TOKEN=<your_token>
NEXT_PUBLIC_VAPI_WORKFLOW_ID=<your_id>
```

### Backend (server/.env)
```env
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64_char_secret>
GOOGLE_GENERATIVE_AI_API_KEY=<gemini_key>
```

---

## 📡 API Endpoints Cheatsheet

### Auth
```bash
POST /api/auth/signup      # Create account
POST /api/auth/signin      # Login
POST /api/auth/signout     # Logout
GET  /api/auth/me          # Current user
```

### Interviews
```bash
GET  /api/interviews/user              # All user interviews
GET  /api/interviews/latest?limit=10   # Latest N interviews
GET  /api/interviews/:id               # Single interview
POST /api/interviews                   # Create interview
```

### Feedback
```bash
POST /api/feedback                     # Generate feedback
GET  /api/feedback/by-interview/:id    # Get feedback
```

### AI Generation
```bash
POST /api/vapi/generate   # Generate questions
```

---

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Pass123!"}'
```

### Signin (save cookie)
```bash
curl -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!"}' \
  -c cookies.txt
```

### Get Current User
```bash
curl http://localhost:4000/api/auth/me -b cookies.txt
```

### Generate Questions
```bash
curl -X POST http://localhost:4000/api/vapi/generate \
  -H "Content-Type: application/json" \
  -d '{
    "interviewType":"technical",
    "techStack":["React","Node.js"],
    "experienceLevel":"intermediate",
    "amount":5
  }'
```

### Create Interview
```bash
curl -X POST http://localhost:4000/api/interviews \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "interviewType":"technical",
    "techStack":["React"],
    "experienceLevel":"intermediate",
    "questions":["Q1","Q2","Q3","Q4","Q5"]
  }'
```

---

## 🗄️ MongoDB Quick Commands

### Connect
```bash
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/prepwise"
```

### View Collections
```javascript
show collections
db.users.find().pretty()
db.interviews.find().pretty()
db.feedback.find().pretty()
```

### Check Indexes
```javascript
db.users.getIndexes()
db.interviews.getIndexes()
db.feedback.getIndexes()
```

### Delete All Data (Dangerous!)
```javascript
db.users.deleteMany({})
db.interviews.deleteMany({})
db.feedback.deleteMany({})
```

---

## 🔧 Common Issues & Fixes

### CORS Error
```bash
# Check CLIENT_URL in server/.env
CLIENT_URL=http://localhost:3000

# Restart backend server
```

### MongoDB Connection Failed
```bash
# Check connection string
# Verify IP whitelist in MongoDB Atlas
# Test connection:
mongosh "your_connection_string"
```

### JWT Verification Failed
```bash
# Clear cookies
# Sign in again
# Check JWT_SECRET matches
```

### Port Already in Use
```bash
# Kill process on port 4000 (backend)
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:4000 | xargs kill -9
```

---

## 📦 Dependency Updates

### Check Outdated Packages
```bash
# Frontend
npm outdated

# Backend
cd server && npm outdated
```

### Update All Dependencies
```bash
# Frontend
npm update

# Backend
cd server && npm update
```

---

## 🐛 Debugging

### Backend Logs
```javascript
// In server code
console.log('Debug:', variable);

// Or use morgan (already configured)
// Logs appear in terminal
```

### Frontend Logs
```typescript
// In Next.js code
console.log('Debug:', variable);

// Server-side logs: Check terminal
// Client-side logs: Check browser console
```

### Database Queries
```javascript
// Add to models
const result = await Model.find(query);
console.log('Query result:', result);
```

---

## 🔐 Security Checklist

- [ ] Environment variables not committed
- [ ] JWT_SECRET is 64+ random characters
- [ ] MongoDB user has minimal permissions
- [ ] CORS origins whitelist production URLs
- [ ] Rate limiting enabled
- [ ] Helmet headers active
- [ ] Input validation on all routes
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] HTTP-only cookies for JWT
- [ ] MongoDB injection protection active

---

## 📊 Performance Tips

### Backend
- Use MongoDB indexes (already configured)
- Enable compression (already enabled)
- Cache frequent queries (future enhancement)
- Use connection pooling (already configured)

### Frontend
- Use Next.js `<Image>` component
- Lazy load components
- Optimize bundle size
- Enable static generation where possible

---

## 🎯 User Flow Summary

```
Sign Up → Dashboard → Create Interview → 
Generate Questions → Voice Interview (VAPI) → 
AI Feedback → View Results → Repeat
```

---

## 📝 Code Snippets

### Add New API Endpoint
```javascript
// server/src/routes/example.routes.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/example', authenticate, async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

// Add to server/src/index.js
import exampleRoutes from './routes/example.routes.js';
app.use('/api/example', exampleRoutes);
```

### Add MongoDB Model
```javascript
// server/src/models/Example.js
import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

exampleSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Example', exampleSchema);
```

### Frontend Server Action
```typescript
// lib/actions/example.action.ts
"use server";
import { fetchApi } from "@/lib/api";

export async function getExample() {
  try {
    const response = await fetchApi("/api/example");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create PR on GitHub
```

---

## 📚 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [VAPI Docs](https://docs.vapi.ai/)
- [Gemini AI](https://ai.google.dev/gemini-api/docs)

---

## 🎓 Tech Stack Versions

| Technology | Version |
|-----------|---------|
| Node.js | 18+ |
| Next.js | 15.2.2 |
| React | 19.0.0 |
| Express | 4.19.2 |
| MongoDB | 8.8.3 |
| TypeScript | 5.x |

---

## 💡 Tips

1. **Always save cookies** when testing auth with cURL
2. **Check terminal logs** for backend errors
3. **Clear browser cache** if seeing stale data
4. **Use MongoDB Compass** for easier database inspection
5. **Keep .env files** updated when adding new variables
6. **Test locally** before deploying to production
7. **Run npm install** after pulling new changes

---

## 🆘 Emergency Contacts

### Services Down?
- **MongoDB Atlas**: [status.mongodb.com](https://status.mongodb.com)
- **Render**: [status.render.com](https://status.render.com)
- **Vercel**: [vercel-status.com](https://vercel-status.com)
- **Google AI**: [status.cloud.google.com](https://status.cloud.google.com)

### Rate Limits
- **Auth endpoints**: 5 requests / 15 minutes
- **General API**: 100 requests / 15 minutes (dev: 1000)
- **Gemini API**: 60 requests / minute (free tier)

---

## 🎉 Quick Commands

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Find process on port
# Windows: netstat -ano | findstr :4000
# Linux/Mac: lsof -i :4000
```

---

**Keep this reference handy during development! 🚀**
