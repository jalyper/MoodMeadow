import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

function LoginRegisterModal({ isOpen, onClose, setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to your server's login endpoint
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        email,
        password
      });
      // Handle the response, e.g., store the token, update user state
      console.log(response.data);

      // store token in local storage
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      onClose(); // Close modal after successful login
    } catch (error) {
      // Handle errors, e.g., show error message to the user
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Login failed:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Login failed: No response', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Login failed:', error.message);
      }
    }
  };
  

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to your server's register endpoint
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, {
        username,
        email,
        password
      });
      // Handle the response, e.g., log the user in or confirm account creation
      console.log(response.data);
      onClose(); // Close modal after successful registration
    } catch (error) {
      // Handle errors, e.g., show error message to the user
      console.error('Registration failed:', error.response.data);
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
      {isLogin ? (
        // Login Form
        <form onSubmit={handleLoginSubmit}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
          <button type="button" onClick={switchToRegister}>Go to Register</button>
        </form>
      ) : (
        // Register Form
        <form onSubmit={handleRegisterSubmit}>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Register</button>
          <button type="button" onClick={switchToLogin}>Go to Login</button>
        </form>
      )}
    </Modal>
  );
}

export default LoginRegisterModal;