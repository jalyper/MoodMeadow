// userLibraries.js
const UserLibrary = require('../../backend/models/UserLibrary');
const User = require('../../backend/models/User');

exports.handler = async function(event, context) {
    try {
        const pathParts = event.path.split('/');
        const userId = pathParts[1];
        const arrangementId = pathParts[3];

        if (event.httpMethod === 'GET') {
            if (userId) {
                // Handle GET /:userId
                const userLibrary = await UserLibrary.findOne({ userId: userId });
                if (!userLibrary) {
                    return { statusCode: 404, body: JSON.stringify({ message: 'Library not found' }) };
                }
                return { statusCode: 200, body: JSON.stringify(userLibrary) };
            } else {
                // Handle GET /
                // You'll need to get the userId from the authenticated user
                const userLibrary = await UserLibrary.findOne({ userId: 'authenticated-user-id' });
                if (!userLibrary) {
                    return { statusCode: 404, body: JSON.stringify({ message: 'Library not found' }) };
                }
                return { statusCode: 200, body: JSON.stringify(userLibrary) };
            }
        } else if (event.httpMethod === 'POST' && pathParts[2] === 'save') {
            // Handle POST /save
            // You'll need to parse the body of the request
            const body = JSON.parse(event.body);
            const { arrangement } = body;

            if (typeof arrangement !== 'object' || 
                    !Array.isArray(arrangement.sounds) || 
                    !arrangement.sounds.every(sound => sound && sound.name && sound.src)) {
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