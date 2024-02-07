const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Update the AWS config with your environment variables
AWS.config.update({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({ region: 'us-east-1' });

exports.handler = async function(event, context) {
    console.log('Function called with event:', event);

    context.callbackWaitsForEmptyEventLoop = false;

    const headers = {
        "Access-Control-Allow-Origin" : "*", // You can use '*' for development/testing
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 hours
        "Content-Type": "application/json" // Specify that you're sending back JSON
    };

    // Handle OPTIONS method for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        console.log('OPTIONS method received');
        return { 
            statusCode: 204, 
            headers: headers
        };
    }

    if (event.httpMethod !== 'GET') {
        console.log('Non-GET method received:', event.httpMethod);
        return { 
            statusCode: 405, 
            body: JSON.stringify({ message: 'Method Not Allowed' }),
            headers: headers
        };
    }

    // Check if the Authorization header exists
    if (!event.headers.authorization) {
        console.log('No Authorization header');
        return { 
            statusCode: 401, 
            body: JSON.stringify({ message: 'No Authorization header' }),
            headers: headers
        };
    }

    // Extract the JWT from the Authorization header
    const token = event.headers.authorization.split(' ')[1];
    console.log('Token:', token);

    try {
        // Validate the JWT
        console.log('Validating JWT...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT validated:', decoded);

        // Extract the file key from the path
        const fileKey = event.path.split('/').pop();
        console.log('File key:', fileKey);

        // Generate a pre-signed URL for the file
        console.log('Generating pre-signed URL...');
        const url = s3.getSignedUrl('getObject', {
            Bucket: process.env.REACT_APP_SOUND_BUCKET,
            Key: fileKey,
            Expires: 60 * 5 // URL will be valid for 5 minutes
        });
        console.log('Pre-signed URL:', url);

        return {
            statusCode: 200,
            body: JSON.stringify({ url: url }),
            headers: headers
        };
    } catch (err) {
        console.error('An error occurred:', err);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: 'An error occurred' }),
            headers: headers
        };
    }
};
