// userLibraries.js
const mongoose = require('mongoose');
const UserLibrary = require('./models/UserLibrary');
const User = require('./models/User');

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
        const userId = pathParts[1];
        const arrangementId = pathParts[3];

        if (event.httpMethod === 'GET') {
            if (userId) {
                // Handle GET /:userId
                const userLibrary = await UserLibrary.findOne({ userId: userId });
                if (!userLibrary) {
                    // Disconnect from the database
                    await mongoose.disconnect();

                    return { 
                        statusCode: 404, 
                        headers: headers,
                        body: JSON.stringify({ message: 'Library not found' }) 
                    };
                }

                // Disconnect from the database
                await mongoose.disconnect();

                return { 
                    statusCode: 200, 
                    headers: headers,
                    body: JSON.stringify(userLibrary) 
                };
            } else {
                // Handle GET /
                // You'll need to get the userId from the authenticated user
                const userLibrary = await UserLibrary.findOne({ userId: 'authenticated-user-id' });
                if (!userLibrary) {
                    // Disconnect from the database
                    await mongoose.disconnect();

                    return { 
                        statusCode: 404, 
                        headers: headers,
                        body: JSON.stringify({ message: 'Library not found' }) 
                    };
                }

                // Disconnect from the database
                await mongoose.disconnect();

                return { 
                    statusCode: 200, 
                    headers: headers,
                    body: JSON.stringify(userLibrary) 
                };
            }
        } else if (event.httpMethod === 'POST' && pathParts[2] === 'save') {
            // Handle POST /save
            // You'll need to parse the body of the request
            const body = JSON.parse(event.body);
            const { arrangement } = body;

            if (typeof arrangement !== 'object' || 
                    !Array.isArray(arrangement.sounds) || 
                    !arrangement.sounds.every(sound => sound && sound.name && sound.src)) {
                // Disconnect from the database
                await mongoose.disconnect();

                return { statusCode: 400, body: JSON.stringify({ message: 'Invalid arrangement data.' }) };
            }

            let userLibrary = await UserLibrary.findOne({ userId: 'authenticated-user-id' });

            if (!userLibrary) {
                userLibrary = new UserLibrary({
                    userId: 'authenticated-user-id',
                    arrangements: []
                });
            }

            const doesArrangementExist = userLibrary.arrangements.some(existingArrangement => {
                return JSON.stringify(existingArrangement.sounds) === JSON.stringify(arrangement.sounds);
            });

            if (doesArrangementExist) {
                // Disconnect from the database
                await mongoose.disconnect();

                return { statusCode: 409, body: JSON.stringify({ message: 'Arrangement already exists in library' }) };
            }

            userLibrary.arrangements.push(arrangement);

            await userLibrary.save();

            // Disconnect from the database
            await mongoose.disconnect();

            return { statusCode: 201, body: JSON.stringify(userLibrary) };
        } else if (event.httpMethod === 'DELETE' && userId && pathParts[2] === 'arrangements' && arrangementId) {
            // Handle DELETE /:userId/arrangements/:arrangementId
            const userLibrary = await UserLibrary.findOne({ userId: userId });

            if (!userLibrary) {
                // Disconnect from the database
                await mongoose.disconnect();

                return { statusCode: 404, body: JSON.stringify({ message: 'Library not found' }) };
            }

            userLibrary.arrangements = userLibrary.arrangements.filter(arrangement => arrangement._id.toString() !== arrangementId);
            await userLibrary.save();

            // Disconnect from the database
            await mongoose.disconnect();

            return { statusCode: 200, body: JSON.stringify(userLibrary) };
        } else {
            // Handle unsupported HTTP methods
            // Disconnect from the database
            await mongoose.disconnect();

            return {
                statusCode: 405,
                body: 'Method Not Allowed',
                headers: { 'Allow': 'GET, POST, DELETE' },
            };
        }
    } catch (error) {
        // Disconnect from the database in case of error
        await mongoose.disconnect();

        return { statusCode: 500, body: error.toString() };
    }
};