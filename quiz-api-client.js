// PPL Quiz Backend API Client
// Include this file in your quiz HTML files to enable backend progress tracking

const API_URL = 'http://localhost:3000/api'; // Change this to your deployed backend URL

class QuizAPI {
    constructor() {
        this.token = localStorage.getItem('ppl_quiz_token');
        this.user = JSON.parse(localStorage.getItem('ppl_quiz_user') || 'null');
    }

    // Authentication methods
    async register(username, password, email = '') {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('ppl_quiz_token', data.token);
                localStorage.setItem('ppl_quiz_user', JSON.stringify(data.user));
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('ppl_quiz_token', data.token);
                localStorage.setItem('ppl_quiz_user', JSON.stringify(data.user));
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('ppl_quiz_token');
        localStorage.removeItem('ppl_quiz_user');
    }

    isLoggedIn() {
        return this.token !== null;
    }

    getUser() {
        return this.user;
    }

    // Progress methods
    async getProgress(quizName) {
        if (!this.token) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const response = await fetch(`${API_URL}/progress/${quizName}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data: data.progress };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    async getAllProgress() {
        if (!this.token) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const response = await fetch(`${API_URL}/progress`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data: data.progress };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    async recordAttempt(quizName, passed, score, totalQuestions) {
        if (!this.token) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const response = await fetch(`${API_URL}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    quiz_name: quizName,
                    passed,
                    score,
                    total_questions: totalQuestions
                })
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data: data.progress };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    async resetProgress(quizName) {
        if (!this.token) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const response = await fetch(`${API_URL}/progress/${quizName}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    async getHistory(quizName) {
        if (!this.token) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const response = await fetch(`${API_URL}/history/${quizName}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data: data.history };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    async getStats() {
        if (!this.token) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const response = await fetch(`${API_URL}/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data: data.stats };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }
}

// Create global instance
const quizAPI = new QuizAPI();
