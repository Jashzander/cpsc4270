// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import NewPlaylist from './pages/NewPlaylist';
import EditPlaylist from './pages/EditPlaylist';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';
import { useParams } from 'react-router-dom';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Validate ID parameter
const ValidateIdRoute = ({ children }) => {
  const { id } = useParams();
  
  // If ID is undefined or not valid, redirect to home
  if (!id || id === 'undefined' || id === 'null') {
    console.error('Invalid route parameter ID:', id);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/playlists/new" 
                element={
                  <ProtectedRoute>
                    <NewPlaylist />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/playlists/:id/edit" 
                element={
                  <ProtectedRoute>
                    <ValidateIdRoute>
                      <EditPlaylist />
                    </ValidateIdRoute>
                  </ProtectedRoute>
                } 
              />
              {/* Catch-all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;