// server.js
const express = require('express');
const userArrangementsRoutes = require('./routes/userArrangements');

const app = express();

app.use('/api/user-arrangements', userArrangementsRoutes);

// ... rest of your server setup
