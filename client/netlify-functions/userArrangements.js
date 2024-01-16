// userArrangements.js
const mongoose = require('mongoose');
const UserArrangement = require('./models/UserArrangement'); // Adjust the path as necessary
const User = require('./models/User'); // Adjust the path as necessary

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
        if (event.httpMethod === 'GET') {
            if (event.path.endsWith('public-arrangements')) {
                // Handle GET /public-arrangements
                const arrangements = await UserArrangement.find({ isPrivate: false })
                    .populate('userId', 'username') 
                    .sort({ date: -1 });

                // Disconnect from the database
                await mongoose.disconnect();

                return {
                    statusCode: 200,
                    headers: headers,
                    body: JSON.stringify(arrangements)
                };
            } else {
                // Handle GET /
                const userArrangements = await UserArrangement.find(!null);

                // Disconnect from the database
                await mongoose.disconnect();

                return {
                    statusCode: 200,
                    headers: headers,
                    body: JSON.stringify(userArrangements)
                };
            }
        } else if (event.httpMethod === 'POST' && event.path.endsWith('save')) {
            // Handle POST /save
            // You'll need to parse the body of the request
            const body = JSON.parse(event.body);
            const userId = body.user.id; 

            const user = await User.findById(userId);
            if (!user) {
                // Disconnect from the database
                await mongoose.disconnect();

                return { 
                    statusCode: 404, 
                    headers: headers,
                    body: JSON.stringify({ message: 'User not found' }) 
                };
            }

            const { sounds, isPrivate, originalArrangementId } = body;

            if (!sounds.every(sound => sound && sound.name && sound.src)) {
                // Disconnect from the database
                await mongoose.disconnect();

                return { statusCode: 400, body: JSON.stringify({ message: 'Each sound must have a name and a source.' }) };
            }

            let totalSavesIncremented = false;
            if (originalArrangementId) {
                // Find and update the original arrangement
                const originalArrangement = await UserArrangement.findById(originalArrangementId);
                if (originalArrangement) {
                    originalArrangement.totalSaves += 1;
                    await originalArrangement.save();
                    totalSavesIncremented = true;
                }
            }

            // Create a new user arrangement
            const newArrangement = new UserArrangement({
                userId,
                username: user.username,
                sounds,
                isPrivate,
                originalArrangementId: totalSavesIncremented ? originalArrangementId : undefined
            });

            await newArrangement.save();
            return { statusCode: 201, body: JSON.stringify(newArrangement) };
        } else {
            // Handle unsupported HTTP methods
            return {
                statusCode: 405,
                body: 'Method Not Allowed',
                headers: { 'Allow': 'GET, POST' },
            };
        }
    } catch (error) {
        // Disconnect from the database in case of error
        await mongoose.disconnect();

        return { statusCode: 500, body: error.toString() };
    }
};