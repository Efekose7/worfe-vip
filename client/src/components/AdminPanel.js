import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AdminPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminPanel() {
  const navigate = useNavigate();
  const { logout, getAuthHeaders } = useAuth();
  const [files, setFiles] = useState([]);
  const [codes, setCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('files');
  // V2: Metin paylaşma kaldırıldı, sadece dosya yükleme
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    file: null,
    description: '' // Dosya hakkında bilgi
    // V1: content: '', type: 'file' - Metin paylaşma özelliği kaldırıldı
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageForm, setMessageForm] = useState({ message: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [banForm, setBanForm] = useState({ is_banned: false, ban_reason: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchFiles();
    fetchCodes();
    fetchUsers();
    fetchCategories();
    fetchAnnouncements();
  }, []);

  // Kategoriler yüklendiğinde ilk kategoriyi seç
  useEffect(() => {
    if (categories.length > 0 && !uploadForm.category) {
      setUploadForm(prev => ({ ...prev, category: categories[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);
  
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/stats/admin/dashboard`,
        { headers: getAuthHeaders() }
      );
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Dashboard istatistikleri hatası:', error);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!window.confirm(`${selectedFiles.length} dosyayı silmek istediğinize emin misiniz?`)) return;
    
    try {
      await axios.post(
        `${API_URL}/admin/files/bulk-delete`,
        { fileIds: selectedFiles },
        { headers: getAuthHeaders() }
      );
      alert('Dosyalar başarıyla silindi!');
      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error('Toplu silme hatası:', error);
      alert('Dosyalar silinirken hata oluştu');
    }
  };
  
  const handleBulkUpdateCategory = async (category) => {
    if (selectedFiles.length === 0 || !category) return;
    
    try {
      await axios.post(
        `${API_URL}/admin/files/bulk-update-category`,
        { fileIds: selectedFiles, category },
        { headers: getAuthHeaders() }
      );
      alert(`${selectedFiles.length} dosyanın kategorisi güncellendi!`);
      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error('Toplu kategori güncelleme hatası:', error);
      alert('Kategori güncellenirken hata oluştu');
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/files`,
        { headers: getAuthHeaders() }
      );
      setFiles(response.data);
    } catch (error) {
      console.error('Dosya listesi hatası:', error);
    }
  };

  const fetchCodes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/codes/list`,
        { headers: getAuthHeaders() }
      );
      setCodes(response.data);
    } catch (error) {
      console.error('Kod listesi hatası:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users`,
        { headers: getAuthHeaders() }
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/categories`,
        { headers: getAuthHeaders() }
      );
      setCategories(response.data || []);
    } catch (error) {
      console.error('Kategori listesi hatası:', error);
    }
  };

  const handleAddCategory = async (categoryName) => {
    if (!categoryName || !categoryName.trim()) {
      alert('Geçerli bir kategori adı giriniz');
      return;
    }

    const trimmedName = categoryName.trim();

    try {
      await axios.post(
        `${API_URL}/admin/categories`,
        { name: trimmedName },
        { headers: getAuthHeaders() }
      );
      alert(`"${trimmedName}" kategorisi başarıyla eklendi!`);
      fetchCategories();
      return true;
    } catch (error) {
      alert('Kategori ekleme hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
      return false;
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (!window.confirm(`"${categoryName}" kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/categories/${encodeURIComponent(categoryName)}`,
        { headers: getAuthHeaders() }
      );
      alert('Kategori başarıyla silindi!');
      fetchCategories();
    } catch (error) {
      alert('Kategori silme hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/announcements`,
        { headers: getAuthHeaders() }
      );
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Duyuru listesi hatası:', error);
    }
  };

  // V2: Sadece dosya yükleme, metin paylaşma kaldırıldı
  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Lütfen bir dosya seçin');
      return;
    }

    if (!uploadForm.category || !uploadForm.category.trim()) {
      alert('Lütfen bir kategori seçin. Kategorileri yönetmek için KATEGORİLER tab\'ını kullanın.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('category', uploadForm.category);
    formData.append('description', uploadForm.description || ''); // Hakkında bilgisi
    formData.append('tags', uploadForm.tags || ''); // Etiketler
    formData.append('type', 'file'); // V2: Her zaman 'file'

    try {
      await axios.post(
        `${API_URL}/admin/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert('Dosya başarıyla yüklendi!');
      setUploadForm({ title: '', category: categories.length > 0 ? categories[0] : '', file: null, description: '', tags: '' }); // V2: content ve type kaldırıldı
      fetchFiles();
      // Kategorileri yeniden yükle (yeni kategori varsa görünecek)
      setTimeout(() => {
        fetchCategories();
      }, 500);
    } catch (error) {
      alert('Yükleme hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
    setLoading(false);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/announcement/${announcementId}`,
        { headers: getAuthHeaders() }
      );
      alert('Duyuru silindi!');
      fetchAnnouncements();
    } catch (error) {
      alert('Silme hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/file/${fileId}`,
        { headers: getAuthHeaders() }
      );
      alert('Dosya silindi!');
      fetchFiles();
    } catch (error) {
      alert('Silme hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
  };

  const handleCreateCode = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/codes/create`,
        {},
        { headers: getAuthHeaders() }
      );
      alert(`Yeni kod oluşturuldu: ${response.data.code}`);
      fetchCodes();
    } catch (error) {
      alert('Kod oluşturma hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
  };

  const handleSendMessage = async (userId) => {
    if (!messageForm.message.trim()) {
      alert('Mesaj boş olamaz');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/admin/user/${userId}/message`,
        { message: messageForm.message },
        { headers: getAuthHeaders() }
      );
      alert('Mesaj gönderildi!');
      setMessageForm({ message: '' });
      setSelectedUser(null);
    } catch (error) {
      alert('Mesaj gönderme hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      alert('Başlık ve içerik gerekli');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/admin/announcement`,
        announcementForm,
        { headers: getAuthHeaders() }
      );
      alert('Duyuru oluşturuldu!');
      setAnnouncementForm({ title: '', content: '' });
    } catch (error) {
      alert('Duyuru oluşturma hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
  };

  const handleBanUser = async (userId, isBanned, reason) => {
    try {
      await axios.post(
        `${API_URL}/admin/user/${userId}/ban`,
        { is_banned: isBanned, ban_reason: reason },
        { headers: getAuthHeaders() }
      );
      alert(isBanned ? 'Kullanıcı banlandı' : 'Ban kaldırıldı');
      fetchUsers();
      setBanForm({ is_banned: false, ban_reason: '' });
      setSelectedUser(null);
    } catch (error) {
      alert('Ban işlemi hatası: ' + (error.response?.data?.error || 'Bilinmeyen hata'));
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>ADMIN PANEL</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/files')} className="back-btn">
            Dosya Sistemine Dön
          </button>
          <button onClick={logout} className="logout-btn">
            ÇIKIŞ
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('dashboard');
            fetchDashboardStats();
          }}
        >
          DASHBOARD
        </button>
        <button
          className={`admin-tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          DOSYA YÖNETİMİ
        </button>
        <button
          className={`admin-tab ${activeTab === 'codes' ? 'active' : ''}`}
          onClick={() => setActiveTab('codes')}
        >
          KOD YÖNETİMİ
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          KULLANICILAR
        </button>
        <button
          className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('categories');
            fetchCategories();
          }}
        >
          KATEGORİLER
        </button>
        <button
          className={`admin-tab ${activeTab === 'announcement' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcement')}
        >
          DUYURU
        </button>
      </div>
      
      {activeTab === 'dashboard' && (
        <div className="admin-content">
          <h2>Dashboard İstatistikleri</h2>
          {dashboardStats ? (
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-icon icon-files-large"></div>
                <div className="stat-info">
                  <div className="stat-value">{dashboardStats.totalFiles}</div>
                  <div className="stat-label">Toplam Dosya</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon icon-users-large"></div>
                <div className="stat-info">
                  <div className="stat-value">{dashboardStats.totalUsers}</div>
                  <div className="stat-label">Toplam Kullanıcı</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon icon-download-large"></div>
                <div className="stat-info">
                  <div className="stat-value">{dashboardStats.totalDownloads}</div>
                  <div className="stat-label">Toplam İndirme</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon icon-eye-large"></div>
                <div className="stat-info">
                  <div className="stat-value">{dashboardStats.totalViews}</div>
                  <div className="stat-label">Toplam Görüntülenme</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon icon-size-large"></div>
                <div className="stat-info">
                  <div className="stat-value">{formatFileSize(dashboardStats.totalFileSize)}</div>
                  <div className="stat-label">Toplam Dosya Boyutu</div>
                </div>
              </div>
            </div>
          ) : (
            <p>Yükleniyor...</p>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="admin-content">
          <div className="upload-section">
            <h2>Yeni Dosya Yükle</h2>
            {/* V2: Metin paylaşma özelliği kaldırıldı, sadece dosya yükleme */}
            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label>Başlık</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  required
                  className="cyber-input"
                  placeholder="Dosya başlığı"
                />
              </div>
              <div className="form-group">
                <label>Kategori {categories.length === 0 && <span style={{ color: '#ff6b6b' }}>(Zorunlu - Önce kategori ekleyin)</span>}</label>
                {categories.length === 0 ? (
                  <div>
                    <select disabled className="cyber-input">
                      <option>Önce kategori ekleyin</option>
                    </select>
                    <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '5px' }}>
                      Dosya yüklemek için önce <strong>KATEGORİLER</strong> tab'ından kategori eklemelisiniz
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={uploadForm.category || categories[0]}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="cyber-input"
                      required
                    >
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>
                      Kategorileri yönetmek için <strong>KATEGORİLER</strong> tab'ını kullanın
                    </p>
                  </>
                )}
              </div>
              <div className="form-group">
                <label>Dosya Seç</label>
                <input
                  type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  required
                  className="file-input"
                />
              </div>
              <div className="form-group">
                <label>Dosya Hakkında</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="cyber-input"
                  rows="5"
                  placeholder="Dosya hakkında bilgi, açıklama veya notlar..."
                />
              </div>
              <div className="form-group">
                <label>Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="cyber-input"
                  placeholder="örn: önemli, güncelleme, v1.0"
                />
              </div>
              {/* V1: Metin paylaşma seçeneği burada kaldırıldı */}
              <button type="submit" className="upload-btn" disabled={loading}>
                {loading ? 'YÜKLENİYOR...' : 'DOSYA YÜKLE'}
              </button>
            </form>
          </div>

          <div className="files-list">
            <div className="files-list-header">
              <h2>Yüklenen Dosyalar</h2>
              {selectedFiles.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedFiles.length} dosya seçildi</span>
                  <button
                    className="bulk-delete-btn"
                    onClick={handleBulkDelete}
                  >
                    Toplu Sil
                  </button>
                  <select
                    className="bulk-category-select"
                    onChange={(e) => handleBulkUpdateCategory(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Kategori Değiştir</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    className="bulk-clear-btn"
                    onClick={() => setSelectedFiles([])}
                  >
                    Seçimi Temizle
                  </button>
                </div>
              )}
            </div>
            {files.length === 0 ? (
              <p>Henüz dosya yüklenmemiş.</p>
            ) : (
              <div className="admin-file-list">
                {files.map((file) => (
                  <div key={file.id} className={`admin-file-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, file.id]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                        }
                      }}
                      className="file-checkbox"
                    />
                    <div className="file-details">
                      <h3>{file.title}</h3>
                      {/* V2: Metin paylaşımı gösterimi kaldırıldı */}
                      <p>
                        {file.filename} | 
                        {file.category || 'Kategori yok'} | 
                        Dosya
                      </p>
                      {/* V1: Metin içeriği önizlemesi kaldırıldı */}
                      <p className="file-date">
                        {new Date(file.uploaded_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      SİL
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'codes' && (
        <div className="admin-content">
          <div className="codes-section">
            <div className="codes-header">
              <h2>Erişim Kodları</h2>
              <button onClick={handleCreateCode} className="create-code-btn">
                YENİ KOD OLUŞTUR
              </button>
            </div>
            <div className="codes-list">
              {codes.length === 0 ? (
                <p>Henüz kod oluşturulmamış.</p>
              ) : (
                <table className="codes-table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Kullanıcı</th>
                      <th>Email</th>
                      <th>Durum</th>
                      <th>IP Adresi</th>
                      <th>Oluşturulma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => {
                      // Kod formatını düzelt (XXXX-XXXX-XXXX)
                      const formattedCode = code.code.length === 12 
                        ? `${code.code.slice(0, 4)}-${code.code.slice(4, 8)}-${code.code.slice(8, 12)}`
                        : code.code;
                      return (
                        <tr key={code.id}>
                          <td className="code-cell" data-label="Kod">{formattedCode}</td>
                          <td data-label="Kullanıcı">{code.username || 'Atanmamış'}</td>
                          <td data-label="Email">{code.email || '-'}</td>
                          <td data-label="Durum">
                            <span className={`status ${code.user_id ? 'used' : 'unused'}`}>
                              {code.user_id ? 'Atanmış' : 'Atanmamış'}
                            </span>
                          </td>
                          <td data-label="IP Adresi">{code.used_ip || '-'}</td>
                          <td data-label="Oluşturulma">{new Date(code.created_at).toLocaleDateString('tr-TR')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-content">
          <div className="users-section">
            <h2>Kullanıcı Yönetimi</h2>
            <div className="users-list">
              {users.length === 0 ? (
                <p>Henüz kullanıcı kaydı bulunmamaktadır.</p>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Kullanıcı Adı</th>
                      <th>Email</th>
                      <th>IP Adresi</th>
                      <th>Durum</th>
                      <th>Kayıt Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="username-cell" data-label="Kullanıcı Adı">{user.username}</td>
                        <td className="email-cell" data-label="Email">{user.email}</td>
                        <td data-label="IP Adresi">{user.last_ip || '-'}</td>
                        <td data-label="Durum">
                          <span className={`status ${user.is_banned ? 'banned' : 'active'}`}>
                            {user.is_banned ? 'Banlı' : 'Aktif'}
                          </span>
                        </td>
                        <td data-label="Kayıt Tarihi">{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                        <td data-label="İşlemler">
                          <div className="user-actions">
                            <button
                              className="action-btn message-btn"
                              onClick={() => setSelectedUser(user)}
                            >
                              Mesaj Gönder
                            </button>
                            {user.is_banned ? (
                              <button
                                className="action-btn unban-btn"
                                onClick={() => handleBanUser(user.id, false, '')}
                              >
                                Ban Kaldır
                              </button>
                            ) : (
                              <button
                                className="action-btn ban-btn"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBanForm({ is_banned: true, ban_reason: '' });
                                }}
                              >
                                Ban At
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedUser && (
              <div className="user-modal">
                <div className="modal-content">
                  <h3>Kullanıcı: {selectedUser.username}</h3>
                  
                  {banForm.is_banned && (
                    <div className="modal-section">
                      <h4>Kullanıcıyı Banla</h4>
                      <div className="form-group">
                        <label>Ban Sebebi</label>
                        <input
                          type="text"
                          value={banForm.ban_reason}
                          onChange={(e) => setBanForm({ ...banForm, ban_reason: e.target.value })}
                          className="cyber-input"
                          placeholder="Ban sebebini giriniz"
                        />
                      </div>
                      <div className="modal-actions">
                        <button
                          className="ban-confirm-btn"
                          onClick={() => handleBanUser(selectedUser.id, true, banForm.ban_reason)}
                        >
                          BANLA
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => {
                            setSelectedUser(null);
                            setBanForm({ is_banned: false, ban_reason: '' });
                          }}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  )}

                  {!banForm.is_banned && (
                    <div className="modal-section">
                      <h4>Mesaj Gönder</h4>
                      <div className="form-group">
                        <label>Mesaj</label>
                        <textarea
                          value={messageForm.message}
                          onChange={(e) => setMessageForm({ message: e.target.value })}
                          className="cyber-input"
                          rows="5"
                          placeholder="Kullanıcıya göndermek istediğiniz mesajı yazın"
                        />
                      </div>
                      <div className="modal-actions">
                        <button
                          className="send-btn"
                          onClick={() => handleSendMessage(selectedUser.id)}
                        >
                          GÖNDER
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => {
                            setSelectedUser(null);
                            setMessageForm({ message: '' });
                          }}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="admin-content">
          <div className="categories-section">
            <h2>Kategori Yönetimi</h2>
            <div className="category-management">
              <div className="add-category-form">
                <h3>Yeni Kategori Ekle</h3>
                <div className="form-group">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Kategori adı girin"
                    className="cyber-input"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newCategoryName.trim()) {
                          const success = await handleAddCategory(newCategoryName);
                          if (success) {
                            setNewCategoryName('');
                          }
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-category-btn"
                    onClick={async () => {
                      if (newCategoryName.trim()) {
                        const success = await handleAddCategory(newCategoryName);
                        if (success) {
                          setNewCategoryName('');
                        }
                      }
                    }}
                  >
                    KATEGORİ EKLE
                  </button>
                </div>
              </div>

              <div className="categories-list">
                <h3>Mevcut Kategoriler</h3>
                {categories.length === 0 ? (
                  <p>Henüz kategori eklenmemiş.</p>
                ) : (
                  <div className="categories-grid">
                    {categories.map((cat, index) => (
                      <div key={index} className="category-item">
                        <span className="category-name">{cat}</span>
                        <button
                          className="delete-category-btn"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          SİL
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcement' && (
        <div className="admin-content">
          <div className="announcement-section">
            <h2>Genel Duyuru Oluştur</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateAnnouncement(); }} className="announcement-form">
              <div className="form-group">
                <label>Başlık</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="cyber-input"
                  required
                  placeholder="Duyuru başlığı"
                />
              </div>
              <div className="form-group">
                <label>İçerik</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="cyber-input"
                  rows="8"
                  required
                  placeholder="Duyuru içeriği"
                />
              </div>
              <button type="submit" className="announcement-btn">
                DUYURU OLUŞTUR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

