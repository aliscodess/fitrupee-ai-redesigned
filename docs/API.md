# FitRupee AI — API Reference

Base URL: `https://your-api.onrender.com/api`

## Authentication

All private endpoints require the header:
```
Authorization: Bearer <access_token>
```

---

## Auth

### POST /auth/register
Register a new user.

**Body:**
```json
{ "name": "Rahul Sharma", "email": "rahul@example.com", "password": "secret123" }
```

**Response:**
```json
{ "success": true, "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }
```

---

### POST /auth/login
Login user.

**Body:**
```json
{ "email": "rahul@example.com", "password": "secret123" }
```

---

### POST /auth/refresh
Get new access token using refresh token.

**Body:**
```json
{ "refreshToken": "..." }
```

---

### POST /auth/logout *(auth required)*
Logout and invalidate refresh token.

---

### GET /auth/me *(auth required)*
Get current user + profile.

---

## Profile

### GET /profile *(auth required)*
Get user profile.

### PUT /profile *(auth required)*
Update user profile.

**Body:**
```json
{
  "age": 25, "gender": "male", "height": 175, "weight": 72,
  "activityLevel": "moderate", "fitnessGoal": "muscle_gain",
  "foodPreference": "veg", "monthlyBudget": 3000,
  "city": "Mumbai", "gymPreference": "home"
}
```

---

## AI Endpoints

### POST /ai/meal-plan *(auth required)*
Generate a 7-day meal plan.

**Body:** `{ "days": 7 }`

---

### GET /ai/meal-plan *(auth required)*
Get active meal plan.

---

### POST /ai/workout-plan *(auth required)*
Generate a workout plan.

---

### GET /ai/workout-plan *(auth required)*
Get active workout plan.

---

### POST /ai/grocery-plan *(auth required)*
Generate grocery list.

**Body:** `{ "weeklyBudget": 700 }`

---

### POST /ai/protein-budget *(auth required)*
Generate max-protein plan within budget.

**Body:** `{ "budget": 100 }`

---

### POST /ai/chat *(auth required)*
Chat with AI coach.

**Body:**
```json
{
  "messages": [{ "role": "user", "content": "What should I eat for breakfast?" }],
  "chatId": "optional-chat-id-for-continuity"
}
```

---

### POST /ai/analyze-image *(auth required)*
Analyze food image with Gemini Vision.

**Body:**
```json
{ "imageBase64": "base64-encoded-image", "mimeType": "image/jpeg" }
```

---

### POST /ai/substitutions *(auth required)*
Get cheaper food alternatives.

**Body:** `{ "food": "chicken breast" }`

---

## Analytics

### GET /analytics/dashboard *(auth required)*
Get dashboard stats and recent progress.

### POST /analytics/progress *(auth required)*
Log daily progress.

**Body:**
```json
{
  "weight": 71.5, "calories": 1850, "protein": 110,
  "water": 2.5, "workoutCompleted": true, "mood": 4,
  "notes": "Great workout today!"
}
```

### GET /analytics/progress?days=30 *(auth required)*
Get progress history.
