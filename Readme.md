# 🧭 Trao AI Travel Planner

> AI-powered travel planning application — Generate personalized day-by-day itineraries, estimate budgets, discover hotels, and auto-generate weather-aware packing lists instantly.

![React](https://img.shields.io/badge/React-19-blue) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) ![Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-orange) ![License](https://img.shields.io/badge/license-Educational-lightgrey)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack & Justification](#tech-stack--justification)
- [High-Level Architecture](#high-level-architecture)
- [Project Structure](#project-structure)
- [Authentication & Authorization Approach](#authentication--authorization-approach)
- [AI Agent Design](#ai-agent-design)
- [Creative Feature — Currency Conversion](#creative-feature--currency-conversion-usd--inr)
- [Key Design Decisions & Trade-offs](#key-design-decisions--trade-offs)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)
- [Security](#security)

---

## Overview

**Trao AI Travel Planner** is a secure, multi-user, full-stack web application that helps users plan complete trips using artificial intelligence. Users register, log in, and generate rich travel plans powered by **Google Gemini 2.5 Flash**.

Each user's data is completely isolated — no user can access or modify another user's trips. The app supports live USD/INR currency conversion, responsive design across all screen sizes, and gracefully falls back to mock data when the Gemini API key is not configured.

| Part     | Stack                          | Default URL           |
|----------|--------------------------------|-----------------------|
| Frontend | React 19 + Vite + Tailwind CSS | http://localhost:5173 |
| Backend  | Node.js + Express + MongoDB    | http://localhost:5000 |

---

## Features

### 🔐 User Authentication
- Register with name, email, and password
- Login with JWT tokens (valid 7 days)
- Passwords hashed with bcrypt (10 salt rounds)
- Protected routes — redirects to login if no token found

### 🤖 AI Trip Generation (Google Gemini 2.5 Flash)
- Enter: departure city, destination, duration, budget tier, interests, travel type, and number of travelers
- AI generates a complete travel plan including:
  - Day-by-day itinerary with morning / afternoon / evening activities
  - Meal recommendations with restaurant names and must-try dishes
  - Hotel and accommodation suggestions (Budget / Mid-range / Luxury)
  - Transportation options (flights, trains, local transport)
  - Daily and total budget breakdown
  - Weather-aware packing list
  - Cultural, safety, food, and health tips
  - Nearby attractions for day trips
  - Emergency contact numbers

### 📅 Trip Management
- View all saved trips in sidebar
- Create, update, and delete trips
- Add custom activities to any day
- Regenerate a specific day with custom AI instructions
- Toggle packing list items (packed / unpacked)

### 💱 Currency Conversion (USD / INR) — Creative Feature
- Toggle between $ USD and ₹ INR anywhere in the dashboard
- Live exchange rate fetched at trip creation via ExchangeRate API
- Preference persisted in localStorage across sessions

### 📱 Fully Responsive
- Desktop: full sidebar layout
- Mobile: hamburger menu, trip drawer, username visible in top bar
- Smooth animations and transitions throughout

---

## Tech Stack & Justification

### Frontend — React 19 + Vite (instead of Next.js)

The assignment listed Next.js as a *preferred* stack, not a mandatory one. I chose **React 19 with Vite** for the following reasons:

- This application is entirely **client-side and auth-gated** — no public-facing pages require SEO or server-side rendering, which are Next.js's primary advantages.
- Vite provides **significantly faster HMR and build times** compared to the Next.js dev server, improving developer experience.
- React + Vite is a **lighter, simpler setup** — less configuration overhead, no file-based routing complexity, and easier to reason about for a single-page dashboard application.
- The eligibility criteria for this role specifically lists **React JS**, not Next.js — confirming React is the right fit.

### Backend — Node.js + Express
- Minimal, flexible REST API framework — ideal for building a clean, resource-based API.
- Large ecosystem, strong community, and well-suited for async-heavy operations like LLM API calls.

### Database — MongoDB + Mongoose
- Schema-flexible document model suits travel itinerary data (variable number of days, activities, hotels).
- Mongoose ODM provides schema validation and clean model definitions.
- MongoDB Atlas offers free-tier cloud hosting — no local DB setup required for evaluators.

### AI — Google Gemini 2.5 Flash
- **High speed + structured JSON output** — critical for a good UX when generating full itineraries.
- `responseMimeType: "application/json"` forces valid JSON output, eliminating unreliable regex parsing.
- Free tier is generous enough for development and evaluation purposes.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              React 19 Client (Vite)             │
│   Auth State · Trip Form · Dashboard UI         │
└────────────────┬────────────────▲───────────────┘
                 │                │
          REST API calls    JSON Responses
      (JWT in Auth Header)  (User-isolated)
                 │                │
┌────────────────▼────────────────┼───────────────┐
│           Express.js REST API Server            │
│  ┌──────────────────────────────────────────┐  │
│  │            JWT Auth Middleware           │  │
│  │  Decodes token → attaches req.user.id   │  │
│  └────────────────┬─────────────────────────┘  │
│                   │                            │
│       ┌───────────┴───────────┐                │
│       ▼                       ▼                │
│  ┌─────────────┐       ┌─────────────┐         │
│  │ Trip Routes │       │ Auth Routes │         │
│  └──────┬──────┘       └──────┬──────┘         │
└─────────┼────────────────────┼─────────────────┘
          │                    │
    ┌─────┴──────┐      ┌──────┴──────┐
    ▼            ▼      ▼             ▼
┌────────┐ ┌─────────┐ ┌───────────────────┐
│Gemini  │ │ MongoDB │ │  ExchangeRate API  │
│AI API  │ │  Trips  │ │  (USD → INR rate)  │
└────────┘ └─────────┘ └───────────────────┘
```

**Data flow for trip generation:**
1. User submits trip preferences from `CreateTripForm`
2. Frontend sends `POST /api/trips` with JWT in header
3. Auth middleware verifies token, attaches `req.user.id`
4. Controller fetches live exchange rate, then calls Gemini API with structured prompt
5. Gemini returns a JSON itinerary — saved to MongoDB with `userId` field
6. Response returned to client; dashboard re-renders with new trip

---

## Project Structure

```
TraoAITravelPlanner/
├── assets/
│   ├── favicon.png
│   ├── TravelApp1.jpg             # Screenshot - Home page
│   ├── TravelApp2.jpg             # Screenshot - Dashboard
│   ├── TravelApp3.jpg             # Screenshot - Trip details
│   └── TravelApp4.jpg             # Screenshot - Create trip / mobile
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection via Mongoose
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   └── tripController.js      # Trip CRUD + AI generation
│   ├── middleware/
│   │   └── auth.js                # JWT verification — protects all trip routes
│   ├── models/
│   │   ├── User.js                # User schema (email, hashed password)
│   │   └── Trip.js                # Trip schema (userId ref, itinerary, budget, hotels)
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── tripRoutes.js          # /api/trips/*
│   ├── .env.example               # Environment variable template
│   └── server.js                  # Express entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── LandingPage.jsx        # Marketing / home page
        │   ├── LandingNavbar.jsx      # Landing page navigation
        │   ├── Login.jsx              # Login form
        │   ├── Register.jsx           # Registration form
        │   ├── Dashboard.jsx          # Main trip planner UI
        │   ├── Navbar.jsx             # Dashboard top bar
        │   ├── NavUserGreeting.jsx    # Personalized "Hi, Username" greeting
        │   ├── CreateTripForm.jsx     # Multi-step trip creation modal
        │   └── CurrencyToggle.jsx     # USD/INR toggle + useCurrency hook
        ├── App.jsx                    # Route definitions (React Router DOM)
        ├── main.jsx                   # React entry point
        └── index.css                  # Global styles + animations
```

---

## Authentication & Authorization Approach

### Registration
1. User submits name, email, and password
2. Backend checks if email already exists
3. Password hashed using `bcryptjs` with 10 salt rounds — plain text is never stored
4. User document saved to MongoDB
5. JWT signed with `JWT_SECRET` and returned to client (valid 7 days)

### Login
1. User submits email and password
2. Backend fetches user by email; runs `bcrypt.compare()` against stored hash
3. On match, a new JWT is signed and returned
4. Token stored in `localStorage` on the client

### Authorization (every protected request)
```
Request → auth.js middleware
  → Reads "Authorization: Bearer <token>" header
  → jwt.verify(token, JWT_SECRET)
  → Attaches decoded payload as req.user
  → next() — proceeds to route handler
```

### Data Isolation
Every trip document in MongoDB stores a `userId` field (ObjectId ref to the User model). All trip queries are scoped to `{ userId: req.user.id }`:

```js
// Only returns trips belonging to the authenticated user
const trips = await Trip.find({ userId: req.user.id });

// Update only works if the trip belongs to this user
const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
```

This ensures **zero cross-user data leakage** — even if a user guesses another trip's `_id`, the query returns null.

---

## AI Agent Design

### Model
**Google Gemini 2.5 Flash** — chosen for speed, accuracy, and reliable structured output.

### Prompt Engineering
The AI agent receives a structured system prompt that:
- Defines the exact JSON schema to return (itinerary, hotels, budget, packing list)
- Includes destination, duration, budget tier, interests, travel type, and traveler count
- Specifies realistic local pricing relative to the budget tier
- Instructs the model to include morning/afternoon/evening time slots

Using `responseMimeType: "application/json"` in the generation config forces Gemini to return valid, parseable JSON — no regex stripping or error-prone text parsing required.

### Regenerate Day Feature
When a user requests a day regeneration, the backend:
1. Fetches the existing trip from MongoDB
2. Sends the full trip context + the user's custom prompt to Gemini
3. Receives an updated activities array for that specific day
4. Patches only that day in the itinerary array and saves back to MongoDB

This avoids regenerating the entire trip, saving tokens and preserving the user's other customizations.

### Resilience
- Exponential backoff retry logic (up to 5 retries: 1s → 2s → 4s → 8s → 16s) handles Gemini API rate limits and transient failures
- Mock data fallback — if `GEMINI_API_KEY` is not set, the app returns a realistic sample itinerary so the UI remains fully demonstrable without API credentials

---

## Creative Feature — Currency Conversion (USD / INR)

### Why I Built This

Travel budgets in most AI tools are returned in USD. However, the primary users of an Indian travel planning app think and budget in **Indian Rupees (INR)**. Presenting costs only in USD creates a cognitive friction — users must mentally convert every figure before it becomes meaningful.

### What Problem It Solves

This feature eliminates that friction by letting users toggle between USD and INR **anywhere budget figures appear** — budget breakdown, activity costs, hotel prices — with a single click.

### How It Works

1. When a trip is created, the backend fetches the **live USD → INR exchange rate** from the ExchangeRate API
2. The rate is stored alongside the trip in MongoDB, locking in the rate at the time of generation (avoids inconsistency on future views)
3. The `useCurrency` hook (inside `CurrencyToggle.jsx`) exposes a `convert(amount)` function and a `symbol` string (`$` or `₹`) globally across the dashboard
4. The user's currency preference is saved to `localStorage` so it persists across sessions and page refreshes

### Engineering Judgment

Storing the exchange rate at trip creation time rather than fetching it live on every render was a deliberate decision — it ensures budget figures remain consistent and don't change unexpectedly due to rate fluctuations after the trip was planned.

---

## Key Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| React + Vite over Next.js | App is fully auth-gated; no SSR/SEO needed. Faster dev experience. | No server-side rendering; slightly worse cold-load performance on slow connections. |
| JWT in localStorage | Simple, stateless auth; works seamlessly with REST APIs. | Vulnerable to XSS — httpOnly cookies would be more secure in production. |
| Store exchange rate at trip creation | Budget figures stay consistent regardless of future rate changes. | Rate is frozen — does not reflect real-time currency movement. |
| Gemini `responseMimeType: "application/json"` | Guarantees valid JSON output; eliminates brittle text parsing. | Slightly reduces model creativity — constrained to schema. |
| Mock data fallback | Evaluators can run the app without a Gemini API key. | Mock data is static — does not demonstrate full AI capability without a real key. |
| MongoDB over SQL | Itinerary structure is deeply nested and variable (different days, activities per trip). | Less suited for complex relational queries — acceptable for this use case. |

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas cloud — free tier works)
- Google Gemini API key (optional — mock data used if missing)

### 1. Clone the Repository

```bash
git clone https://github.com/virendrasahu/AI-Travel-Planner.git
cd AI-Travel-Planner
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

Backend starts at **http://localhost:5000**

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/trao-travel
JWT_SECRET=your_super_secure_random_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

| Variable        | Required | Description                                     |
|-----------------|----------|-------------------------------------------------|
| `PORT`          | No       | Server port (default: 5000)                     |
| `MONGO_URI`     | Yes      | MongoDB connection string                       |
| `JWT_SECRET`    | Yes      | Secret key for signing JWT tokens               |
| `GEMINI_API_KEY`| No       | Gemini API key (mock data used if not provided) |

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

> For production, set `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.onrender.com`).

---

## API Reference

Base URL: `http://localhost:5000`

### Health Check
```
GET /health
```

### Authentication

| Method | Endpoint            | Auth | Description        |
|--------|---------------------|------|--------------------|
| POST   | /api/auth/register  | No   | Create new account |
| POST   | /api/auth/login     | No   | Login, receive JWT |
| GET    | /api/auth/me        | Yes  | Get user profile   |

### Trips (all require `Authorization: Bearer <token>`)

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | /api/trips                      | Generate and save a new trip   |
| GET    | /api/trips                      | Get all trips for current user |
| GET    | /api/trips/:id                  | Get a single trip              |
| PUT    | /api/trips/:id                  | Update trip fields             |
| DELETE | /api/trips/:id                  | Delete a trip                  |
| POST   | /api/trips/:id/regenerate-day   | Regenerate one day with AI     |

#### Create Trip — Request Body
```json
{
  "from": "Mumbai",
  "destination": "Goa",
  "durationDays": 3,
  "budgetTier": "Medium",
  "interests": ["Beach", "Food & Dining", "Nightlife"],
  "travelType": "friends",
  "travelers": 4
}
```

#### Regenerate Day — Request Body
```json
{
  "dayNumber": 2,
  "prompt": "Make it more beach-focused with water sports"
}
```

---

## Deployment

### Backend — Render.com
1. Push backend folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set root directory to `backend`
4. Add environment variables in the Render dashboard:
   - `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `PORT=5000`
5. Deploy — Render provides a public HTTPS URL

### Frontend — Vercel
1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy — Vercel provides a public HTTPS URL

---

## Screenshots

### Home Page
<p align="center">
  <img src="assets/TravelApp1.jpg" alt="Trao AI Travel Planner - Home Page" width="900" />
</p>
<p align="center"><em>Landing page with hero section, features overview, and navigation</em></p>

### Dashboard
<p align="center">
  <img src="assets/TravelApp2.jpg" alt="Trao AI Travel Planner - Dashboard" width="900" />
</p>
<p align="center"><em>Trip dashboard with saved trips sidebar and trip overview</em></p>

### Trip Details
<p align="center">
  <img src="assets/TravelApp3.jpg" alt="Trao AI Travel Planner - Trip Details" width="900" />
</p>
<p align="center"><em>AI-generated itinerary, budget breakdown, and day-by-day activities</em></p>

### Create Trip & Mobile View
<p align="center">
  <img src="assets/TravelApp4.jpg" alt="Trao AI Travel Planner - Create Trip" width="900" />
</p>
<p align="center"><em>Create trip form with travel preferences and responsive mobile layout</em></p>

---

## Local Storage Keys

| Key              | Values     | Purpose                       |
|------------------|------------|-------------------------------|
| `token`          | JWT string | Authentication                |
| `userName`       | String     | Display name in navbar        |
| `trao_currency`  | USD / INR  | Currency preference           |

---

## Known Limitations

- **JWT in localStorage** — susceptible to XSS attacks. Production-grade apps should use httpOnly cookies.
- **Exchange rate is frozen at trip creation** — does not reflect live currency fluctuations after the trip is saved.
- **Gemini API dependency** — without a valid API key, the app falls back to static mock data. Mock itineraries are not destination-specific.
- **No email verification** — users can register with any email address without verification.
- **No pagination** — if a user creates many trips, all are loaded at once. Could cause performance issues at scale.
- **Single-currency base** — budgets are generated in USD by the AI; INR is a client-side conversion only.

---

## Future Enhancements

- 🗺️ Embedded map view for itinerary activities (Leaflet.js or Google Maps Embed)
- 📄 Export trip as PDF or shareable public link
- 🌦️ Real-time weather API integration for dynamic packing suggestions
- 🌙 Dark / Light mode toggle
- 👥 Trip collaboration — share and co-edit with friends
- 🔑 Forgot password / email-based password reset
- ✏️ Profile edit page
- 🌐 Multi-language support
- 🔄 Refresh token mechanism for seamless session extension

---

## Security

- Passwords never stored in plain text — bcrypt with 10 salt rounds
- JWT tokens expire after 7 days
- All trip endpoints verify `userId` matches the authenticated token owner
- `.env` file is gitignored and never committed to version control
- CORS configured to allow only the frontend origin
- Exponential backoff prevents API key abuse under rate-limiting scenarios

---

## License

This project is for educational and personal use.

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
