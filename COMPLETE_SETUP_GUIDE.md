# PPL Aviation Quiz System - Complete Setup Guide

## 🎯 What You Have

A complete PPL(A) aviation quiz system with:
- ✅ 9 quiz subjects with full question banks
- ✅ Random test variants (12 or 16 questions)
- ✅ Progress tracking (local and backend options)
- ✅ User authentication system
- ✅ REST API backend with database
- ✅ Professional UI with pass/fail results

## 📦 Package Contents

### Frontend Files (Quiz HTML)
Located in main outputs directory:

**Full Quiz Files:**
1. Air-law-test-flyczech.html (97 questions)
2. human-performance-test-flyczech.html (58 questions)
3. meteo-test-flyczech.html (129 questions)
4. comms-test-flyczech.html (87 questions)
5. POF-test-flyczech.html (102 questions)
6. operational-procedures-test-flyczech.html (61 questions)
7. aircraft-general-knowledge-test-flyczech.html (128 questions)
8. flight-performance-planning-test-flyczech.html (102 questions)
9. navigation-test-flyczech.html (137 questions)

**Random Test Files:**
1. Air-law-test-random-12.html
2. human-performance-test-random-12.html
3. meteo-test-random-12.html
4. comms-test-random-12.html
5. POF-test-random-12.html
6. operational-procedures-test-random-12.html
7. aircraft-general-knowledge-test-random-16.html
8. flight-performance-planning-test-random-16.html
9. navigation-test-random-16.html

### Backend Files
Located in `ppl-quiz-backend/` directory:
- server.js - Express server with API endpoints
- database.js - SQLite database setup
- package.json - Node.js dependencies
- README.md - Backend documentation
- INTEGRATION_GUIDE.md - How to connect quizzes to backend
- quiz-api-client.js - Frontend API helper
- login.html - Authentication page
- .env.example - Environment variables template

## 🚀 Quick Start Options

### Option 1: Simple (No Backend - Local Storage Only)

Perfect for personal use or offline practice.

1. **Upload quiz HTML files to web hosting**
   - Upload all 18 quiz HTML files
   - Access via browser
   - Progress saves in browser localStorage

2. **Or run locally**
   ```bash
   # Open any quiz file in your browser
   open Air-law-test-random-12.html
   ```

**Pros:**
- ✅ Super simple setup
- ✅ No server needed
- ✅ Works offline

**Cons:**
- ❌ Progress not synced across devices
- ❌ Progress clears if cookies/cache cleared
- ❌ No user accounts

### Option 2: Full System (With Backend)

Perfect for schools, flight training organizations, or multi-device access.

#### Step 1: Deploy Backend

**A. Using Heroku (Easiest)**
```bash
cd ppl-quiz-backend
heroku create your-app-name
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

**B. Using Railway.app**
1. Go to railway.app
2. Connect GitHub repo
3. Add environment variables
4. Deploy automatically

**C. Using VPS**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup app
cd ppl-quiz-backend
npm install

# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Create .env file with your secret
cp .env.example .env
nano .env  # Add your JWT_SECRET

# Start with PM2
npm install -g pm2
pm2 start server.js --name ppl-quiz-api
pm2 save
pm2 startup
```

#### Step 2: Update Frontend Files

1. **Edit quiz-api-client.js**
   ```javascript
   const API_URL = 'https://your-backend-url.com/api';
   ```

2. **Follow INTEGRATION_GUIDE.md** to update each quiz file

#### Step 3: Deploy Frontend

Upload all HTML files + quiz-api-client.js to:
- Netlify
- Vercel
- GitHub Pages
- Any web hosting

#### Step 4: Test

1. Open login.html
2. Register new account
3. Take a quiz
4. Log out and log back in
5. Verify progress persisted

## 🎓 Usage Guide

### For Students

1. **Create Account**
   - Go to login page
   - Click "Register"
   - Choose username and password

2. **Take Quizzes**
   - Select any quiz from menu
   - Click "🎲 Take Random Test"
   - Answer 12 or 16 questions
   - Get instant feedback
   - See if you passed (75% required)

3. **Track Progress**
   - View attempts, passes, and pass rate
   - Progress saves automatically
   - Access from any device (if using backend)

4. **Reset Progress** (if needed)
   - Click "🔄 Reset Progress" button
   - Confirm to clear stats for that quiz

### For Instructors

1. **View Overall Stats**
   ```bash
   # Query database directly
   sqlite3 quiz_progress.db "SELECT username, SUM(attempts) as attempts, SUM(passes) as passes FROM users JOIN quiz_progress ON users.id = quiz_progress.user_id GROUP BY username"
   ```

2. **Monitor Student Progress**
   - Access database for detailed analytics
   - Export to CSV for reporting

## 🔒 Security Notes

### Important for Production

1. **Change JWT_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Use output in .env file

2. **Use HTTPS**
   - Required for production
   - Free SSL with Let's Encrypt or Cloudflare

3. **Set CORS properly**
   - Only allow your frontend domain
   - Edit server.js cors configuration

4. **Backup Database**
   ```bash
   # SQLite backup
   cp quiz_progress.db quiz_progress.db.backup
   ```

## 📊 Database Schema

### Users
- id (Primary Key)
- username (Unique)
- password (Hashed with bcrypt)
- email (Optional)
- created_at

### Quiz Progress
- id (Primary Key)
- user_id (Foreign Key)
- quiz_name
- attempts
- passes
- last_updated

### Quiz Attempts (History)
- id (Primary Key)
- user_id (Foreign Key)
- quiz_name
- score
- total_questions
- passed
- attempt_date

## 🛠️ Customization

### Change Pass Threshold

In each random test HTML file, find:
```javascript
const passed = percentage >= 75;
```
Change 75 to your desired percentage.

### Add More Quizzes

1. Create new HTML file following existing pattern
2. Add to backend with unique quiz_name
3. Update quiz selection menu

### Modify Styling

Each quiz has embedded CSS. Search for:
- `--primary:` to change main color
- `--success:` to change success color
- `--error:` to change error color

## 📞 Support & Troubleshooting

### Common Issues

**Backend won't start**
- Check Node.js installed: `node -v`
- Check dependencies: `npm install`
- Check port 3000 not in use

**Can't connect to backend**
- Verify API_URL in quiz-api-client.js
- Check backend is running
- Check CORS settings

**Progress not saving**
- Check browser console for errors
- Verify logged in
- Check token not expired

**Database locked**
- Only run one server instance
- SQLite doesn't support multiple writers

### Getting Help

1. Check README.md
2. Check INTEGRATION_GUIDE.md
3. Review server logs
4. Check browser console

## 🎉 You're Ready!

You now have:
- ✅ Complete quiz system
- ✅ User authentication
- ✅ Progress tracking
- ✅ Backend API
- ✅ Database storage
- ✅ Professional UI

Choose your deployment option and launch your PPL quiz platform!

## 📈 Next Steps

**Enhancements you could add:**
- Email verification
- Password reset functionality
- Admin dashboard
- Detailed analytics
- Certificate generation
- Mobile app
- Timed exams
- Question randomization within tests
- Leaderboards

Happy flying! ✈️
