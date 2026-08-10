# 🌿 Plant Disease Prediction — Frontend

This directory contains the React frontend for the Plant Disease Prediction application. It provides a modern, responsive user interface designed for interacting with the AI prediction service and browsing plant disease information.

## 📌 Architecture & Responsibilities

The client handles the entire user-facing experience:
React UI → User interaction → Image upload → API requests to Node/Express → Display prediction → Display disease information → Prediction history → Disease Library

All AI predictions and database operations are managed by the Node.js backend. This frontend strictly acts as the presentation layer.

---

## ✨ Features

- **Home & Dashboard:** A welcoming landing page and a dashboard featuring analytics (e.g., charts detailing total predictions, healthy vs. diseased ratios, and the most frequently predicted diseases).
- **Plant Disease Detection:** An intuitive drag-and-drop interface allowing users to upload a leaf image for analysis.
- **Prediction Results:** Displays the predicted plant, specific disease, the AI's confidence score, and top alternative predictions.
- **Low-Confidence Handling:** If the AI is uncertain (confidence < 50%), the frontend correctly identifies this "uncertain" status and prompts the user for a clearer image instead of displaying inaccurate disease data.
- **Disease Library:** A searchable, filterable catalog of all 38 supported plant/disease classes.
- **Disease Details:** Individual detail pages for each class outlining severity, symptoms, recommended treatments, and prevention measures. Includes distinct visual layouts for healthy vs. diseased plants.
- **Prediction History:** A log of previously analyzed images and their results, retrieved securely from the backend.
- **Responsive UI:** Built with Tailwind CSS and Framer Motion for a fluid, mobile-friendly experience.

---

## 🛠️ Technology Stack

- **React 19**
- **Vite**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **React Router v7**
- **Axios** (for API communication)
- **Recharts** (for dashboard data visualization)
- **Framer Motion** (for UI animations)
- **Lucide React** (for iconography)

---

## 📂 Project Structure

```text
client/
├── src/
│   ├── components/      # Reusable UI components (Navbar, Footer, etc.)
│   ├── pages/           # Main route views
│   │   ├── About.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DiseaseDetection.jsx
│   │   ├── DiseaseDetails.jsx
│   │   ├── History.jsx
│   │   ├── Home.jsx
│   │   ├── Library.jsx
│   │   └── PredictionDetails.jsx
│   ├── App.jsx          # React Router configuration
│   ├── index.css        # Tailwind directives and global styles
│   └── main.jsx         # React application entry point
├── index.html
├── package.json         # Frontend dependencies and scripts
└── vite.config.js       # Vite configuration
```

---

## 🔌 API Integration

The frontend communicates exclusively with the local Node.js/Express backend (usually running on `http://localhost:5000`).

Key endpoints utilized by the client:
- `POST /api/predictions` - Forwards the uploaded image to the backend.
- `GET /api/predictions` - Retrieves the user's prediction history.
- `GET /api/dashboard` - Fetches statistics for the dashboard charts.
- `GET /api/diseases` - Fetches the comprehensive list for the Disease Library.
- `GET /api/diseases/:className` - Retrieves detailed information for a specific disease.

---

## 🚀 Setup & Execution

Navigate to the `client` directory and install the dependencies:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will typically be accessible at:
**http://localhost:5173**

---

## ⚙️ Environment Variables

No environment variables are strictly required for the frontend to run. The backend API URL (`http://localhost:5000/api`) is pre-configured within the application source code.

---

## 🔧 Troubleshooting

- **Backend Unavailable / API Connection Failure:** If you see "Prediction service failed" or cannot load the history, ensure the Node.js backend is actively running on port 5000.
- **Vite Startup Issue:** If `npm run dev` fails, ensure you are running Node.js v18+ and have successfully executed `npm install`.
- **Styling Not Applying:** Ensure Tailwind CSS v4 is correctly processing `index.css`. Restart the Vite server if you made manual modifications to the PostCSS configuration.
- **Image Upload Failure:** Verify that the image is a valid format (JPG/PNG) and is under the 10MB limit enforced by the backend.

*(For detailed backend or machine learning setup, refer to `../server/README.md` or `../ml-service/README.md`)*
