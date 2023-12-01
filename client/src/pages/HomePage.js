// pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="header-content">
          <div className="search-container">
            <input type="text" placeholder="Search for sounds or creators..." className="search-input" />
          </div>
          <h2 className="App-title">MOOD MEADOW</h2>
        </div>
      </header>
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
    </div>
  );
}

export default HomePage;
