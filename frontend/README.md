# Frontend - Arvind Quality Inspection Tracker

This folder contains the React frontend application for the Arvind Quality Inspection Tracker.

## Tech Stack

- **Framework:** React 19 (Vite)
- **State & Data Fetching:** TanStack Query (React Query v5)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Running the Frontend Separately

If you want to run the frontend client by itself:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Vite dev server:**
   ```bash
   npm run dev
   ```

The app will run at `http://localhost:3000` and proxy API calls (`/api/*`) to the backend server running at `http://localhost:5000`.

## Building for Production

To create an optimized production build:

```bash
npm run build
```

The output files will be generated in the `dist` folder.
