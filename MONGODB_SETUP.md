# 📦 MongoDB Setup Guide

## Quick Setup

### Option 1: Use MongoDB Atlas (Cloud) - RECOMMENDED ⭐

**Easiest for beginners. No installation needed.**

1. **Sign up**: https://www.mongodb.com/cloud/atlas
2. **Create free cluster** (M0 tier - free forever)
3. **Get connection string**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   
4. **Update `server/.env`**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepwise?retryWrites=true&w=majority
   ```

5. **Restart backend**:
   ```bash
   cd server
   npm run dev
   ```

✅ **Done! Your database is now in the cloud.**

---

### Option 2: Local MongoDB Installation

#### Windows

**Using Chocolatey (recommended):**
```powershell
# Install MongoDB
choco install mongodb-community

# Start MongoDB
mongod
```

**Or download from MongoDB:**
1. Go to: https://www.mongodb.com/try/download/community
2. Download Windows installer
3. Run installer
4. Start MongoDB: `mongod`

#### Mac

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Linux (Ubuntu)

```bash
# Add MongoDB repo
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start
sudo systemctl start mongod
```

**After installation**, update `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/prepwise
```

---

### Option 3: Docker (Advanced)

```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# For detailed setup:
# docker run -d -p 27017:27017 \
#   -v mongodb_data:/data/db \
#   --name mongodb \
#   mongo:latest
```

Update `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/prepwise
```

---

## Verify Installation

### Test if MongoDB is Running

```powershell
# Connect to MongoDB database
mongosh mongodb://localhost:27017/prepwise

# You should see: prepwise>
# Type: exit
```

If you see an error like "connect ECONNREFUSED", MongoDB isn't running.

---

## Common Issues

### ❌ "mongod command not found"

**Solution**: MongoDB isn't in your PATH
- Windows: Reinstall MongoDB Community
- Mac: `brew install mongodb-community`
- Linux: `sudo systemctl start mongod`

---

### ❌ "Connection refused"

**Solution**: MongoDB isn't running
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Search for "MongoDB" in Services and start it
# Or run: mongod
```

---

### ❌ "Authentication failed" (Atlas)

**Solution**: Wrong credentials in connection string
1. Go to MongoDB Atlas
2. Click "Database Access"
3. Create/reset database user
4. Copy correct connection string with username:password

---

## Using MongoDB

### Connect with mongosh

```bash
mongosh mongodb://localhost:27017/prepwise
```

### View Collections

```javascript
# In mongosh:
show collections
db.users.find()
db.interviews.find()
db.feedback.find()
```

### Delete All Data

```javascript
# WARNING: This deletes everything!
db.users.deleteMany({})
db.interviews.deleteMany({})
db.feedback.deleteMany({})
```

---

## Create Initial User (Manual)

If you want to test before frontend is ready:

```bash
mongosh mongodb://localhost:27017/prepwise
```

```javascript
# Create a user with bcrypt hash
# hash of "test123" with 12 rounds
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  passwordHash: "$2a$12$abc...", // bcrypt hash
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Performance Tips

### Indexes
Indexes are automatically created on first run. You can verify:

```javascript
db.users.getIndexes()
# Should show: email index, timestamps
```

### Connection Pooling
Already configured in backend:
- Max pool size: 10
- Selection timeout: 5 seconds
- Socket timeout: 45 seconds

---

## Backup & Export

### Export Data

```bash
# Export users collection
mongodump --uri="mongodb://localhost:27017/prepwise" \
  --collection=users --out=./backup

# Export all data
mongodump --uri="mongodb://localhost:27017/prepwise" --out=./backup
```

### Import Data

```bash
# Import from backup
mongorestore --uri="mongodb://localhost:27017/prepwise" ./backup/prepwise
```

---

## Next Steps

1. **Choose an option**: Atlas (cloud) or Local
2. **Set up MongoDB** following the steps above
3. **Update `server/.env`** with your connection string
4. **Restart backend**: `cd server && npm run dev`
5. **Test signup**: Go to http://localhost:3000/sign-up

---

## Status Check

### ✅ Everything working when you see:

In backend logs:
```
✅ MongoDB Connected: localhost
   ✓ Server running on port 4000
```

In mongosh:
```
prepwise> db.version()
# Should return a version number
```

In your browser signup:
```
✅ Account created successfully
📍 Redirected to dashboard
```

---

**Pick an option and get your database running! 🚀**
