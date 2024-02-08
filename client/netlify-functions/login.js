// AWS API Function: /login
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust the path as necessary
const Login = require('./models/Login'); // Adjust the path as necessary

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

    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // Or specify your origin to be more secure
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS method for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: headers
        };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers: headers,
            body: 'Method Not Allowed' 
        };
    }

    await connectToDb();

    try {
        const { usernameOrEmail, password } = JSON.parse(event.body);

        const isEmail = usernameOrEmail.includes('@');
        let user = isEmail
                ? await User.findOne({ email: usernameOrEmail })
                : await User.findOne({ username: usernameOrEmail });

        if (!user) {
                return { 
                    statusCode: 400, 
                    headers: headers,
                    body: JSON.stringify({ message: 'Invalid Credentials' }) 
                };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
                return { 
                    statusCode: 400, 
                    headers: headers,
                    body: JSON.stringify({ message: 'Invalid Credentials' }) 
                };
        }

        const payload = { user: { id: user.id } };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        const loginRecord = new Login({
                identifier: usernameOrEmail,
                date: new Date()
        });

        await loginRecord.save();

        return { 
            statusCode: 200, 
            headers: headers,
            body: JSON.stringify({ token }) 
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            headers: headers,
            body: JSON.stringify({ error: error.toString() }) 
        };
    }
};