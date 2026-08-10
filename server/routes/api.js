const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Prediction = require('../models/Prediction');

// Load diseases DB
const diseasesDbPath = path.join(__dirname, '..', '..', 'disease_data/diseases.json');
let diseasesDb = [];
try {
  const parsed = JSON.parse(fs.readFileSync(diseasesDbPath, 'utf-8'));
  diseasesDb = parsed.diseases || parsed;
} catch (e) {
  console.error("Could not load diseases.json", e);
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const uploadPath = path.join(__dirname, '..', 'uploads', year, month, day);
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prediction_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const CONFIDENCE_THRESHOLD = parseFloat(process.env.PREDICTION_CONFIDENCE_THRESHOLD) || 0.50;

// Prediction Endpoint
router.post('/predictions', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    // 1. Send to ML Service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: formData.getHeaders(),
    });

    const mlData = mlResponse.data;

    // 2. Check confidence
    if (mlData.confidence < CONFIDENCE_THRESHOLD) {
      return res.status(200).json({
        status: 'uncertain',
        message: 'Unable to confidently identify a plant disease from this image.',
        confidence: mlData.confidence,
        topPredictions: mlData.topPredictions
      });
    }

    // 3. Find disease info
    const diseaseInfo = diseasesDb.find(d => d.className === mlData.predictedClass) || {};
    const plant = diseaseInfo.plant || mlData.predictedClass.split('___')[0].replace(/_/g, ' ');
    const disease = diseaseInfo.disease || mlData.predictedClass.split('___')[1]?.replace(/_/g, ' ') || 'Unknown';

    // 4. Create local DB path relative to server root
    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');

    // 5. Save to MongoDB
    const predictionRecord = new Prediction({
      imagePath: relativePath,
      originalFileName: req.file.originalname,
      predictedClass: mlData.predictedClass,
      plant: plant,
      disease: disease,
      confidence: mlData.confidence,
      topPredictions: mlData.topPredictions
    });

    await predictionRecord.save();

    return res.status(201).json({
      status: 'success',
      prediction: predictionRecord,
      details: diseaseInfo
    });

  } catch (error) {
    console.error("Prediction Error:", error.response ? error.response.data : error.message);
    
    // Clean up temporary uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        success: false, 
        code: "ML_SERVICE_UNAVAILABLE", 
        error: "The AI prediction service is currently unavailable. Please make sure the ML service is running." 
      });
    }

    return res.status(500).json({ error: 'Prediction service failed' });
  }
});

// GET all predictions
router.get('/predictions', async (req, res) => {
  try {
    const { plant, disease, query, sort } = req.query;
    let filter = {};
    if (plant) filter.plant = plant;
    if (disease) filter.disease = disease;
    if (query) {
      filter.$or = [
        { plant: { $regex: query, $options: 'i' } },
        { disease: { $regex: query, $options: 'i' } },
        { originalFileName: { $regex: query, $options: 'i' } }
      ];
    }
    
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'confidence_high') sortOption = { confidence: -1 };
    if (sort === 'confidence_low') sortOption = { confidence: 1 };

    const predictions = await Prediction.find(filter).sort(sortOption);
    res.json(predictions);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET specific prediction
router.get('/predictions/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) return res.status(404).json({ error: 'Not found' });
    
    const diseaseInfo = diseasesDb.find(d => d.className === prediction.predictedClass) || {};
    res.json({ prediction, details: diseaseInfo });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
});

// DELETE specific prediction
router.delete('/predictions/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) return res.status(404).json({ error: 'Not found' });
    
    const fullPath = path.join(__dirname, '..', prediction.imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    
    await Prediction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete prediction' });
  }
});

// DELETE all predictions
router.delete('/predictions', async (req, res) => {
  try {
    const predictions = await Prediction.find();
    for (const p of predictions) {
      const fullPath = path.join(__dirname, '..', p.imagePath);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) {}
      }
    }
    await Prediction.deleteMany({});
    res.json({ message: 'All history cleared' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// GET dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const total = await Prediction.countDocuments();
    
    const predictions = await Prediction.find();
    const healthy = predictions.filter(p => p.disease.toLowerCase() === 'healthy').length;
    const diseased = total - healthy;
    
    let totalConfidence = 0;
    const plantCounts = {};
    const diseaseCounts = {};
    
    predictions.forEach(p => {
      totalConfidence += p.confidence;
      plantCounts[p.plant] = (plantCounts[p.plant] || 0) + 1;
      diseaseCounts[p.disease] = (diseaseCounts[p.disease] || 0) + 1;
    });

    const averageConfidence = total > 0 ? (totalConfidence / total) : 0;
    
    // Sort to find most predicted
    const topPlant = Object.entries(plantCounts).sort((a,b) => b[1]-a[1])[0] || null;
    const topDisease = Object.entries(diseaseCounts).sort((a,b) => b[1]-a[1])[0] || null;
    
    res.json({
      totalPredictions: total,
      healthyPredictions: healthy,
      diseasedPredictions: diseased,
      averageConfidence: averageConfidence,
      mostPredictedPlant: topPlant ? topPlant[0] : null,
      mostPredictedDisease: topDisease ? topDisease[0] : null,
      predictionsByPlant: Object.keys(plantCounts).map(k => ({name: k, value: plantCounts[k]})),
      predictionsByDisease: Object.keys(diseaseCounts).map(k => ({name: k, value: diseaseCounts[k]})),
      recentPredictions: predictions.slice(-5).reverse() // Assuming already sorted or we can just fetch top 5
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET diseases
router.get('/diseases', (req, res) => {
  res.json(diseasesDb);
});

// GET specific disease
router.get('/diseases/:className', (req, res) => {
  const disease = diseasesDb.find(d => d.className === req.params.className);
  if (!disease) return res.status(404).json({ error: 'Disease not found' });
  res.json(disease);
});

module.exports = router;
