// register.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust the path as necessary

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        const body = JSON.parse(event.body);
        let user = await User.findOne({ email: body.email });
        if (user) {
            // Disconnect from the database
            await mongoose.disconnect();

            return { statusCode: 400, body: JSON.stringify({ message: 'User already exists' }) };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);

        user = new User({
            username: body.username,
            email: body.email,
            password: hashedPassword
        });

        await user.save();

        const payload = { user: { id: user.id } };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Disconnect from the database
        await mongoose.disconnect();

        return { statusCode: 201, body: JSON.stringify({ token }) };
    } catch (error) {
        // Disconnect from the database in case of error
        await mongoose.disconnect();

        return { statusCode: 500, body: JSON.stringify({ error: error.message })};
    }
};