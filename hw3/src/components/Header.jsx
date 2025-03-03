// src/components/Header.jsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    // Auth0 will handle the redirect
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Pandify</Link>
      </div>
      <nav>
        {isAuthenticated ? (
          <div className="nav-links">
            {user && (
              <span className="user-info">
                {user.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'} 
                    className="user-avatar"
                  />
                )}
                <span>Welcome, {user.name || user.email || 'User'}</span>
              </span>
            )}
            <Link to="/">My Playlists</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;