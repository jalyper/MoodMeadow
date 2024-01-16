// userArrangements.js
const UserArrangement = require('../../backend/models/UserArrangement');
const User = require('../../backend/models/User');

exports.handler = async function(event, context) {
    try {
        if (event.httpMethod === 'GET') {
            if (event.path.endsWith('public-arrangements')) {
                // Handle GET /public-arrangements
                const arrangements = await UserArrangement.find({ isPrivate: false })
                    .populate('userId', 'username') 
                    .sort({ date: -1 });
                return {
                    statusCode: 200,
                    body: JSON.stringify(arrangements)
                };
            } else {
                // Handle GET /
                const userArrangements = await UserArrangement.find(!null);
                return {
                    statusCode: 200,
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
                return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
            }

            const { sounds, isPrivate, originalArrangementId } = body;

            if (!sounds.every(sound => sound && sound.name && sound.src)) {
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
        return { statusCode: 500, body: error.toString() };
    }
};