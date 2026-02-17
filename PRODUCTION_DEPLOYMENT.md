# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Backend (Express + MongoDB)

- [ ] All dependencies installed: `cd server && npm install`
- [ ] Environment variables configured in `.env`
- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] JWT_SECRET generated (64+ random characters)
- [ ] Google Gemini API key obtained
- [ ] Rate limiting configured appropriately
- [ ] CORS origins set to production URLs
- [ ] Database indexes created (automatic on first run)
- [ ] Error logging configured

### ✅ Frontend (Next.js)

- [ ] All dependencies installed: `npm install`
- [ ] `NEXT_PUBLIC_API_BASE_URL` set to production backend URL
- [ ] VAPI credentials configured
- [ ] Firebase dependencies removed (optional cleanup)
- [ ] Build tested locally: `npm run build`

## Backend Deployment (Render)

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Production-ready backend"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Settings:**
- **Name**: `prepwise-backend`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or `Starter` for production)

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=4000
CLIENT_URL=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prepwise
JWT_SECRET=your_64_char_secret_here
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

**Important:** 
- `PORT` is automatically set by Render, but 4000 is a fallback
- `CLIENT_URL` must include your Vercel frontend URL
- Use strong `JWT_SECRET` - generate with: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (2-3 minutes)
3. Note your backend URL: `https://prepwise-backend.onrender.com`

### Step 5: Test Backend

```bash
# Health check
curl https://prepwise-backend.onrender.com/health

# Expected response:
# {"success":true,"status":"ok","timestamp":"...","uptime":123}
```

## Frontend Deployment (Vercel)

### Step 1: Update Environment Variables

Create/update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://prepwise-backend.onrender.com
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://prepwise-backend.onrender.com
   NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
   NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
   ```

6. Click **"Deploy"**

### Step 3: Update Backend CORS

After deployment, update backend `CLIENT_URL` on Render:
```env
CLIENT_URL=https://your-app.vercel.app,http://localhost:3000
```

Redeploy backend for changes to take effect.

### Step 4: Test Full Stack

1. Visit your Vercel URL
2. Sign up for a new account
3. Generate an interview
4. Take an interview
5. View feedback

## MongoDB Atlas Setup

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account / Sign in
3. **Create a New Cluster**:
   - Provider: AWS / GCP / Azure
   - Region: Same as your backend
   - Tier: M0 Sandbox (Free)
   - Cluster Name: `prepwise`

### Step 2: Create Database User

1. Go to **Database Access**
2. Click **"Add New Database User"**
3. Create user with username/password
4. Set permissions: **Read and write to any database**
5. Save credentials securely

### Step 3: Configure Network Access

1. Go to **Network Access**
2. Click **"Add IP Address"**
3. Options:
   - **Development**: Add your current IP
   - **Production**: Add `0.0.0.0/0` (allow from anywhere)
   - **Best Practice**: Add Render's IP ranges

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy connection string:
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user password
5. Add database name: `.../prepwise?retryWrites=true...`

### Step 5: Test Connection

```bash
# Install MongoDB Compass (GUI)
# Or use mongosh (CLI)
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/prepwise"
```

## Performance Optimization

### Backend

1. **Enable HTTP/2** (Render does this automatically)
2. **Database Indexes**: Already configured in models
3. **Response Compression**: Enabled via `compression` middleware
4. **Rate Limiting**: Configured for auth endpoints

### Frontend

1. **Image Optimization**: Use Next.js `<Image/>` component
2. **Code Splitting**: Automatic with Next.js
3. **Static Generation**: Pages are pre-rendered where possible
4. **Edge Functions**: Vercel Edge Network

### MongoDB

```javascript
// Create indexes manually if needed
db.users.createIndex({ email: 1 });
db.interviews.createIndex({ userId: 1, createdAt: -1 });
db.feedback.createIndex({ interviewId: 1, userId: 1 });
```

## Monitoring & Logging

### Backend Logs (Render)

1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Monitor for errors

### Frontend Analytics (Vercel)

1. Enable Vercel Analytics
2. Go to Project Settings → Analytics

### Database Monitoring (MongoDB Atlas)

1. Go to **Metrics** tab
2. Monitor:
   - Connections
   - Operations per second
   - Storage usage

## Security Checklist

- [x] HTTPS enabled (automatic on Render/Vercel)
- [x] Helmet security headers
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] JWT in HTTP-only cookies
- [x] Password hashing with bcrypt (12 rounds)
- [x] Input validation on all endpoints
- [x] MongoDB injection protection
- [x] Environment variables secure

## Scaling

### When to Scale

- **Free Tier Limits Reached**:
  - Render: 750hrs/month
  - MongoDB Atlas: 512MB storage
  - Vercel: Fair use

- **Performance Issues**:
  - Response times > 2s
  - High error rates
  - Database slow queries

### Scaling Options

**Backend (Render):**
- Upgrade to Starter ($7/month) or higher
- Enable auto-scaling
- Add Redis for caching

**Database (MongoDB Atlas):**
- Upgrade to M10+ for dedicated resources
- Enable auto-scaling storage
- Set up read replicas

**Frontend (Vercel):**
- Pro plan for commercial use
- Edge functions for dynamic content
- CDN caching optimization

## Troubleshooting

### Backend won't start
```bash
# Check logs on Render
# Common issues:
# - Missing environment variables
# - MongoDB connection string incorrect
# - Build command failed
```

### CORS errors
```bash
# Ensure CLIENT_URL includes frontend domain
CLIENT_URL=https://your-app.vercel.app

# Check browser console for actual error
```

### Database connection timeout
```bash
# Check MongoDB Atlas:
# - Network access allows Render IPs
# - Connection string is correct
# - User has proper permissions
```

### 502 Bad Gateway
```bash
# Backend may be starting or crashed
# Check Render logs
# Check MongoDB connection
```

## Backup & Recovery

### Database Backups

**MongoDB Atlas** (automatic):
- Go to **Backup** tab
- Enable **Cloud Backup**
- Configure backup schedule
- Free tier: 1 snapshot stored

### Application Backup

```bash
# Export environments from Render
# Download database dump
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore if needed
mongorestore --uri="mongodb+srv://..." ./backup
```

## Cost Breakdown (Production)

### Free Tier
- **Backend**: Render Free (750hrs/month)
- **Database**: MongoDB Atlas M0 (512MB)
- **Frontend**: Vercel Hobby (unlimited)
- **Total**: $0/month

### Starter Tier
- **Backend**: Render Starter ($7/month)
- **Database**: MongoDB Atlas M10 ($57/month)
- **Frontend**: Vercel Pro ($20/month)
- **Total**: ~$84/month

### Production Ready
- **Backend**: Render Standard ($25/month)
- **Database**: MongoDB Atlas M20 ($96/month)
- **Frontend**: Vercel Pro ($20/month)
- **Total**: ~$141/month

## Support

- **Render**: [render.com/docs](https://render.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB**: [mongodb.com/docs/atlas](https://www.mongodb.com/docs/atlas)

🎉 **Your PrepWise app is now production-ready!**
