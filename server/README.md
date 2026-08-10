# 🚀 Plant Disease Prediction — Backend

This directory contains the Node.js/Express backend for the Plant Disease Prediction application. It acts as the central API layer, bridging the frontend user interface with the machine learning service and the database.

## 📌 Architecture & Responsibilities

The backend orchestrates the data flow:
React frontend → Node/Express → FastAPI ML service → MongoDB

- Receives image uploads from the React client.
- Securely stores the image files locally.
- Forwards the image to the Python FastAPI service for AI prediction.
- Retrieves supplementary disease information from the local JSON knowledge base.
- Saves the complete prediction record to MongoDB.
- Serves the prediction history and dashboard statistics back to the frontend.

---

## ✨ Features

- **Prediction API:** Receives `multipart/form-data` uploads, handles local file storage, and proxies the image bytes natively to the ML service.
- **Disease Information API:** Parses the local `diseases.json` to append rich disease data (symptoms, treatments, severity) to the AI's prediction.
- **Prediction History:** A CRUD interface for saving, retrieving, and clearing past predictions.
- **MongoDB Integration:** Leverages Mongoose to securely store prediction metadata, confidence scores, and local image paths.
- **Saved Prediction Images:** Maintains a chronological file structure (`uploads/YYYY/MM/DD`) for uploaded images, separating large binary data from the database.
- **Graceful Error Handling:** Intercepts `ECONNREFUSED` connection errors if the ML service goes offline and returns clean JSON error codes to the frontend.
- **CORS Support:** Pre-configured for local cross-origin requests from the Vite frontend.

---

## 🛠️ Technology Stack

- **Node.js**
- **Express.js v5** (Web framework)
- **MongoDB & Mongoose v9** (Database and ODM)
- **Multer** (Handling `multipart/form-data` and file uploads)
- **Axios** (Proxying HTTP requests to the ML service)
- **dotenv** (Environment variable management)
- **CORS** (Cross-Origin Resource Sharing)

---

## 📂 Project Structure

```text
server/
├── models/
│   └── Prediction.js      # Mongoose schema for prediction history
├── routes/
│   └── api.js             # Core Express router handling all endpoints
├── uploads/               # Dynamically generated directory for saved images
├── server.js              # Express application bootstrap and DB connection
├── package.json           # Backend dependencies and scripts
├── .env.example           # Example environment variable configuration
└── test_db.js / test_classes.js # Local diagnostic scripts
```

---

## 🔌 Server API Endpoints

### `POST /api/predictions`
Uploads a plant image and performs disease prediction.
- **Request:** `multipart/form-data` containing a `file` field named `image`.
- **Response Structure (Success):**
  ```json
  {
    "status": "success",
    "prediction": { /* MongoDB Record */ },
    "details": { /* Data from diseases.json */ }
  }
  ```
- **Response Structure (Uncertain):** Returns `status: "uncertain"` without disease details if the AI confidence falls below the threshold.
- **Response Structure (Error):** Returns a clean JSON error (e.g., `ML_SERVICE_UNAVAILABLE`) if FastAPI is down.

### `GET /api/predictions`
Retrieves the user's prediction history from MongoDB with optional query filtering and sorting.

### `GET /api/predictions/:id`
Retrieves a specific past prediction alongside its disease details.

### `DELETE /api/predictions` & `DELETE /api/predictions/:id`
Deletes prediction records from MongoDB and cleans up the associated local image files from the `uploads/` directory.

### `GET /api/dashboard`
Aggregates statistics (total scans, average confidence, healthy ratio) directly from MongoDB.

### `GET /api/diseases` & `GET /api/diseases/:className`
Retrieves comprehensive disease information parsed dynamically from the root `diseases.json` file.

---

## 🤖 ML Service Integration

The backend relies on the FastAPI service for actual TensorFlow inference.
When `POST /api/predictions` is called, the server uses `axios` and `form-data` to forward the raw image bytes to `${ML_SERVICE_URL}/predict`. It waits for the inference results, calculates the threshold, and processes the database save.

---

## 💾 MongoDB & Image Storage

- **Database Name:** `plant_disease_db`
- **Model:** `Prediction` (Stores `predictedClass`, `plant`, `disease`, `confidence`, `topPredictions`, and `imagePath`).
- **Image Storage:** The actual uploaded image files are preserved locally in `server/uploads/`. MongoDB only stores a relative path reference (e.g., `uploads/2026/08/10/prediction_1234.jpg`).
- **Git Ignore:** The `uploads/` directory is ignored by Git to prevent committing runtime data.

---

## ⚙️ Environment Variables

Create a `.env` file in the `server` directory (you can copy `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/plant_disease_db
ML_SERVICE_URL=http://127.0.0.1:8000
PREDICTION_CONFIDENCE_THRESHOLD=0.50
```
*Note: Ensure `ML_SERVICE_URL` exactly matches the port where your FastAPI service is running.*

---

## 🚀 Setup & Execution

Navigate to the `server` directory and install the dependencies:

```bash
cd server
npm install
```

Start the Node.js server:

```bash
node server.js
```
The backend will typically be accessible at: **http://localhost:5000**

---

## 🔧 Troubleshooting

- **MongoDB connection failure:** Ensure your local MongoDB community server is actively running on port 27017. Verify the `MONGODB_URI` in your `.env`.
- **ML service unavailable:** If the API returns `ML_SERVICE_UNAVAILABLE`, your Node server is running but it cannot reach FastAPI. Ensure FastAPI is running on `127.0.0.1:8000` in a separate terminal.
- **Port already in use:** If port 5000 is occupied, change the `PORT` variable in `.env` (note: you will need to update the frontend's hardcoded URL if you change this).
- **Disease lookup failure:** Ensure `diseases.json` exists in the project root directory.

*(For detailed frontend or machine learning setup, refer to `../client/README.md` or `../ml-service/README.md`)*
