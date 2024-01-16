// login.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust the path as necessary
const Login = require('./models/Login'); // Adjust the path as necessary

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        const { usernameOrEmail, password } = JSON.parse(event.body);

        const isEmail = usernameOrEmail.includes('@');
        let user = isEmail
            ? await User.findOne({ email: usernameOrEmail })
            : await User.findOne({ username: usernameOrEmail });

        if (!user) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Credentials' }) };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Credentials' }) };
        }

        const payload = { user: { id: user.id } };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

        const loginRecord = new Login({
            identifier: usernameOrEmail,
            date: new Date()
        });

        await loginRecord.save();

        // Disconnect from the database
        await mongoose.disconnect();

        return { statusCode: 200, body: JSON.stringify({ token }) };
    } catch (error) {
        // Disconnect from the database in case of error
        await mongoose.disconnect();

        return { statusCode: 500, body: error.toString() };
    }
};