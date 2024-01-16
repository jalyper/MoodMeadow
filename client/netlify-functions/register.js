// register.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    let user = await User.findOne({ email: body.email });
    if (user) {
      return { statusCode: 400, body: JSON.stringify({ message: 'User already exists' }) };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    user = new User({
      username: body.username,
      email: body.email,
      password: hashedPassword
    });

    await user.save();

    const payload = { user: { id: user.id } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { statusCode: 201, body: JSON.stringify({ token }) };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};