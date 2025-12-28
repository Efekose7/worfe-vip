import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CodeVerification.css';

function CodeVerification() {
  const navigate = useNavigate();
  const { verifyCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Tireleri kaldır
    const codeWithoutDashes = code.replace(/-/g, '').toUpperCase();
    const result = await verifyCode(codeWithoutDashes);

    setLoading(false);

    if (result.success) {
      navigate('/welcome');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="code-verification">
      <div className="code-container">
        <div className="code-header">
          <div className="scan-animation"></div>
          <h1>ÖZEL KOD DOĞRULAMA</h1>
          <p>Lütfen size verilen özel erişim kodunu giriniz</p>
        </div>

        <form className="code-form" onSubmit={handleSubmit}>
          <div className="code-input-wrapper">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                let value = e.target.value.toUpperCase().replace(/[^A-F0-9-]/g, '');
                // Otomatik tire ekleme
                if (value.length > 4 && value[4] !== '-') {
                  value = value.slice(0, 4) + '-' + value.slice(4);
                }
                if (value.length > 9 && value[9] !== '-') {
                  value = value.slice(0, 9) + '-' + value.slice(9);
                }
                if (value.length <= 14) {
                  setCode(value);
                }
              }}
              placeholder="XXXX-XXXX-XXXX"
              className="code-input"
              maxLength="14"
              required
              autoFocus
            />
            <div className="input-glow"></div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="cyber-button-verify"
            disabled={loading || code.length < 4}
          >
            {loading ? 'DOĞRULANIYOR...' : 'KODU DOĞRULA'}
          </button>
        </form>

        <div className="security-notice">
          <p>⚠️ Bu kod sadece bir kez kullanılabilir</p>
          <p>⚠️ Kodunuzu başkalarıyla paylaşmayın</p>
        </div>
      </div>
    </div>
  );
}

export default CodeVerification;

