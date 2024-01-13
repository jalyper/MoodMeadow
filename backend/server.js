// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // This should be the file where you set up your MongoDB connection
const userRoutes = require('./routes/users');
const userArrangements = require('./routes/userArrangements');
const userLibraries = require('./routes/userLibraries');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // allow only the client app to access
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 
  
// Connect to the database
connectDB();

app.use(express.json()); // Allows us to accept JSON data in our API


// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/userArrangements', userArrangements);
app.use('/api/userLibraries', userLibraries);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
