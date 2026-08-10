const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  predictedClass: {
    type: String,
    required: true
  },
  plant: {
    type: String,
    required: true
  },
  disease: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  topPredictions: {
    type: Array,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);
