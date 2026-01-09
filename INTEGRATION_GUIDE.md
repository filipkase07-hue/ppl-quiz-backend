# Integration Guide: Connecting Quiz Files to Backend

This guide explains how to update your existing quiz HTML files to use the backend API for progress tracking instead of localStorage.

## Overview

The backend provides centralized user progress tracking across all devices. Users can log in and their progress will be saved to the server.

## Files Needed

1. `quiz-api-client.js` - Include this in all quiz HTML files
2. Backend API running on a server

## Steps to Integrate

### Step 1: Update API URL

In `quiz-api-client.js`, change the API_URL to your deployed backend:

```javascript
const API_URL = 'https://your-backend-domain.com/api'; // Your backend URL
```

### Step 2: Add Script to Quiz HTML

Add this script tag to your quiz HTML files (before the closing `</body>` tag but before the quiz's own scripts):

```html
<script src="quiz-api-client.js"></script>
```

### Step 3: Replace Progress Tracking Functions

In each random quiz HTML file, replace the progress tracking code with the backend version:

#### OLD CODE (localStorage version):
```javascript
// Progress tracking with localStorage
const STORAGE_KEY = 'air_law_test_random_12_progress';

function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return { attempts: 0, passes: 0 };
}

function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateProgressDisplay() {
    const progress = loadProgress();
    document.getElementById('total-attempts').textContent = progress.attempts;
    document.getElementById('total-passes').textContent = progress.passes;
    
    const passRate = progress.attempts > 0 
        ? Math.round((progress.passes / progress.attempts) * 100) 
        : 0;
    document.getElementById('pass-rate').textContent = passRate + '%';
}

function recordAttempt(passed) {
    const progress = loadProgress();
    progress.attempts++;
    if (passed) {
        progress.passes++;
    }
    saveProgress(progress);
    updateProgressDisplay();
}

function resetProgress() {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        updateProgressDisplay();
        alert('Progress has been reset!');
    }
}

// Initialize progress display on page load
updateProgressDisplay();
```

#### NEW CODE (Backend API version):
```javascript
// Progress tracking with Backend API
const QUIZ_NAME = 'air_law_test_random_12'; // Change this for each quiz

// Check if user is logged in
if (!quizAPI.isLoggedIn()) {
    if (confirm('You need to be logged in to track your progress. Would you like to log in now?')) {
        window.location.href = 'login.html';
    }
}

async function loadProgress() {
    if (!quizAPI.isLoggedIn()) {
        return { attempts: 0, passes: 0 };
    }
    
    const result = await quizAPI.getProgress(QUIZ_NAME);
    if (result.success) {
        return result.data;
    }
    return { attempts: 0, passes: 0 };
}

async function updateProgressDisplay() {
    const progress = await loadProgress();
    document.getElementById('total-attempts').textContent = progress.attempts || 0;
    document.getElementById('total-passes').textContent = progress.passes || 0;
    
    const attempts = progress.attempts || 0;
    const passes = progress.passes || 0;
    const passRate = attempts > 0 ? Math.round((passes / attempts) * 100) : 0;
    document.getElementById('pass-rate').textContent = passRate + '%';
}

async function recordAttempt(passed) {
    if (!quizAPI.isLoggedIn()) {
        console.log('Not logged in, skipping progress save');
        return;
    }
    
    const result = await quizAPI.recordAttempt(
        QUIZ_NAME, 
        passed, 
        correctAnswers, 
        questions.length
    );
    
    if (result.success) {
        await updateProgressDisplay();
    }
}

async function resetProgress() {
    if (!quizAPI.isLoggedIn()) {
        alert('You need to be logged in to reset progress');
        return;
    }
    
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
        const result = await quizAPI.resetProgress(QUIZ_NAME);
        if (result.success) {
            await updateProgressDisplay();
            alert('Progress has been reset!');
        } else {
            alert('Error resetting progress: ' + result.error);
        }
    }
}

// Initialize progress display on page load
updateProgressDisplay();

// Add user info display
if (quizAPI.isLoggedIn()) {
    const user = quizAPI.getUser();
    console.log('Logged in as:', user.username);
}
```

### Step 4: Update recordAttempt Call Location

Make sure `recordAttempt()` is called in the `showResults()` function AFTER calculating the score:

```javascript
function showResults() {
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const passed = percentage >= 75;
    
    // Record attempt to backend
    recordAttempt(passed);
    
    // ... rest of showResults code
}
```

### Step 5: Add User Menu (Optional)

Add a user menu to show logged-in status and logout option:

```html
<!-- Add this after the header in your HTML -->
<div class="user-menu" id="user-menu" style="display: none;">
    <div style="background: rgba(255, 255, 255, 0.98); border-radius: 12px; padding: 15px 30px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); display: flex; justify-content: space-between; align-items: center;">
        <span>👤 Logged in as: <strong id="username-display"></strong></span>
        <button onclick="logout()" style="background: var(--error); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">Logout</button>
    </div>
</div>

<script>
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        quizAPI.logout();
        window.location.href = 'login.html';
    }
}

// Show user menu if logged in
if (quizAPI.isLoggedIn()) {
    document.getElementById('user-menu').style.display = 'block';
    document.getElementById('username-display').textContent = quizAPI.getUser().username;
}
</script>
```

## Quiz Name Reference

Use these exact names for the QUIZ_NAME constant:

- Air Law: `air_law_test_random_12`
- Human Performance: `human_performance_test_random_12`
- Meteorology: `meteo_test_random_12`
- Communications: `comms_test_random_12`
- Principles of Flight: `pof_test_random_12`
- Operational Procedures: `operational_procedures_test_random_12`
- Aircraft General Knowledge: `aircraft_general_knowledge_test_random_16`
- Flight Performance and Planning: `flight_performance_planning_test_random_16`
- Navigation: `navigation_test_random_16`

## Testing

1. Start the backend server: `npm start`
2. Open login.html in your browser
3. Register a new account
4. Take a quiz and check if progress is saved
5. Log out and log back in to verify progress persists

## Deployment Checklist

- [ ] Backend deployed to production server
- [ ] API_URL updated in quiz-api-client.js
- [ ] All quiz HTML files updated with backend integration
- [ ] login.html accessible from quiz selection page
- [ ] JWT_SECRET set to secure random value in production
- [ ] CORS configured for your domain
- [ ] HTTPS enabled for security

## Troubleshooting

### Progress not saving
- Check browser console for errors
- Verify backend is running and accessible
- Check that JWT token is valid (not expired)

### CORS errors
- Make sure backend CORS allows your frontend domain
- Check that API_URL is correct

### Login not working
- Verify backend is running
- Check username/password
- Look for error messages in browser console

## Hybrid Approach (Optional)

You can use both localStorage AND backend by implementing a fallback:

```javascript
async function recordAttempt(passed) {
    // Try backend first
    if (quizAPI.isLoggedIn()) {
        const result = await quizAPI.recordAttempt(QUIZ_NAME, passed, correctAnswers, questions.length);
        if (result.success) {
            await updateProgressDisplay();
            return;
        }
    }
    
    // Fall back to localStorage
    const progress = loadProgressLocal();
    progress.attempts++;
    if (passed) progress.passes++;
    saveProgressLocal(progress);
    updateProgressDisplay();
}
```

This way, users can still track progress locally even when not logged in!
