const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Update the AWS config with your environment variables
AWS.config.update({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({ region: 'us-east-1' });

exports.handler = async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    const headers = {
        "Access-Control-Allow-Origin" : "*", // Allow any origin
        "Access-Control-Allow-Methods": "GET, OPTIONS", // Allow GET and OPTIONS methods
        "Access-Control-Allow-Headers": "Content-Type, Authorization" // Allow these headers
    };

    // Handle OPTIONS method for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { 
            statusCode: 204, 
            headers: headers
        };
    }

    if (event.httpMethod !== 'GET') {
        return { 
            statusCode: 405, 
            body: 'Method Not Allowed',
            headers: headers
        };
    }

    // Check if the Authorization header exists
    if (!event.headers.authorization) {
        return { 
            statusCode: 401, 
            body: 'No Authorization header',
            headers: headers
        };
    }

    // Extract the JWT from the Authorization header
    const token = event.headers.authorization.split(' ')[1];

    try {
        // Validate the JWT
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        // Extract the file key from the path
        const pathParts = event.path.split('/');
        const fileKey = pathParts[3];
        console.log('fileKey: ' + fileKey);
        // Generate a pre-signed URL for the file
        const url = s3.getSignedUrl('getObject', {
            Bucket: process.env.REACT_APP_SOUND_BUCKET,
            Key: fileKey,
            Expires: 60 * 5 // URL will be valid for 5 minutes
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: url }),
            headers: headers
        };
    } catch (err) {
        return { 
            statusCode: 500, 
            body: 'An error occurred',
            headers: headers
        };
    }
};