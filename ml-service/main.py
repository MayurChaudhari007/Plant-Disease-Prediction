import os
import io
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
from PIL import Image

# 1. Path Resolution
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(PROJECT_ROOT, "model/trained_model.keras")
CLASS_NAMES_PATH = os.path.join(PROJECT_ROOT, "disease_data/class_names.json")

# 2. Configurable threshold
PREDICTION_CONFIDENCE_THRESHOLD = float(os.getenv("PREDICTION_CONFIDENCE_THRESHOLD", "0.50"))

# Global states
ml_model = None
ml_class_names = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ml_model, ml_class_names
    
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model file not found at {MODEL_PATH}")
    else:
        try:
            ml_model = tf.keras.models.load_model(MODEL_PATH)
            print(f"SUCCESS: Model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"ERROR loading model: {e}")

    if not os.path.exists(CLASS_NAMES_PATH):
        print(f"ERROR: Class names file not found at {CLASS_NAMES_PATH}")
    else:
        try:
            with open(CLASS_NAMES_PATH, "r") as f:
                ml_class_names = json.load(f)
            print(f"SUCCESS: Loaded {len(ml_class_names)} class names.")
        except Exception as e:
            print(f"ERROR loading class names: {e}")
            
    # Validate match
    if ml_model and ml_class_names:
        if len(ml_class_names) != 38:
            print(f"ERROR: Expected 38 classes, found {len(ml_class_names)}.")
        if len(ml_class_names) != ml_model.output_shape[-1]:
            print(f"ERROR: Class names length ({len(ml_class_names)}) does not match model output shape ({ml_model.output_shape[-1]}).")
            
    yield
    # Cleanup here if needed
    ml_model = None
    ml_class_names.clear()

app = FastAPI(title="Plant Disease ML Service", lifespan=lifespan)

# Allow explicit localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    is_loaded = ml_model is not None and len(ml_class_names) > 0
    if not is_loaded:
        return {"status": "unhealthy", "modelLoaded": False}
    
    return {
        "status": "healthy",
        "modelLoaded": True,
        "classCount": len(ml_class_names)
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    if ml_model is None or not ml_class_names:
        raise HTTPException(status_code=503, detail="Model is not loaded properly.")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Preprocessing to match original testing
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        image = image.resize((128, 128))
        input_arr = np.array(image)
        
        if input_arr.shape[-1] == 4:
            input_arr = input_arr[:, :, :3]
            
        input_arr = np.expand_dims(input_arr, axis=0)
        
        # Prediction
        prediction = ml_model.predict(input_arr, verbose=0)
        
        # Extract top 3
        top_indices = np.argsort(prediction[0])[-3:][::-1]
        top_predictions = []
        for i in top_indices:
            top_predictions.append({
                "className": ml_class_names[i],
                "confidence": float(prediction[0][i])
            })
            
        predicted_index = int(np.argmax(prediction[0]))
        max_confidence = float(prediction[0][predicted_index])
        predicted_class = ml_class_names[predicted_index]
        
        # Uncertainty handling
        if max_confidence < PREDICTION_CONFIDENCE_THRESHOLD:
            return JSONResponse(content={
                "status": "uncertain",
                "message": "Unable to confidently identify a plant disease from this image.",
                "confidence": max_confidence,
                "topPredictions": top_predictions
            }, status_code=200)
        
        return JSONResponse(content={
            "status": "success",
            "predictedClass": predicted_class,
            "confidence": max_confidence,
            "topPredictions": top_predictions
        }, status_code=200)
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Prediction service failed while analyzing the image."}
        )
