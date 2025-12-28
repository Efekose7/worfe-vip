import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import CodeVerification from './components/CodeVerification';
import WelcomeScreen from './components/WelcomeScreen';
import FileSystem from './components/FileSystem';
import AdminPanel from './components/AdminPanel';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated, hasVerifiedCode, loading } = useAuth();
  
  // Loading sırasında bekleyelim
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#fff',
        background: '#0f0f0f'
      }}>
        Yükleniyor...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!hasVerifiedCode) {
    return <Navigate to="/code-verify" replace />;
  }
  
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Loading sırasında bekleyelim
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#fff',
        background: '#0f0f0f'
      }}>
        Yükleniyor...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  // Admin için özel kod gereksinimi yok
  if (user?.username !== 'admin') {
    return <Navigate to="/files" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/code-verify" element={<CodeVerification />} />
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route 
        path="/files" 
        element={
          <PrivateRoute>
            <FileSystem />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
