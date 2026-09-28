# Quality Inspection Tracker - Arvind Limited

This repository contains the Quality Inspection Tracker application built for shop-floor supervisors at Arvind fabric manufacturing plants. Supervisors can log fabric defects, track open/resolved issues, filter logs, and resolve defects with resolution notes on mobile or desktop browsers.

## Tech Stack

- **Frontend:** React (Vite), TanStack Query (React Query), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** SQLite (stored locally in `backend/quality_tracker.db`)

---

## Setup Instructions

### Option 1: Running Locally with Node.js (Recommended)

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start backend and frontend together:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - **Frontend App:** http://localhost:3000
   - **Backend API:** http://localhost:5000/api/inspections

---

### Option 2: Running with Docker

If you prefer using Docker:

```bash
docker-compose up --build
```

- Frontend runs at `http://localhost:3000`
- Backend API runs at `http://localhost:5000`

---

## Demo Credentials

- **Email:** `parth@arvind.com`
- **Password:** `arvind123`

---

## Architecture & Key Decisions

### Why Frontend and Backend are in the same repository
I kept the frontend and backend in one repository to make setup simple and fast for evaluation. Running a single command starts both servers without needing to manage two separate repos or configure complex CORS settings.

### Database Choice (SQLite)
I used SQLite (`quality_tracker.db`) so the project runs out-of-the-box locally without needing external database servers (like PostgreSQL or MySQL). On server startup, sample data and default supervisor account are created automatically.

### State Management & API Caching (TanStack Query)
I used `@tanstack/react-query` to handle API requests, caching, and state refetching when logging new defects or resolving them.

### Offline Support
If the network goes offline, inspections logged by the supervisor are stored locally in `localStorage`. When the connection comes back online, the app syncs them automatically to the backend server.

### SAP Webhook Integration (Bonus)
Exposed `POST /api/sap-webhook` endpoint to accept defect payloads from SAP or IoT telemetry sensors. There is also an in-app tester modal to send test payloads directly from the UI.

---

## API Endpoints

- `GET /api/inspections` - Fetch all inspections (supports filters: `severity`, `status`, `startDate`, `endDate`, `search`)
- `GET /api/inspections/summary` - Get counts of Open and Resolved inspections grouped by severity
- `POST /api/inspections` - Create a new inspection log
- `PATCH /api/inspections/:id/resolve` - Resolve an open inspection (requires resolution note)
- `POST /api/sap-webhook` - Webhook for SAP defect payloads
- `POST /api/auth/login` - Login endpoint

### Sample SAP Webhook cURL

```bash
curl -X POST http://localhost:5000/api/sap-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": "NAG-IND-01 (Nagpur Plant)",
    "equipmentId": "FINISHING-STENTER-02",
    "sapDefectCode": "DEF-809",
    "defectCategory": "Hole/Tear",
    "severity": "Critical",
    "description": "Continuous tear detected at stenter pin line."
  }'
```

---

## What I Would Improve With More Time

1. **Real-time Updates (WebSockets):** Use Socket.io so new defects (like SAP alerts) appear live on the screen without periodic polling.
2. **Photo Uploads:** Add camera/image upload support so supervisors can take pictures of defects directly on the shop floor.
3. **PWA Support:** Add a service worker so supervisors can install the app on Android/iOS phones.
4. **Role Permissions:** Add separate permissions for operators, supervisors, and plant managers.
