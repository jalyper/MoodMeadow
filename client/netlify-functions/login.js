// login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');
const Login = require('../../backend/models/Login');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { usernameOrEmail, password } = JSON.parse(event.body);

    const isEmail = usernameOrEmail.includes('@');
    let user = isEmail
      ? await User.findOne({ email: usernameOrEmail })
      : await User.findOne({ username: usernameOrEmail });

    if (!user) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Credentials' }) };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Credentials' }) };
    }

    const payload = { user: { id: user.id } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

    const loginRecord = new Login({
      identifier: usernameOrEmail,
      date: new Date()
    });

    await loginRecord.save();

    return { statusCode: 200, body: JSON.stringify({ token }) };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};