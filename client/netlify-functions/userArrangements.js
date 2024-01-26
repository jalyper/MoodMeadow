// userArrangements.js
const mongoose = require('mongoose');
const UserArrangement = require('./models/UserArrangement'); // Adjust the path as necessary
const User = require('./models/User'); // Adjust the path as necessary
let connection = null;

exports.handler = async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    // Connect to the database
    if (connection == null) {
        try {
            connection = await mongoose.connect(process.env.MONGODB_URI);
        } catch (error) {
            console.error('Database connection error:', error);
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ message: 'Internal Server Error' })
            };
        }
    }

    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': 'https://moodmeadow.com', 
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
        } else if (event.httpMethod === 'POST') {
            // Handle POST /save
            // You'll need to parse the body of the request
            const body = JSON.parse(event.body);
            if (!body.userId) {
                return {
                    statusCode: 400,
                    headers: headers,
                    body: JSON.stringify({ message: 'Invalid request body: user is missing' })
                };
            }
            const userId = body.userId; 

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

                return {
                    statusCode: 400,
                    headers: headers,
                    body: JSON.stringify({ message: 'Invalid sound data in request body' })
                };
            }

            if (originalArrangementId) {
                // Find and update the original arrangement
                const originalArrangement = await UserArrangement.findById(originalArrangementId);
                if (originalArrangement) {
                    // Check if the user has already saved this arrangement
                    if (!originalArrangement.savedBy.includes(userId)) {
                        // Increment totalSaves and add the user's ID to savedBy
                        originalArrangement.totalSaves += 1;
                        originalArrangement.savedBy.push(userId);
                        await originalArrangement.save();
                        totalSavesIncremented = true;
                    }
                }
            }

            // Create a new UserArrangement
            const userArrangement = new UserArrangement({
                userId: userId,
                sounds: sounds,
                username: user.username, // Use the username from the user document
                isPrivate: isPrivate,
                originalArrangementId: originalArrangementId,
                // date and totalSaves will use their default values
            });

            // Save the UserArrangement
            await userArrangement.save();

            // Disconnect from the database
            await mongoose.disconnect();

            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(userArrangement)
            };
        }
    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
}