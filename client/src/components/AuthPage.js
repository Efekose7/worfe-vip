import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.username, formData.password);
    } else {
      if (!formData.email) {
        setError('Email gerekli');
        setLoading(false);
        return;
      }
      result = await register(formData.username, formData.email, formData.password);
    }

    setLoading(false);

    if (result.success) {
      // Admin ise direkt admin paneline, değilse kod doğrulamaya yönlendir
      if (formData.username.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/code-verify');
      }
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Giriş Yap - WORFE VIP</title>
        <meta name="description" content="WORFE VIP sistemine giriş yapın. Premium hacker tools ve güvenlik kaynaklarına erişim için giriş yapın." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="auth-container">
        <div className="auth-header">
          <div className="glitch-small" data-text="WORFE VIP">WORFE VIP</div>
          <div className="auth-subtitle">Güvenli Giriş Sistemi</div>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            GİRİŞ YAP
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            HESAP OLUŞTUR
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="cyber-input"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="cyber-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="cyber-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="cyber-button-submit"
            disabled={loading}
          >
            {loading ? 'İŞLENİYOR...' : isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={() => navigate('/')} className="back-link">
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

