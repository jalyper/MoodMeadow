// pages/HomePage.js
import React, { useState } from 'react'; // Importing useState hook from React
import { Link } from 'react-router-dom'; // Importing Link component from react-router-dom for navigation
import { useAuth } from '../contexts/AuthContext'; // Importing useAuth custom hook from AuthContext
import LoginRegisterModal from '../components/LoginRegisterModal'; // Importing LoginRegisterModal component
import LoginLogoutButton from '../components/LoginLogoutButton'; // Importing LoginLogoutButton component

// HomePage component
function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false); // State for controlling the visibility of the LoginRegisterModal

  // Rendering HomePage component
  return (
    <div className="homepage">
      <header className="homepage-header"> 
        <div className="homepage-header-content">
          <h2 className="App-title">MOOD MEADOW</h2>
        </div>
        <div className='right-header-content'>
            <LoginLogoutButton />
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
