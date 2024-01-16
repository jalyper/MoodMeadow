const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Update the AWS config with your environment variables
AWS.config.update({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

exports.handler = async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Check if the Authorization header exists
    if (!event.headers.authorization) {
        return { statusCode: 401, body: 'No Authorization header' };
    }

    // Extract the JWT from the Authorization header
    const token = event.headers.authorization.split(' ')[1];

    // Validate the JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return { statusCode: 401, body: 'Invalid token' };
        } else {
            // If the token is valid, get the filename from the query string
            const filename = event.queryStringParameters.filename;
            const params = {Bucket: 'moodmeadow-sound-files', Key: `sounds/${filename}`, Expires: 3600};
            const url = s3.getSignedUrl('getObject', params);

            console.log(url);
            return { statusCode: 200, body: url };
        }
    });
};