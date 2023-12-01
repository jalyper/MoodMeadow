// middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).send({ message: 'Token is not valid' });
  }
};

module.exports = auth;
