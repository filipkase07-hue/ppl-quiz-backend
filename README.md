# PPL Aviation Quiz Backend API

A RESTful API backend for tracking user progress across PPL(A) aviation quiz tests. Built with Node.js, Express, and SQLite.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Progress Tracking**: Track attempts, passes, and pass rates for each quiz
- **Attempt History**: Detailed history of all quiz attempts
- **Overall Statistics**: Get comprehensive stats across all quizzes
- **SQLite Database**: Easy setup with SQLite (can be upgraded to PostgreSQL)
- **CORS Enabled**: Ready for frontend integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. **Navigate to backend directory**
   ```bash
   cd ppl-quiz-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file and change JWT_SECRET**
   ```bash
   # Generate a secure secret key:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste it as JWT_SECRET in .env

5. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "pilot123",
  "password": "securepassword",
  "email": "pilot@example.com"  // optional
}

Response:
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "pilot123"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "pilot123",
  "password": "securepassword"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "pilot123"
  }
}
```

### Progress Tracking (Requires Authentication)

All progress endpoints require the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

#### Get All Progress
```http
GET /api/progress

Response:
{
  "progress": [
    {
      "quiz_name": "air_law_test_random_12",
      "attempts": 5,
      "passes": 4
    },
    {
      "quiz_name": "navigation_test_random_16",
      "attempts": 3,
      "passes": 2
    }
  ]
}
```

#### Get Progress for Specific Quiz
```http
GET /api/progress/air_law_test_random_12

Response:
{
  "progress": {
    "quiz_name": "air_law_test_random_12",
    "attempts": 5,
    "passes": 4
  }
}
```

#### Update Progress (Record Attempt)
```http
POST /api/progress
Content-Type: application/json

{
  "quiz_name": "air_law_test_random_12",
  "passed": true,
  "score": 10,
  "total_questions": 12
}

Response:
{
  "message": "Progress updated",
  "progress": {
    "quiz_name": "air_law_test_random_12",
    "attempts": 6,
    "passes": 5
  }
}
```

#### Reset Quiz Progress
```http
DELETE /api/progress/air_law_test_random_12

Response:
{
  "message": "Progress reset successfully"
}
```

#### Get Attempt History
```http
GET /api/history/air_law_test_random_12

Response:
{
  "history": [
    {
      "score": 10,
      "total_questions": 12,
      "passed": 1,
      "attempt_date": "2026-01-07 15:30:00"
    }
  ]
}
```

### Statistics

#### Get Overall Statistics
```http
GET /api/stats

Response:
{
  "stats": {
    "total_attempts": 25,
    "total_passes": 20,
    "pass_rate": 80
  }
}
```

### Health Check

```http
GET /api/health

Response:
{
  "status": "OK",
  "message": "PPL Quiz Backend is running"
}
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Quiz Progress Table
```sql
CREATE TABLE quiz_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_name TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, quiz_name)
);
```

### Quiz Attempts Table
```sql
CREATE TABLE quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🌐 Deployment

### Option 1: Heroku

1. Create a Heroku app:
   ```bash
   heroku create your-ppl-quiz-api
   ```

2. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your-generated-secret
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

### Option 2: DigitalOcean App Platform

1. Create a new app from GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically

### Option 3: Railway

1. Connect your GitHub repository
2. Add environment variables
3. Deploy with one click

### Option 4: VPS (Ubuntu)

1. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Clone your repository:
   ```bash
   git clone <your-repo>
   cd ppl-quiz-backend
   ```

3. Install dependencies and PM2:
   ```bash
   npm install
   sudo npm install -g pm2
   ```

4. Create .env file with your settings

5. Start with PM2:
   ```bash
   pm2 start server.js --name ppl-quiz-api
   pm2 save
   pm2 startup
   ```

6. Set up Nginx reverse proxy (optional):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔐 Security Best Practices

1. **Change JWT_SECRET**: Always use a secure, random secret in production
2. **Use HTTPS**: Deploy behind a reverse proxy with SSL/TLS
3. **Environment Variables**: Never commit .env files to version control
4. **Rate Limiting**: Consider adding rate limiting middleware
5. **Input Validation**: Add validation middleware for user inputs
6. **CORS**: Configure ALLOWED_ORIGINS for production

## 🔄 Upgrading to PostgreSQL

To use PostgreSQL instead of SQLite:

1. Install pg package:
   ```bash
   npm install pg
   ```

2. Update database.js to use PostgreSQL connection

3. Set database environment variables in .env

## 📝 Quiz Name Mapping

Frontend quiz names should match these values:

- `air_law_test_random_12`
- `human_performance_test_random_12`
- `meteo_test_random_12`
- `comms_test_random_12`
- `pof_test_random_12`
- `operational_procedures_test_random_12`
- `aircraft_general_knowledge_test_random_16`
- `flight_performance_planning_test_random_16`
- `navigation_test_random_16`

## 🐛 Troubleshooting

### Database locked error
If you get "database is locked" error, make sure only one instance of the server is running.

### CORS errors
Check that your frontend origin is allowed in the CORS configuration.

### JWT errors
Make sure the JWT_SECRET matches between server restarts and that tokens haven't expired.

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

MIT License - feel free to use this for your projects!
