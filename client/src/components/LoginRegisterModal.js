import React, { useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../contexts/AuthContext';

function LoginRegisterModal({ isOpen, onClose, setIsLoggedIn }) {
  const { login } = useAuth();
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [username, setUsername] = useState('');
  const [usernameOrEmail, setUserNameOrEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginErrorMessage(''); // Clear any existing error messages

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL_DEV}/login`, {
        method: 'POST',
        body: JSON.stringify({
          usernameOrEmail,
          password
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log(data);
      login(data.token);
      onClose(); // Close modal after successful login
    } catch (error) {
      console.error('Login failed:', error.message);
      setLoginErrorMessage('Login failed. Please check your credentials and try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL_DEV}/register`, {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      console.log(data);
      console.log('Successfully registered.');
      onClose(); // Close modal after successful registration
    } catch (error) {
      console.error('Registration failed:', error.message);
      setRegistrationErrorMessage('Registration failed. Please try again.');
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={false}>
      <button className="modal-close-button" onClick={onClose}>&times;</button>
      {isLogin ? (
        // Login Form
        <form id="login-form" onSubmit={handleLoginSubmit}>
          <h2 className="login-form-header">Log in to save arrangements!</h2><br />
          {loginErrorMessage && <div className="login-error-message">{loginErrorMessage}</div>}
          <input
            type="username"
            placeholder="Username/Email"
            value={usernameOrEmail}
            onChange={(e) => setUserNameOrEmail(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br /><br />
          <button className="login-button" type="submit">Login</button><br /><br />
          <h3 className="register-new-user-summary">New here? Click Register to create a Mood Meadow account!</h3>
          <button className="display-register-form" type="button" onClick={switchToRegister}>Register</button>
        </form>
      ) : (
        // Register Form
        <form id='registration-form' onSubmit={handleRegisterSubmit}>
          <h2 className="register-form-header">Register</h2>
          {registrationErrorMessage && <div className="registration-error-message">{registrationErrorMessage}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br /><br />
          <button className="register-button" type="submit">Register</button><br /><br />
          <h2 className="login-summary">Already registered? Click below to log in.</h2><br />
          <button className="display-login-form" type="button" onClick={switchToLogin}>Go to Login</button>
        </form>
      )}
    </Modal>
  );
}

export default LoginRegisterModal;