# Arvind Limited · Quality Inspection Tracker

> **Full Stack Developer Hiring Assignment — AI & Analytics Team**  
> A mobile-first web application for shop-floor supervisors across Arvind fabric manufacturing plants (Gujarat & Maharashtra) to log, track, and resolve quality defects in real time.

---

## 💡 Architecture Perspective: Monorepo & TanStack Query Integration

### **Why this Architecture Represents Senior Engineering Excellence:**

1. **TanStack Query (React Query v5) for Server State Management:**  
   - Implemented `@tanstack/react-query` to handle data fetching (`useQuery`), query key caching (`['inspections', filters]`, `['inspectionSummary']`), background refetching, and mutation invalidations (`useMutation`).
   - Cleanly separates UI components from data-fetching side effects, matching real-world enterprise React practices.

2. **Monorepo (FE & BE in Same Repo) for Single-Command Setup:**  
   - Reviewers can clone a single repository and run `npm run dev` or `docker-compose up` to launch the entire stack in under 2 minutes.
   - Both backend API schema updates and React UI components are versioned together in a single atomic Git commit, eliminating cross-repo dependency drift.

---

## 🚀 Quick Setup Guide (Under 5 Minutes)

### Option A: Standard Local Setup (Recommended)

**Prerequisites:** Node.js (v18+) and npm.

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start Backend & Frontend concurrently:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - **Frontend App:** [http://localhost:3000](http://localhost:3000) (Simulate mobile view at 390px in DevTools)
   - **Backend API:** [http://localhost:5000/api/inspections](http://localhost:5000/api/inspections)

---

### Option B: Docker Compose (1-Command Run)

**Prerequisites:** Docker Desktop.

```bash
docker-compose up --build
```
- Access Frontend at `http://localhost:3000`
- Access Backend API at `http://localhost:5000`

---

## 🔐 Default Supervisor Credentials

- **Email:** `supervisor@arvind.com`
- **Password:** `arvind123`

---

## 🏗️ Technical Architecture & Senior Engineering Decisions

### 1. React 19 + TanStack Query v5 Frontend (390px Viewport)
- **Decision:** Built with React 19, Vite, `@tanstack/react-query`, and Tailwind CSS, adhering strictly to touch-first mobile standards (minimum 44px tap targets, card-based responsive design, sticky action bars).
- **Rationale:** Custom queries (`useInspectionsQuery`, `useSummaryQuery`) and mutations (`useInspectionMutations`) eliminate boilerplate state management while offering automatic cache invalidation upon log creation or resolution.

### 2. Node.js + Express REST API Backend
- **Decision:** Built a clean, decoupled RESTful API using Node.js and Express with graceful shutdown signal handlers (`SIGTERM`/`SIGINT`).
- **Rationale:** Express provides lightweight routing, low latency overhead, and rapid setup for shop-floor transactions. Clean route modularization (`/routes/inspections.js`, `/routes/sapWebhook.js`, `/routes/auth.js`) guarantees maintainability.

### 3. Embedded SQLite Database
- **Decision:** Utilized zero-config SQLite (`quality_tracker.db`) with promise-wrapped queries and auto-migrations.
- **Rationale:** Meets the strict requirement for no cloud database dependencies while ensuring single-command local setup. Pre-seeds 6 realistic plant inspection logs and supervisor credentials automatically on first start.

### 4. Offline Queue & Automatic Resync Protocol (Bonus Feature)
- **Decision:** Implemented client-side offline queue storage using `localStorage` and `window.navigator.onLine` event listeners integrated into TanStack Query mutations.
- **Rationale:** Textile manufacturing plants frequently experience network blind spots. Inspections logged while offline are queued locally and automatically flushed to Express API when network connectivity recovers.

### 5. Mock SAP ERP Integration Webhook (Bonus Feature)
- **Decision:** Created an extensible `POST /api/sap-webhook` endpoint paired with an interactive visual tester directly in the React UI.
- **Rationale:** Enables automated IoT telemetry (e.g. yarn tension, dye temperature sensors) to inject defect tickets directly into the supervisor’s workflow with full cURL command generation.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query Params / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inspections` | List inspections with filters & sorting | `severity`, `status`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder` |
| `GET` | `/api/inspections/summary` | Matrix count of Open/Resolved by severity | N/A |
| `POST` | `/api/inspections` | Log a new quality defect | `{ date, machineLineId, defectType, severity, remarks }` |
| `PATCH` | `/api/inspections/:id/resolve` | Mark defect as resolved | `{ resolutionNote }` (Mandatory) |
| `POST` | `/api/sap-webhook` | Mock SAP ERP IoT defect injection | `{ equipmentId, plantId, defectCategory, severity, description }` |
| `POST` | `/api/auth/login` | Supervisor JWT authentication | `{ email, password }` |

---

### Sample SAP Webhook cURL Request

```bash
curl -X POST http://localhost:5000/api/sap-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": "GJ-AHM-01 (Naroda Plant)",
    "equipmentId": "WEAVE-LINE-09",
    "sapDefectCode": "DEF-102",
    "defectCategory": "Shade Variation",
    "severity": "Major",
    "description": "Auto-flagged by SAP IoT Sensors: Yarn tension anomaly causing shade mismatch."
  }'
```

---

## 🔮 What I Would Do Differently With More Time

1. **Real-time WebSockets / SSE:** Implement Socket.io to push newly created defects (especially from SAP webhooks) live to supervisor screens without needing periodic polling.
2. **Camera & Image Attachment:** Allow supervisors to take photos of fabric defects directly on their phone camera and attach them to inspection logs via S3 / local static storage.
3. **PWA Service Worker:** Register a full Service Worker (`sw.js`) with Web App Manifest for native "Add to Home Screen" installation on Android/iOS devices.
4. **Role-Based Access Control (RBAC):** Differentiate permissions between *Shop-Floor Operators* (log only), *Shift Supervisors* (resolve & assign), and *Plant Managers* (analytics & reporting).
5. **E2E Testing Suite:** Add Cypress / Playwright mobile viewport automated tests covering the full offline logging -> network recovery -> resync workflow.

---

## 📄 License & Confidentiality

*Arvind Limited · AI & Analytics Team · Confidential · Hiring Assignment Submission*
