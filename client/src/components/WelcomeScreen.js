import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';

function WelcomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/files');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="matrix-rain"></div>
        <div className="welcome-text">
          <h1 className="glitch-welcome" data-text="HOŞGELDİNİZ :)">
            HOŞGELDİNİZ :)
          </h1>
          <p className="welcome-subtitle">Maceraya hazır mısın?</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div className="hacker-terminal">
          <pre>{`
> SYSTEM ACCESS GRANTED
> WELCOME TO THE DEEP WEB
> PREMIUM MEMBER DETECTED
> INITIALIZING FILE SYSTEM...
          `}</pre>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;

