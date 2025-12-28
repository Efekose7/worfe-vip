import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './FileSystem.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FileSystem() {
  const navigate = useNavigate();
  const { user, logout, getAuthHeaders } = useAuth();
  const [files, setFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  // V2: Dosya detay modalı
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  
  // Yeni özellikler
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('uploaded_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [viewMode, setViewMode] = useState('list'); // list, grid, compact
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [fileLikes, setFileLikes] = useState({});
  const [fileComments, setFileComments] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Tema her zaman dark
    document.documentElement.setAttribute('data-theme', 'dark');
    
    fetchFiles();
    fetchMessages();
    fetchFavorites();
    
    // Her 30 saniyede bir mesajları kontrol et
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Arama ve sıralama değiştiğinde dosyaları yeniden yükle
  useEffect(() => {
    if (!loading) {
      fetchFiles();
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder, currentPage]);


  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Eğer favoriler seçiliyse, favoriler endpoint'ini kullan
      if (selectedCategory === 'favorites') {
        const response = await axios.get(
          `${API_URL}/interactions/favorites`,
          { headers: getAuthHeaders() }
        );
        const favoriteFiles = response.data || [];
        setFiles(favoriteFiles);
        setTotalPages(1);
        
        // Favoriler seçiliyken de kategorileri çek (tüm dosyalardan)
        try {
          const allFilesResponse = await axios.get(
            `${API_URL}/files/list`,
            { 
              headers: getAuthHeaders(),
              params: { limit: 1000 } // Tüm dosyaları çek
            }
          );
          const allFiles = allFilesResponse.data.files || allFilesResponse.data;
          const cats = [...new Set(allFiles.map(f => f.category).filter(c => c && c.trim() !== '' && c.trim() !== 'Genel'))];
          setCategories(cats);
        } catch (error) {
          console.error('Kategoriler yükleme hatası:', error);
        }
        
        // Favoriler için de beğeni ve yorum durumlarını kontrol et
        if (favoriteFiles.length > 0) {
          const favoritePromises = favoriteFiles.map(file => checkFavoriteStatus(file.id));
          const likePromises = favoriteFiles.map(file => checkLikeStatus(file.id));
          const commentPromises = favoriteFiles.map(file => fetchComments(file.id));
          await Promise.all([...favoritePromises, ...likePromises, ...commentPromises]);
        }
        
        setLoading(false);
        return;
      }
      
      const params = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 20
      };
      
      const response = await axios.get(
        `${API_URL}/files/list`,
        { 
          headers: getAuthHeaders(),
          params
        }
      );
      
      // Yeni API yapısı (pagination ile)
      if (response.data.files) {
        setFiles(response.data.files);
        setTotalPages(response.data.totalPages || 1);
      } else {
        // Eski API yapısı (geriye dönük uyumluluk)
        setFiles(response.data);
        setTotalPages(1);
      }
      
      // Kategorileri çıkar (null, boş string ve "Genel" kategorisini filtrele)
      const allFiles = response.data.files || response.data;
      const cats = [...new Set(allFiles.map(f => f.category).filter(c => c && c.trim() !== '' && c.trim() !== 'Genel'))];
      setCategories(cats);
      
      // Her dosya için favori ve beğeni durumunu kontrol et
      if (allFiles.length > 0) {
        const favoritePromises = allFiles.map(file => checkFavoriteStatus(file.id));
        const likePromises = allFiles.map(file => checkLikeStatus(file.id));
        const commentPromises = allFiles.map(file => fetchComments(file.id));
        await Promise.all([...favoritePromises, ...likePromises, ...commentPromises]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setLoading(false);
    }
  };
  
  const fetchFavorites = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/interactions/favorites`,
        { headers: getAuthHeaders() }
      );
      setFavorites(response.data.map(f => f.id));
    } catch (error) {
      console.error('Favoriler yükleme hatası:', error);
    }
  };
  
  
  const checkFavoriteStatus = async (fileId) => {
    try {
      const response = await axios.get(
        `${API_URL}/interactions/favorite/${fileId}`,
        { headers: getAuthHeaders() }
      );
      setFavorites(prev => {
        if (response.data.isFavorite && !prev.includes(fileId)) {
          return [...prev, fileId];
        } else if (!response.data.isFavorite && prev.includes(fileId)) {
          return prev.filter(id => id !== fileId);
        }
        return prev;
      });
    } catch (error) {
      // Sessizce hata yok say
      return Promise.resolve();
    }
  };
  
  const checkLikeStatus = async (fileId) => {
    try {
      const response = await axios.get(
        `${API_URL}/interactions/like/${fileId}`,
        { headers: getAuthHeaders() }
      );
      setFileLikes(prev => ({
        ...prev,
        [fileId]: { isLiked: response.data.isLiked, count: response.data.likeCount }
      }));
    } catch (error) {
      // Sessizce hata yok say
      return Promise.resolve();
    }
  };
  
  const fetchComments = async (fileId) => {
    try {
      const response = await axios.get(
        `${API_URL}/interactions/comments/${fileId}`,
        { headers: getAuthHeaders() }
      );
      setFileComments(prev => ({
        ...prev,
        [fileId]: response.data
      }));
    } catch (error) {
      // Sessizce hata yok say
      return Promise.resolve();
    }
  };
  
  const toggleFavorite = async (fileId, e) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        `${API_URL}/interactions/favorite/${fileId}`,
        {},
        { headers: getAuthHeaders() }
      );
      setFavorites(prev => {
        if (response.data.isFavorite) {
          return [...prev, fileId];
        } else {
          return prev.filter(id => id !== fileId);
        }
      });
    } catch (error) {
      console.error('Favori hatası:', error);
    }
  };
  
  const toggleLike = async (fileId, e) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        `${API_URL}/interactions/like/${fileId}`,
        {},
        { headers: getAuthHeaders() }
      );
      setFileLikes(prev => ({
        ...prev,
        [fileId]: { isLiked: response.data.isLiked, count: response.data.likeCount }
      }));
    } catch (error) {
      console.error('Beğeni hatası:', error);
    }
  };
  
  const addComment = async (fileId, e) => {
    e.stopPropagation();
    if (!commentText.trim()) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/interactions/comment/${fileId}`,
        { comment: commentText },
        { headers: getAuthHeaders() }
      );
      setCommentText('');
      fetchComments(fileId);
    } catch (error) {
      console.error('Yorum hatası:', error);
      alert('Yorum eklenirken hata oluştu');
    }
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  const getFileIcon = (filename) => {
    if (!filename) return 'file';
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'pdf': 'pdf', 'doc': 'doc', 'docx': 'doc', 'xls': 'xls', 'xlsx': 'xls',
      'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive', 'gz': 'archive',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'svg': 'image',
      'mp4': 'video', 'avi': 'video', 'mov': 'video', 'mkv': 'video',
      'mp3': 'audio', 'wav': 'audio', 'flac': 'audio',
      'txt': 'text', 'md': 'text',
      'exe': 'executable', 'msi': 'executable',
      'apk': 'mobile'
    };
    return iconMap[ext] || 'file';
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/messages`,
        { headers: getAuthHeaders() }
      );
      if (response.data && response.data.length > 0) {
        setMessages(response.data);
        // İlk mesajı göster
        if (!showMessageModal && response.data.length > 0) {
          setCurrentMessage(response.data[0]);
          setShowMessageModal(true);
        }
      }
    } catch (error) {
      console.error('Mesaj yükleme hatası:', error);
    }
  };


  const handleMessageRead = async (messageId) => {
    try {
      await axios.post(
        `${API_URL}/admin/message/${messageId}/read`,
        {},
        { headers: getAuthHeaders() }
      );
      setMessages(messages.filter(m => m.id !== messageId));
      if (messages.length > 1) {
        const nextMessage = messages.find(m => m.id !== messageId);
        setCurrentMessage(nextMessage);
      } else {
        setShowMessageModal(false);
        setCurrentMessage(null);
      }
    } catch (error) {
      console.error('Mesaj okuma hatası:', error);
    }
  };

  // V2: Dosya tıklama ile modal aç
  const handleFileClick = async (file) => {
    setSelectedFile(file);
    setShowFileModal(true);
    
    // Görüntülenme sayısını artır
    try {
      await axios.post(
        `${API_URL}/files/view/${file.id}`,
        {},
        { headers: getAuthHeaders() }
      );
      // Dosya listesini güncelle
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === file.id 
            ? { ...f, view_count: (f.view_count || 0) + 1 }
            : f
        )
      );
    } catch (error) {
      console.error('View count hatası:', error);
    }
  };

  // V2: Modal'dan dosya indir
  const handleDownload = async (fileId, filename, title) => {
    try {
      const response = await axios.get(
        `${API_URL}/files/download/${fileId}`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      // Orijinal dosya adını al (filename'den timestamp'i çıkar)
      const originalFilename = filename.includes('-') 
        ? filename.split('-').slice(2).join('-') 
        : filename;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename || title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('İndirme hatası:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Bilinmeyen hata';
      alert('İndirme hatası: ' + errorMessage);
    }
  };

  // V1: Eski direkt indirme fonksiyonu - V2'de kaldırıldı, modal kullanılıyor

  // Filtreleme artık backend'de yapılıyor, burada sadece görüntüleme için
  const displayFiles = files;

  return (
    <div className="file-system">
      <Helmet>
        <title>WORFE VIP Dosyalar - Premium Hacker Tools & Security Resources</title>
        <meta name="description" content="WORFE VIP dosya arşivi - Premium hacker araçları, güvenlik scriptleri, penetration testing tools, ethical hacking kaynakları ve daha fazlası. Worfe hack dosyalarına erişim." />
        <meta name="keywords" content="worfe dosyalar, worfe hack dosyaları, hacker tools download, premium scripts, security tools, penetration testing tools, ethical hacking resources, cyber security files, hacking scripts, vulnerability scanners, exploit tools, pentest resources" />
        <meta property="og:title" content="WORFE VIP Dosyalar - Premium Hacker Tools & Security Resources" />
        <meta property="og:description" content="WORFE VIP dosya arşivi - Premium hacker araçları, güvenlik scriptleri ve ethical hacking kaynakları." />
        <meta property="og:url" content="https://worfe.vip/files" />
        <meta name="twitter:title" content="WORFE VIP Dosyalar - Premium Hacker Tools" />
        <meta name="twitter:description" content="WORFE VIP dosya arşivi - Premium hacker araçları ve güvenlik kaynakları." />
        <link rel="canonical" href="https://worfe.vip/files" />
      </Helmet>

      {showMessageModal && currentMessage && (
        <div className="message-modal-overlay" onClick={() => {
          handleMessageRead(currentMessage.id);
        }}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="message-header">
              <h3>Yeni Mesaj</h3>
              <button 
                className="close-btn"
                onClick={() => handleMessageRead(currentMessage.id)}
              >
                ×
              </button>
            </div>
            <div className="message-body">
              <p>{currentMessage.message}</p>
            </div>
            <div className="message-footer">
              <button 
                className="read-btn"
                onClick={() => handleMessageRead(currentMessage.id)}
              >
                Okundu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* V2: Dosya detay modalı */}
      {showFileModal && selectedFile && (
        <div 
          className="file-modal-overlay" 
          onClick={() => {
            setShowFileModal(false);
            setSelectedFile(null);
          }}
        >
          <div className="file-modal" onClick={(e) => e.stopPropagation()}>
            <div className="file-modal-header">
              <div className="file-modal-header-content">
                <div className={`file-icon-wrapper file-icon-${getFileIcon(selectedFile.filename)}`}>
                  <span className="file-icon"></span>
                </div>
                <div className="file-title-wrapper">
                  <h2>{selectedFile.title}</h2>
                  <span className="file-type-badge">{selectedFile.category || 'Kategori yok'}</span>
                </div>
              </div>
              <button 
                className="close-btn-modal"
                onClick={() => {
                  setShowFileModal(false);
                  setSelectedFile(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="file-modal-body">
              {/* Temel Bilgiler */}
              <div className="modal-section">
                <h3 className="section-title">Dosya Bilgileri</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Dosya Adı</span>
                    <span className="info-value">
                      {selectedFile.filename?.includes('-') 
                        ? selectedFile.filename.split('-').slice(2).join('-')
                        : selectedFile.filename || 'Bilinmiyor'}
                    </span>
                  </div>
                  {selectedFile.file_size && (
                    <div className="info-item">
                      <span className="info-label">Boyut</span>
                      <span className="info-value">{formatFileSize(selectedFile.file_size)}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Kategori</span>
                    <span className="info-value">{selectedFile.category || 'Kategori yok'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Yüklenme</span>
                    <span className="info-value">
                      {new Date(selectedFile.uploaded_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              {selectedFile.description && (
                <div className="modal-section">
                  <h3 className="section-title">Açıklama</h3>
                  <div className="description-box">
                    {selectedFile.description}
                  </div>
                </div>
              )}

              {/* Etiketler */}
              {selectedFile.tags && (
                <div className="modal-section">
                  <h3 className="section-title">Etiketler</h3>
                  <div className="tags-container">
                    {selectedFile.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="tag-badge">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Yorumlar */}
              <div className="modal-section">
                <div className="section-header">
                  <h3 className="section-title">Yorumlar</h3>
                  <span className="comment-count-badge">{fileComments[selectedFile.id]?.length || 0}</span>
                </div>
                <div className="comments-container">
                  {fileComments[selectedFile.id]?.length > 0 ? (
                    <div className="comments-list">
                      {fileComments[selectedFile.id].slice(0, 3).map(comment => (
                        <div key={comment.id} className="comment-item-inline">
                          <div className="comment-author-inline">{comment.username}</div>
                          <div className="comment-text-inline">{comment.comment}</div>
                          <div className="comment-date-inline">
                            {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      ))}
                      {fileComments[selectedFile.id].length > 3 && (
                        <button
                          className="view-all-comments-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowComments(true);
                          }}
                        >
                          Tüm Yorumları Gör ({fileComments[selectedFile.id].length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="no-comments-text">Henüz yorum yok</p>
                  )}
                  <div className="comment-input-inline">
                    <textarea
                      className="comment-textarea"
                      placeholder="Yorumunuzu yazın..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows="2"
                    />
                    <button
                      className="comment-submit-inline"
                      onClick={(e) => addComment(selectedFile.id, e)}
                      disabled={!commentText.trim()}
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="file-modal-footer">
              <div className="modal-actions-row">
                <div className="action-buttons-group">
                  <button
                    className={`action-btn-secondary ${favorites.includes(selectedFile.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(selectedFile.id, e);
                    }}
                    title={favorites.includes(selectedFile.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  >
                    <span className="icon-star"></span>
                    <span>{favorites.includes(selectedFile.id) ? 'Favoride' : 'Favoriye Ekle'}</span>
                  </button>
                </div>
                <button
                  className="action-btn-primary"
                  onClick={() => {
                    handleDownload(selectedFile.id, selectedFile.filename, selectedFile.title);
                  }}
                >
                  <span className="icon-download"></span>
                  <span>Dosyayı İndir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Yorumlar Modal */}
      {showComments && selectedFile && (
        <div 
          className="comments-modal-overlay"
          onClick={() => {
            setShowComments(false);
            setCommentText('');
          }}
        >
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="comments-modal-header">
              <h3>Yorumlar</h3>
              <span className="comments-file-title">{selectedFile.title}</span>
              <button 
                className="close-btn-modal"
                onClick={() => {
                  setShowComments(false);
                  setCommentText('');
                }}
              >
                ×
              </button>
            </div>
            <div className="comments-modal-body">
              <div className="comments-list">
                {fileComments[selectedFile.id]?.length > 0 ? (
                  fileComments[selectedFile.id].map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{comment.username}</span>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className="comment-text">{comment.comment}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">Henüz yorum yok</p>
                )}
              </div>
              <div className="comment-input-section">
                <textarea
                  className="comment-input"
                  placeholder="Yorumunuzu yazın..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows="3"
                />
                <button
                  className="comment-submit-btn"
                  onClick={(e) => addComment(selectedFile.id, e)}
                  disabled={!commentText.trim()}
                >
                  Yorum Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="file-header">
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className="icon-menu"></span>
          </button>
          <h1>WORFE VIP</h1>
          <span className="user-info">Kullanıcı: {user?.username}</span>
        </div>
        <div className="header-right">
          {user?.username === 'admin' && (
            <button 
              className="admin-btn"
              onClick={() => navigate('/admin')}
            >
              ADMIN PANEL
            </button>
          )}
          <button className="logout-btn" onClick={logout}>
            ÇIKIŞ
          </button>
        </div>
      </div>
      
      {/* Arama ve Filtreleme Barı */}
      <div className="search-filter-bar">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
          <div className="search-wrapper">
            <span className="search-icon"></span>
            <input
              type="text"
              className="search-input"
              placeholder="Dosya ara... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'k') {
                  e.preventDefault();
                  e.target.focus();
                }
              }}
            />
          </div>
          <button
            className={`favorites-header-btn ${selectedCategory === 'favorites' ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('favorites');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            title="Favoriler"
          >
            <span className="icon-star"></span>
            <span>Favoriler</span>
            {favorites.length > 0 && <span className="badge-count">{favorites.length}</span>}
          </button>
        </div>
        <div className="filter-controls">
          <select 
            className="sort-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort);
              setSortOrder(order);
              setCurrentPage(1);
            }}
          >
            <option value="uploaded_at-DESC">Yeni → Eski</option>
            <option value="uploaded_at-ASC">Eski → Yeni</option>
            <option value="title-ASC">A → Z</option>
            <option value="title-DESC">Z → A</option>
            <option value="download_count-DESC">En Çok İndirilen</option>
            <option value="view_count-DESC">En Çok Görüntülenen</option>
            <option value="file_size-DESC">En Büyük</option>
            <option value="file_size-ASC">En Küçük</option>
          </select>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Liste Görünümü"
            >
              <span className="icon-list"></span>
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Görünümü"
            >
              <span className="icon-grid"></span>
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
              title="Kompakt Görünüm"
            >
              <span className="icon-compact"></span>
            </button>
          </div>
        </div>
      </div>
      

      {/* Mobil Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h2>Menü</h2>
              <button 
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="mobile-menu-content">
              <div className="mobile-menu-section">
                <h3>Kategoriler</h3>
                <button
                  className={`mobile-category-btn ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setCurrentPage(1);
                    setMobileMenuOpen(false);
                  }}
                >
                  TÜMÜ
                </button>
                <button
                  className={`mobile-category-btn ${selectedCategory === 'favorites' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory('favorites');
                    setSearchQuery('');
                    setCurrentPage(1);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="icon-star"></span>
                  Favoriler
                  {favorites.length > 0 && <span className="badge-count">{favorites.length}</span>}
                </button>
                {categories.map((cat, index) => (
                  <button
                    key={index}
                    className={`mobile-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mobile-menu-section">
                <h3>Görünüm</h3>
                <div className="mobile-view-mode-toggle">
                  <button
                    className={`mobile-view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => {
                      setViewMode('list');
                      setMobileMenuOpen(false);
                    }}
                    title="Liste Görünümü"
                  >
                    <span className="icon-list"></span>
                    Liste
                  </button>
                  <button
                    className={`mobile-view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => {
                      setViewMode('grid');
                      setMobileMenuOpen(false);
                    }}
                    title="Grid Görünümü"
                  >
                    <span className="icon-grid"></span>
                    Grid
                  </button>
                  <button
                    className={`mobile-view-mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
                    onClick={() => {
                      setViewMode('compact');
                      setMobileMenuOpen(false);
                    }}
                    title="Kompakt Görünüm"
                  >
                    <span className="icon-compact"></span>
                    Kompakt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="file-container">
        <div className={`sidebar ${mobileMenuOpen ? 'mobile-hidden' : ''}`}>
          <h2>KATEGORİLER</h2>
          <button
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setCurrentPage(1);
            }}
          >
            TÜMÜ
          </button>
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="file-content">
          {loading ? (
            <div className="loading">
              <span>Yükleniyor...</span>
            </div>
          ) : displayFiles.length === 0 ? (
            <div className="no-files">
              {searchQuery ? 'Arama sonucu bulunamadı.' : 'Henüz dosya bulunmamaktadır.'}
            </div>
          ) : (
            <>
              <div className={`file-list ${viewMode}`}>
                {displayFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className={`file-item ${viewMode}`}
                    onClick={() => handleFileClick(file)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="file-info">
                      <div className="file-header-row">
                        <h3>
                          <span className={`file-type-icon file-icon-${getFileIcon(file.filename)}`}></span>
                          {file.title}
                        </h3>
                        <div className="file-actions">
                          <button
                            className={`favorite-btn ${favorites.includes(file.id) ? 'active' : ''}`}
                            onClick={(e) => toggleFavorite(file.id, e)}
                            title={favorites.includes(file.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                          >
                            <span className="icon-star"></span>
                          </button>
                          <button
                            className={`like-btn ${fileLikes[file.id]?.isLiked ? 'active' : ''}`}
                            onClick={(e) => toggleLike(file.id, e)}
                            title="Beğen"
                          >
                            <span className="icon-heart"></span>
                            <span className="like-count">{fileLikes[file.id]?.count || 0}</span>
                          </button>
                          <button
                            className="comment-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(file);
                              setShowComments(true);
                            }}
                            title="Yorumlar"
                          >
                            <span className="icon-comment"></span>
                            <span className="comment-count">{fileComments[file.id]?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                      <p className="file-meta">
                        <span className="meta-item">
                          <span className="icon-folder-small"></span>
                          {file.category || 'Kategori yok'}
                        </span>
                        {file.file_size && (
                          <span className="meta-item">
                            <span className="icon-size-small"></span>
                            {formatFileSize(file.file_size)}
                          </span>
                        )}
                        {file.download_count !== undefined && (
                          <span className="meta-item">
                            <span className="icon-download-small"></span>
                            {file.download_count}
                          </span>
                        )}
                        {file.view_count !== undefined && (
                          <span className="meta-item">
                            <span className="icon-eye-small"></span>
                            {file.view_count}
                          </span>
                        )}
                        <span className="meta-item">
                          {new Date(file.uploaded_at).toLocaleDateString('tr-TR')}
                        </span>
                      </p>
                      {file.tags && (
                        <div className="file-tags">
                          {file.tags.split(',').map((tag, idx) => (
                            <span key={idx} className="tag">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="file-click-hint">
                      <span className="icon-arrow-right"></span>
                      <span>Detaylar</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Önceki
                  </button>
                  <span className="page-info">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileSystem;

