# 🔧 Troubleshooting: Account Creation Failed

## Problem: Sign-Up Fails

When you try to create an account, you get an error message instead of being redirected to the dashboard.

---

## Root Causes

### ❌ Most Likely: MongoDB Not Running

The backend needs MongoDB to save user accounts. If MongoDB isn't running:
- Signup endpoint tries to create user
- MongoDB connection fails
- Error response sent to frontend
- Toast shows error message

---

## Solution: Start MongoDB

### Option 1: Local MongoDB (Easiest for Development)

**If you have MongoDB installed locally:**

```powershell
# Start MongoDB
mongod

# You should see:
# [initandlisten] waiting for connections on port 27017
```

**Then start servers:**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create MongoDB Atlas account:**
   - Go to https://cloud.mongodb.com
   - Sign up (free tier available)
   - Create a cluster

2. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update `server/.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepwise?retryWrites=true&w=majority
   ```

4. **Restart backend:**
   ```bash
   cd server
   npm run dev
   ```

### Option 3: Docker MongoDB (Advanced)

If you have Docker installed:

```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# MongoDB will be available at: mongodb://localhost:27017/prepwise
```

---

## Verify MongoDB is Running

### Test Connection

```powershell
# If MongoDB is running, this should show connection info:
mongosh "mongodb://localhost:27017/prepwise"

# Expected output:
# prepwise> 
```

If you get an error like "connect ECONNREFUSED", MongoDB isn't running.

---

## Check Backend Errors

### View Backend Logs

When you run `npm run dev` in the server folder, look for this:

**✅ Working:**
```
✅ MongoDB Connected: localhost
   ✓ Server running on port 4000
```

**❌ Not Working:**
```
❌ MongoDB connection failed: connect ECONNREFUSED
```

---

## Test Account Creation Manually

If you want to verify the backend is working:

```powershell
# In PowerShell, create a new account:
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/auth/signup" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "Account created successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "MongoDB connection failed"
}
```

---

## Quick Checklist

- [ ] MongoDB is running (`mongod` or Docker)
- [ ] `server/.env` has correct `MONGODB_URI`
- [ ] Backend started: `npm run dev` in server/
- [ ] Frontend started: `npm run dev` in project root
- [ ] No errors in backend terminal
- [ ] Visit http://localhost:3000
- [ ] Try signup again

---

## Common Errors & Fixes

### ❌ "Connection refused"

**Cause**: MongoDB not running

**Fix**:
```bash
# Start MongoDB locally
mongod

# Or use Atlas instead (cloud)
```

---

### ❌ "MONGODB_URI is not set"

**Cause**: Missing env variable in `server/.env`

**Fix**: Create/update `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/prepwise
```

Then restart backend.

---

### ❌ "Invalid connection string"

**Cause**: Incorrect MongoDB URI format

**Fix**: Check format:
- Local: `mongodb://localhost:27017/prepwise`
- Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/prepwise?retryWrites=true`

---

### ❌ "Authentication failed" (Atlas only)

**Cause**: Wrong username/password in connection string

**Fix**: 
1. Go to MongoDB Atlas dashboard
2. Click "Database Access"
3. Create new database user or reset password
4. Update connection string with correct credentials

---

## Development Without MongoDB (Workaround)

If you don't want to set up MongoDB yet, you can mock the database:

**Coming soon**: In-memory database for development

Currently, MongoDB is required.

---

## Next Steps

1. **Follow Solution steps above** to get MongoDB running
2. **Verify the quick checklist** is all green
3. **Try signup again** at http://localhost:3000/sign-up
4. **If it works** → Continue building! 🎉
5. **If it still fails** → Check backend logs for specific error

---

## Need More Help?

### Check These Docs
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Developer commands

### Backend Logs
- Look at `npm run dev` output in server/ terminal
- Errors will show why requests are failing

### Manual Testing
- Use the curl/PowerShell test example above
- This tests the backend directly without frontend

---

## Success Indicators

✅ **Backend logs show**: `✅ MongoDB Connected`  
✅ **Sign up form works**: No error toast  
✅ **Redirect to dashboard**: You see the interview list  
✅ **Database saved user**: Check MongoDB with `mongosh`  

Once you see these, account creation is working! 🚀
