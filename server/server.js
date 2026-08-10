require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plant_disease_db';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', apiRoutes);

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`Node Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
