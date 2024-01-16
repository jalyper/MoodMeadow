const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust the path as necessary

let isConnected = false;

const connectToDb = async () => {
    if (isConnected) {
        console.log('=> using existing database connection');
        return Promise.resolve();
    }

    console.log('=> using new database connection');
    return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(db => {
            isConnected = db.connections[0].readyState;
        });
};

exports.handler = async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    await connectToDb();

    try {
        const body = JSON.parse(event.body);
        let user = await User.findOne({ email: body.email });
        if (user) {
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

        return { statusCode: 201, body: JSON.stringify({ token }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message })};
    }
};