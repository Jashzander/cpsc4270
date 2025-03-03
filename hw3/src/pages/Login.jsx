// src/pages/Login.jsx
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { isAuthenticated, login, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="login-container">
      <h2>Welcome to Pandify</h2>
      <p>Your personal music playlist manager</p>
      {!isAuthenticated && !isLoading && (
        <div className="login-actions">
          <button onClick={handleLogin} className="login-button">
            Log in with Auth0
          </button>
        </div>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default Login;