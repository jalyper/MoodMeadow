// components/LoginLogoutButton.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginRegisterModal from './LoginRegisterModal';

const LoginLogoutButton = () => {
  const { isLoggedIn, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleButtonClick = async (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      console.log('logout button clicked, logging out');
      logout();
    } else {
      console.log('login button clicked, showing login modal');
      setShowLoginModal(true);
    }
  };

  return (
    // The parent element can be a React Fragment if you don't want a wrapper div
    <>
      <button onClick={handleButtonClick} className="login-logout-button">
        {isLoggedIn ? 'Log Out' : 'Log In'}
      </button>
      <LoginRegisterModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default LoginLogoutButton;
