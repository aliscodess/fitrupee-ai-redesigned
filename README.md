# 🥗 FitRupee AI — AI-Powered Budget Nutrition & Fitness Planner

> A production-grade SaaS app helping Indian users eat healthy on a budget with AI-powered meal plans, workout routines, and grocery optimization.

![FitRupee AI](https://img.shields.io/badge/FitRupee-AI-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key
- Cloudinary account

### 1. Clone & Install

```bash
git clone https://github.com/yourname/fitrupee-ai.git
cd fitrupee-ai

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fitrupee
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FitRupee AI
```

### 3. Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

App runs at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📁 Project Structure

```
fitrupee-ai/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + TypeScript
├── shared/            # Shared TypeScript types
├── docs/              # Documentation
└── README.md
```

---

## 🌐 Deployment

### MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create a new project → Create cluster (M0 Free)
3. Database Access → Add user with readWrite role
4. Network Access → Add IP `0.0.0.0/0` (allow all)
5. Connect → Get connection string
6. Replace `<password>` in URI and set as `MONGODB_URI`

### Backend → Render

1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect GitHub repo → select `backend` folder
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add all environment variables from `backend/.env.example`
7. Deploy → copy the URL (e.g., `https://fitrupee-api.onrender.com`)

### Frontend → Vercel

1. Go to https://vercel.com → New Project
2. Import GitHub repo → set Root Directory to `frontend`
3. Framework: Vite
4. Add env: `VITE_API_URL=https://fitrupee-api.onrender.com/api`
5. Deploy → your app is live!

---

## 📋 Production Deployment Checklist

- [ ] MongoDB Atlas cluster created and URI set
- [ ] Gemini API key obtained from Google AI Studio
- [ ] Cloudinary account set up
- [ ] All backend env variables set on Render
- [ ] All frontend env variables set on Vercel
- [ ] CORS configured with production frontend URL
- [ ] Rate limiting configured
- [ ] JWT secrets are strong (32+ chars)
- [ ] MongoDB indexes created (run `npm run seed` on backend)
- [ ] SSL certificates active (automatic on Render/Vercel)

---

## 🔌 API Documentation

See [docs/API.md](docs/API.md) for full API reference.

Base URL: `https://your-api.onrender.com/api`

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout user |

### Profile Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /profile | Get user profile |
| PUT | /profile | Update profile |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/meal-plan | Generate meal plan |
| POST | /ai/workout-plan | Generate workout plan |
| POST | /ai/grocery-plan | Generate grocery list |
| POST | /ai/analyze-image | Analyze food image |
| POST | /ai/chat | AI chat assistant |
| POST | /ai/protein-budget | Protein under ₹100 plan |

### Analytics Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/dashboard | Dashboard stats |
| POST | /analytics/progress | Log progress |
| GET | /analytics/progress | Get progress history |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  Express Backend │────▶│  MongoDB Atlas  │
│   (Vercel)      │     │  (Render)        │     │  (Cloud)        │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Gemini AI │ │Cloudinary│ │  JWT Auth │
              └──────────┘ └──────────┘ └──────────┘
```

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| UI Components | Custom components with Framer Motion |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + Refresh Tokens + bcrypt |
| AI | Google Gemini 1.5 Flash |
| Images | Cloudinary |
| Security | Helmet, express-rate-limit, CORS |

---

## 📄 License

MIT © FitRupee AI 2024
