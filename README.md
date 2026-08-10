# 🌿 Plant Disease Prediction System

A full-stack, local-first web application designed to help identify plant diseases from leaf images. The system uses a customized deep learning image classification model (TensorFlow/Keras) capable of recognizing 38 distinct plant/disease combinations, and presents the results through a modern, responsive React interface.

**Note:** This application runs entirely locally on your machine. No external AI APIs (e.g., Gemini, OpenAI) or cloud storage are required for disease predictions.

## ✨ Features

### 🔍 AI Disease Detection
- Upload a plant leaf image through a drag-and-drop React interface.
- The Node.js backend handles local file persistence and securely forwards the image to the FastAPI ML service.
- The TensorFlow/Keras model performs rapid image classification.
- Displays the predicted plant, disease, top 3 predictions, and confidence scores.

### ⚠️ Uncertain Prediction Handling
- Configurable confidence threshold (e.g., 50%).
- If the model's confidence is below the threshold, the system intelligently returns an "Uncertain" status rather than providing potentially misleading disease information.

### 📖 Disease Library
- A fully searchable encyclopedia of all 38 supported classes.
- Disease data is stored locally in `diseases.json`.
- Each disease details page includes specific symptoms, severity ratings, recommended actions, and prevention steps.
- Distinguishes between healthy leaves and diseased leaves.

### 📊 Prediction History & Dashboard
- Successful predictions are securely logged in a local MongoDB database.
- Uploaded images are preserved locally in the `server/uploads/` directory.
- The Dashboard visualizes the history with charts detailing healthy vs. diseased predictions, total scans, and most frequently predicted diseases.

---

## 🛠️ Technology Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Recharts, Framer Motion |
| **Backend** | Node.js, Express.js 5, MongoDB (Mongoose), Multer |
| **Machine Learning** | Python 3.12, FastAPI, TensorFlow (>=2.15), Keras, Pillow, NumPy |

---

## 🧠 Machine Learning Model

- **Model File:** `trained_model.keras`
- **Architecture:** Image Classification Model trained to classify 38 plant and disease combinations.
- **Input:** 128 × 128 RGB image
- **Output:** 38 classes (Class mapping found in `class_names.json`)
- **Training:** The model training and evaluation process is documented in `Train_plant_disease.ipynb` and `Test_Plant_Disease.ipynb`.

---

## 📂 Project Structure

```text
Plant-Disease-Prediction/
│
├── client/                     # React Frontend (Vite)
│   ├── src/                    # UI Components, Pages, and Styling
│   └── package.json
│
├── server/                     # Node.js Backend (Express)
│   ├── models/                 # Mongoose Database Schemas
│   ├── routes/                 # API Endpoints (predictions, diseases)
│   ├── uploads/                # Locally stored prediction images (Ignored by Git)
│   ├── server.js               # Express Server configuration
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── ml-service/                 # Python FastAPI Service
│   ├── main.py                 # ML Inference API endpoints (/predict, /health)
│   └── requirements.txt        # Python dependencies
│
├── class_names.json            # Maps model index to class names
├── diseases.json               # Comprehensive symptom and treatment data
├── trained_model.keras         # The compiled TensorFlow/Keras model
├── Train_plant_disease.ipynb   # Jupyter notebook used for model training
├── Test_Plant_Disease.ipynb    # Jupyter notebook used for model evaluation
└── README.md
```

---

## 💾 Dataset Information

The original dataset used to train the model is extremely large and is intentionally omitted from this repository. If you wish to retrain the model or explore the raw data, you can download it here:

[🔗 Plant Disease Dataset](https://drive.usercontent.google.com/download?id=1_5G3Cz0WQtZeTxzsq5lrTUfEnNy78WeY&confirm=t)

*You do not need to download the dataset to run this application, as the pre-trained `trained_model.keras` is already provided.*

---

## 📋 Prerequisites

To run this project locally, ensure you have the following installed:
- **Python 3.12**
- **Node.js** (v18 or higher) & **npm**
- **MongoDB Community Server** (Running locally on default port 27017)
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MayurChaudhari007/Plant-Disease-Prediction.git
cd Plant-Disease-Prediction
```

### 2. Configure Python & ML Service
Create a virtual environment and install the required machine learning packages:
```bash
python -m venv .venv

# Windows activation:
.venv\Scripts\activate
# Mac/Linux activation:
# source .venv/bin/activate

cd ml-service
pip install -r requirements.txt
```

### 3. Configure Node.js Backend
Install backend dependencies and configure the environment:
```bash
cd ../server
npm install
```
Create a `.env` file in the `server/` directory based on the provided `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/plant_disease_db
ML_SERVICE_URL=http://127.0.0.1:8000
PREDICTION_CONFIDENCE_THRESHOLD=0.50
```

### 4. Configure React Frontend
Install the frontend dependencies:
```bash
cd ../client
npm install
```

---

## ▶️ Running the Application

To run the full stack, you must start the three services concurrently in **separate terminal windows**.

**Terminal 1 — ML Service**
```bash
cd ml-service
..\.venv\Scripts\activate      # (Use appropriate activation for your OS)
uvicorn main:app --reload --port 8000
```
*Runs on http://127.0.0.1:8000*

**Terminal 2 — Node Backend**
```bash
cd server
node server.js
```
*Runs on http://localhost:5000*

**Terminal 3 — React Frontend**
```bash
cd client
npm run dev
```
*Runs on http://localhost:5173*

---

## ⚠️ Important Limitations

- **Prediction Accuracy:** The model's predictions depend heavily on the quality, lighting, and similarity of the uploaded image to the training dataset.
- **Educational Use:** This application is intended for educational, research, and demonstration purposes. Predictions should not be treated as professional agricultural diagnoses.
- **Local Architecture:** The system is engineered to run locally and is not currently hardened or configured for public production deployment.
- **Data Completeness:** Disease information is stored locally and may require manual updates as agricultural knowledge evolves.

---

## 🔧 Troubleshooting

### ML service unavailable (ECONNREFUSED)
- Ensure that the ML Service terminal is running without errors.
- Verify you started `uvicorn main:app` from **inside** the `ml-service` folder, not the project root.
- Ensure the `ML_SERVICE_URL` in `server/.env` is set to `http://127.0.0.1:8000`.

### MongoDB connection error
- Ensure your local MongoDB daemon/service is running.
- Verify that `MONGODB_URI` in `server/.env` points to your correct local database port (usually `27017`).

### Frontend cannot connect to backend
- Ensure the Node server is running on port 5000. Check the terminal for any crash logs.

### Model or Class Names not found
- Ensure `trained_model.keras`, `class_names.json`, and `diseases.json` are present in their appropriate directories as documented in the Project Structure.

---
[GitHub Repository](https://github.com/MayurChaudhari007/Plant-Disease-Prediction)
