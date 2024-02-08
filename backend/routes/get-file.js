// backend/routes/get-file.js
const express = require('express');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Update the AWS config with your environment variables
AWS.config.update({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({ region: 'us-east-1' });

router.get('/:fileKey', async (req, res) => {
    // Check if the Authorization header exists
    if (!req.headers.authorization) {
        console.log('No Authorization header');
        return res.status(401).json({ message: 'No Authorization header' });
    }

    // Extract the JWT from the Authorization header
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token);

    try {
        // Validate the JWT
        console.log('Validating JWT...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT validated:', decoded);

        // Extract the file key from the path
        const fileKey = req.params.fileKey;
        console.log('File key:', fileKey);

        // Generate a pre-signed URL for the file
        console.log('Generating pre-signed URL...');
        const url = s3.getSignedUrl('getObject', {
            Bucket: process.env.REACT_APP_SOUND_BUCKET,
            Key: fileKey,
            Expires: 60 * 5 // URL will be valid for 5 minutes
        });
        console.log('Pre-signed URL:', url);

        return res.status(200).json({ url: url });
    } catch (err) {
        console.error('An error occurred:', err);
        return res.status(500).json({ message: 'An error occurred' });
    }
});

module.exports = router;