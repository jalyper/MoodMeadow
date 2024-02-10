// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // This should be the file where you set up your MongoDB connection
const cors = require('cors');
// const fileRequests = require('./routes/get-file');
const logins = require('./routes/login');
const registrations = require('./routes/register');
const userArrangements = require('./routes/userArrangements');
const userLibraries = require('./routes/userLibraries');
const app = express();
  
// Enable CORS
app.use(cors());

// Connect to the database
connectDB();

app.use(express.json()); // Allows us to accept JSON data in our API

// Define Routes
// app.use('/api', fileRequests);
app.use('/api/login', logins);
app.use('/api/register', registrations);
app.use('/api/userArrangements', userArrangements);
app.use('/api/userLibraries', userLibraries);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
