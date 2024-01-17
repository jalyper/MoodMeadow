// userLibraries.js
const mongoose = require('mongoose');
const UserLibrary = require('./models/UserLibrary');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // Or specify your origin to be more secure
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle OPTIONS method for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: headers
        };
    }

    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        const pathParts = event.path.split('/');
        const arrangementId = pathParts[3];
        console.log('full path parts' + pathParts);
        console.log('path parts 0' + pathParts[0]);
        console.log('path parts 1' + pathParts[1]);
        console.log('path parts 2' + pathParts[2]);
        console.log('path parts 3' + pathParts[3]);
        // Extract the token from the Authorization header
        const token = event.headers.authorization.split(' ')[1];
        // Verify the token and extract the userId
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        if (event.httpMethod === 'GET' && pathParts[2]) {
            // Handle GET /:userId
            const userLibrary = await UserLibrary.findOne({ userId: pathParts[2] });
            if (!userLibrary) {
                return { 
                    statusCode: 404, 
                    headers: headers,
                    body: JSON.stringify({ message: 'Library not found' }) 
                };
            }
        
            return { 
                statusCode: 200, 
                headers: headers,
                body: JSON.stringify(userLibrary) 
            };
        } else if (event.httpMethod === 'POST' && pathParts[3] === 'userLibraries' && pathParts[4] === 'save') {
            // Handle POST /userLibraries/save

            // You'll need to parse the body of the request
            const body = JSON.parse(event.body);
            const { arrangement } = body;

            if (typeof arrangement !== 'object' || 
                    !Array.isArray(arrangement.sounds) || 
                    !arrangement.sounds.every(sound => sound && sound.name && sound.src)) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Invalid arrangement data.' }) };
            }

            let userLibrary = await UserLibrary.findOne({ userId: userId });

            if (!userLibrary) {
                userLibrary = new UserLibrary({
                    userId: userId,
                    arrangements: []
                });
            }

            const doesArrangementExist = userLibrary.arrangements.some(existingArrangement => {
                return JSON.stringify(existingArrangement.sounds) === JSON.stringify(arrangement.sounds);
            });

            if (doesArrangementExist) {
                return { statusCode: 409, body: JSON.stringify({ message: 'Arrangement already exists in library' }) };
            }

            userLibrary.arrangements.push(arrangement);

            await userLibrary.save();

            return { statusCode: 201, body: JSON.stringify(userLibrary) };
        } else if (event.httpMethod === 'DELETE' && userId && pathParts[2] === 'arrangements' && arrangementId) {
            // Handle DELETE /:userId/arrangements/:arrangementId
            const userLibrary = await UserLibrary.findOne({ userId: userId });

            if (!userLibrary) {
                return { statusCode: 404, body: JSON.stringify({ message: 'Library not found' }) };
            }

            userLibrary.arrangements = userLibrary.arrangements.filter(arrangement => arrangement._id.toString() !== arrangementId);
            await userLibrary.save();

            return { statusCode: 200, body: JSON.stringify(userLibrary) };
        } else {
            // Handle unsupported HTTP methods
            return {
                statusCode: 405,
                body: 'Method Not Allowed',
                headers: { 'Allow': 'GET, POST, DELETE' },
            };
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
};