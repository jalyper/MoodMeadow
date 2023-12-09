// pages/HomePage.js
import React, { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust the path as necessary
import LoginRegisterModal from '../components/LoginRegisterModal'; // Adjust the path as necessary
import LoginLogoutButton from '../components/LoginLogoutButton';

function HomePage() {
  const { isLoggedIn, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="header-content">
          <h2 className="App-title">MOOD MEADOW</h2>
        </div>  
        <div>
          <div className="home-icon">
            <LoginLogoutButton />
          </div>
        </div>
      </header>
      <LoginRegisterModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <div className="icon-container">
        <Link to="/create" className="icon-link">
          <div className="icon">
            <span className="icon-text">Create</span>
          </div>
        </Link>
        <Link to="/my-library" className="icon-link">
          <div className="icon">
            <span className="icon-text">My Library</span>
          </div>
        </Link>
        <Link to="/discover" className="icon-link">
          <div className="icon">
            <span className="icon-text">Discover</span>
          </div>
        </Link>
      </div>
      <footer className='footer'>
        <p id="copyright">&copy; <span id="year">2024 </span>Mood Meadow. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
