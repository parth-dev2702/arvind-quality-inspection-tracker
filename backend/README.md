# Backend - Arvind Quality Inspection Tracker API

This folder contains the Express.js REST API backend for the Arvind Quality Inspection Tracker.

## Tech Stack

- **Server:** Node.js, Express.js
- **Database:** SQLite (`quality_tracker.db`)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Utilities:** CORS, dotenv

## Environment Variables

Copy `.env.example` to `.env` if you need custom settings:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=arvind_quality_tracker_secret_key
```

## Running the Backend Separately

If you want to run the Express API server by itself:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server (with Nodemon for auto-reload):**
   ```bash
   npm run dev
   ```

3. **Start in production mode:**
   ```bash
   npm start
   ```

The backend server listens at `http://localhost:5000`. On first run, SQLite automatically initializes `quality_tracker.db` and seeds sample inspection records and the default supervisor account (`parth@arvind.com` / `arvind123`).

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/inspections` | Fetch inspections list (supports `severity`, `status`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder`) |
| `GET` | `/api/inspections/summary` | Get count matrix of Open/Resolved inspections grouped by severity |
| `GET` | `/api/inspections/:id` | Fetch single inspection details |
| `POST` | `/api/inspections` | Log a new inspection |
| `PATCH` | `/api/inspections/:id/resolve` | Mark inspection as resolved with mandatory resolution note |
| `POST` | `/api/sap-webhook` | Webhook endpoint to auto-log defects from SAP ERP / IoT telemetry |
| `POST` | `/api/auth/login` | Login endpoint returning JWT token |
| `GET` | `/api/health` | Health check endpoint |

## Testing SAP Webhook

You can send test payloads to the webhook using cURL:

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
