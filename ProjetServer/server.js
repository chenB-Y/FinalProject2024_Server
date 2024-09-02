
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const env = require('dotenv');
const app = express();
const port = 5432; // You can choose any available port
const editRoutes = require('./routes/editRoutes');
const tvRoutes = require('./routes/tvRoutes');
const path = require("path");
const mongoose = require('mongoose');
const { eventNames } = require('./models/user');
env.config();


const cors = require('cors');
app.use(cors());

// Construct MongoDB connection string
const mongoURI = `mongodb://admin:bartar20%40CS@10.10.248.136:21771/`;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start your Node.js server or define your routes here
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
  app.use(express.json());
app.use(bodyParser.json());
app.use('/auth',authRoutes);
app.use('/user',editRoutes);
app.use('/tv',tvRoutes);
app.use(express.static(path.join(__dirname,"./public/BoardImages")));
app.use(express.static(path.join(__dirname,"./public/images")));





app.listen(port, '10.10.248.136', () => {
  console.log(`Server running at http://10.10.248.136:${port}/`);
});
