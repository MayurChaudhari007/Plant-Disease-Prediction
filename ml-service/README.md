# 🤖 Plant Disease Prediction — ML Service

This directory contains the Python FastAPI machine learning inference service for the Plant Disease Prediction application. 

## 📌 Architecture & Responsibilities

Its sole responsibility is processing raw images into AI predictions:
Receive image → Preprocess image → Load TensorFlow/Keras model → Run prediction → Map class index → Return prediction

This microservice runs entirely independent of the Node.js backend. It does not interface with the frontend UI or the database. It solely awaits images from the backend API, performs the heavy AI inference, and returns the computational results.

---

## 🛠️ Technology Stack

- **Python 3.12**
- **FastAPI** (High-performance web framework for APIs)
- **Uvicorn** (ASGI server for FastAPI)
- **TensorFlow (>=2.15.0)** (Core ML framework)
- **Keras** (High-level neural networks API)
- **Pillow** (Python Imaging Library for image preprocessing)
- **NumPy** (Numerical operations)
- **python-multipart** (For handling multipart form data)

---

## 🧠 The Machine Learning Model

The service utilizes a pre-trained image classification model.

- **Current Model Location:** `../trained_model.keras`
- **Input Shape:** `128 × 128 × 3` (RGB)
- **Output:** 38 distinct plant/disease combination classes.
- **Class Mapping:** `../class_names.json`

### Model Loading & Validation
To ensure maximum performance and responsiveness, the TensorFlow model and class names are strictly loaded **once** during the FastAPI application lifecycle (`lifespan`). The model is maintained in memory and reused for all subsequent prediction requests, completely avoiding the overhead of loading a 90MB+ file for every request.

### Model Prediction Flow
1. Node.js sends a POST request containing the image file bytes.
2. The service loads the bytes into a Pillow Image object and aggressively converts it to RGB.
3. The image is resized to exactly `128 × 128` pixels to match the input tensor shape.
4. Converted to a NumPy array and expanded to simulate a batch of one (`[1, 128, 128, 3]`).
5. Processed by the TensorFlow/Keras inference engine.
6. The resulting probability array is mapped against `class_names.json` to identify the most likely disease and extract the top 3 alternative predictions.

---

## 🔌 ML API Endpoints

### `GET /health`
A diagnostic endpoint used to verify the service is running and the TensorFlow model is successfully mounted in memory.
```json
{
  "status": "healthy",
  "modelLoaded": true,
  "classCount": 38
}
```

### `POST /predict`
The core inference endpoint.
- **Request:** `multipart/form-data` containing a `file` field.
- **Response Structure:**
  ```json
  {
    "status": "success",
    "predictedClass": "Apple___Cedar_apple_rust",
    "confidence": 0.998,
    "topPredictions": [
      {"className": "Apple___Cedar_apple_rust", "confidence": 0.998},
      {"className": "Apple___Apple_scab", "confidence": 0.001},
      {"className": "Apple___healthy", "confidence": 0.0005}
    ]
  }
  ```

---

## 📁 ML Model Files & Knowledge Structure

The ML service relies on files dynamically resolved from the project root:

1. **`trained_model.keras`**: Predicts the raw class index (e.g., `Class 3`).
2. **`class_names.json`**: Translates the index to a programmatic class identifier (e.g., `Apple___Cedar_apple_rust`).
3. **`diseases.json`**: Provides human-readable disease information. *(Note: The ML service does not touch this file. It is exclusively parsed by the Node.js backend to enrich the raw prediction before sending it to React).*

This architecture guarantees that the application runs locally and privately without relying on generative APIs (like Gemini or OpenAI).

---

## 💾 ML Dataset

The massive image dataset used to train `trained_model.keras` is NOT included in this GitHub repository due to size constraints. The ML service only requires the lightweight pre-trained `.keras` file for inference. 

If you wish to explore the original dataset to reproduce the Jupyter notebooks, it can be found here:
[🔗 Plant Disease Dataset](https://drive.usercontent.google.com/download?id=1_5G3Cz0WQtZeTxzsq5lrTUfEnNy78WeY&confirm=t)

---

## 🚀 Setup & Execution

You **must** execute these commands from within the `ml-service` directory.

### 1. Create Virtual Environment
```bash
cd ml-service
python -m venv .venv
```

### 2. Activate the Environment
- **Windows:**
  ```bash
  .venv\Scripts\activate
  ```
- **Mac/Linux:**
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start FastAPI
**CRITICAL:** Ensure you start Uvicorn from inside the `ml-service` directory so that it successfully binds to `main.py` without conflicting with legacy code in the project root.
```bash
uvicorn main:app --reload --port 8000
```
The service will be accessible at: **http://127.0.0.1:8000**

---

## 🔧 Troubleshooting

- **Model not found:** Ensure `trained_model.keras` exists in the project root directory. Check the startup logs to see if the FastAPI lifespan manager successfully mounted it.
- **Class names not found:** Ensure `class_names.json` exists in the project root directory.
- **FastAPI unavailable (ECONNREFUSED from Node):** Ensure you started Uvicorn with `--port 8000`. If you omit the port, it defaults to 8000, but it is best to be explicit.
- **TensorFlow installation issue:** Ensure you are using a Python version compatible with TensorFlow `>=2.15.0`. If you encounter DLL or C++ Redistributable errors on Windows, ensure your Visual Studio runtime libraries are up-to-date.

*(For detailed backend or frontend setup, refer to `../server/README.md` or `../client/README.md`)*
