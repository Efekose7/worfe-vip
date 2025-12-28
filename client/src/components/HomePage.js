import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [showLoginButton, setShowLoginButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Sayfanın %85'ine gelince butonu göster
      if (scrollPosition >= documentHeight * 0.85) {
        setShowLoginButton(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="homepage">
      <Helmet>
        <title>WORFE VIP - Hacker Tools, Premium Scripts & Security Resources | Worfe Hack</title>
        <meta name="description" content="WORFE VIP - En güncel hacker araçları, premium scriptler, güvenlik kaynakları ve hacking eğitimleri. Worfe hack, hacker tools, penetration testing, ethical hacking ve cyber security için tek adres. Premium dosya paylaşım ve güvenli içerik yönetim sistemi." />
        <meta name="keywords" content="worfe, worfe hack, worfe vip, hacker, hacker tools, hacking, security, penetration testing, ethical hacking, cyber security, premium scripts, hacking tools, vulnerability scanner, exploit, pentest, cybersecurity tools, hacker resources, security testing, network security, web security, mobile security, malware analysis, reverse engineering, bug bounty, security research, siber güvenlik, etik hack, güvenlik testleri" />
        <meta property="og:title" content="WORFE VIP - Hacker Tools, Premium Scripts & Security Resources" />
        <meta property="og:description" content="WORFE VIP - En güncel hacker araçları, premium scriptler, güvenlik kaynakları ve hacking eğitimleri. Worfe hack, hacker tools ve daha fazlası için tek adres." />
        <meta property="og:url" content="https://worfe.vip/" />
        <meta name="twitter:title" content="WORFE VIP - Hacker Tools, Premium Scripts & Security Resources" />
        <meta name="twitter:description" content="WORFE VIP - En güncel hacker araçları, premium scriptler, güvenlik kaynakları ve hacking eğitimleri." />
        <link rel="canonical" href="https://worfe.vip/" />
        
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "WORFE VIP - Hacker Tools & Security Resources",
          "description": "Premium hacker tools, security resources and ethical hacking platform",
          "url": "https://worfe.vip/",
          "inLanguage": "tr-TR",
          "isPartOf": {
            "@type": "WebSite",
            "name": "WORFE VIP",
            "url": "https://worfe.vip/"
          },
          "about": {
            "@type": "Thing",
            "name": "Ethical Hacking and Cybersecurity"
          },
          "keywords": "worfe, worfe hack, worfe vip, hacker, hacker tools, hacking, security, penetration testing, ethical hacking, cyber security"
        })}
        </script>
      </Helmet>
      
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="main-title">WORFE VIP</h1>
          <p className="hero-subtitle">Premium Dosya Paylaşım ve Güvenli İçerik Yönetim Sistemi</p>
          <div className="hero-description">
            <p>Kurumsal düzeyde güvenlik ve profesyonel dosya yönetimi</p>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="about-section">
          <div className="section-header">
            <h2>WORFE HACK HAKKINDA</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-content">
            <div className="about-text">
              <p>
                <strong>Worfe Hack</strong>, siber güvenlik alanında uzmanlaşmış, 
                güvenli bilgi paylaşımı ve eğitim odaklı bir topluluktur. 
                Yılların deneyimi ve profesyonel yaklaşımımızla, üyelerimize 
                en kaliteli içerik ve kaynakları sunmaktayız.
              </p>
              <p>
                Platformumuz, özel olarak seçilmiş üyelerimiz için tasarlanmış 
                premium bir içerik yönetim sistemidir. Her üye, kendisine özel 
                atanan benzersiz bir erişim koduna sahiptir. Bu sistem sayesinde 
                içeriklerimiz sadece yetkili üyelerimize ulaşmaktadır.
              </p>
              <p>
                <strong>Güvenlik</strong> bizim en öncelikli değerimizdir. 
                Tüm dosyalarımız end-to-end şifreleme ile korunmakta ve 
                güvenli sunucularda saklanmaktadır. IP adresi takibi ve 
                kullanıcı bazlı erişim kontrolü ile sistemimizin güvenliği 
                maksimum seviyede tutulmaktadır.
              </p>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="section-header">
            <h2>ÖZELLİKLER</h2>
            <div className="section-divider"></div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Gelişmiş Güvenlik</h3>
              <p>
                End-to-end şifreleme, IP adresi takibi ve kullanıcı bazlı 
                erişim kontrolü ile maksimum güvenlik sağlanmaktadır.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Yüksek Performans</h3>
              <p>
                Optimize edilmiş altyapı sayesinde yüksek hızda dosya 
                indirme ve yükleme imkanı sunulmaktadır.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👑</div>
              <h3>Premium İçerik</h3>
              <p>
                Sadece özel üyelerimize özel olarak hazırlanmış premium 
                içerikler ve kaynaklar erişilebilir durumdadır.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3>Kategorize Sistem</h3>
              <p>
                Dosyalar kategorilere ayrılarak düzenli bir şekilde 
                sunulmakta, kolay erişim sağlanmaktadır.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Özel Erişim Kodları</h3>
              <p>
                Her üyeye özel atanan benzersiz erişim kodları ile 
                güvenli ve kontrollü erişim sağlanmaktadır.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Profesyonel Yönetim</h3>
              <p>
                Kurumsal düzeyde yönetim paneli ile içerik ve 
                kullanıcı yönetimi kolayca yapılabilmektedir.
              </p>
            </div>
          </div>
        </div>

        <div className="security-section">
          <div className="section-header">
            <h2>GÜVENLİK ÖNLEMLERİ</h2>
            <div className="section-divider"></div>
          </div>
          <div className="security-content">
            <div className="security-item">
              <h4>IP Adresi Takibi</h4>
              <p>Her kullanıcının giriş yaptığı IP adresi kaydedilir ve takip edilir.</p>
            </div>
            <div className="security-item">
              <h4>Kullanıcı Bazlı Kod Sistemi</h4>
              <p>Her erişim kodu sadece bir kullanıcıya özeldir ve başkaları tarafından kullanılamaz.</p>
            </div>
            <div className="security-item">
              <h4>Şifreli İletişim</h4>
              <p>Tüm veri transferleri şifrelenmiş kanallar üzerinden gerçekleştirilir.</p>
            </div>
            <div className="security-item">
              <h4>Oturum Yönetimi</h4>
              <p>Güvenli token tabanlı oturum yönetimi ile yetkisiz erişimler engellenir.</p>
            </div>
          </div>
        </div>
      </div>

      {showLoginButton && (
        <div className="hidden-login-section">
          <div className="login-container">
            <p className="login-hint">Sisteme erişim için giriş yapın</p>
            <button 
              className="cyber-button"
              onClick={() => navigate('/auth')}
            >
              SİSTEME GİRİŞ YAP
            </button>
          </div>
        </div>
      )}

      <div className="footer-spacer"></div>
    </div>
  );
}

export default HomePage;
