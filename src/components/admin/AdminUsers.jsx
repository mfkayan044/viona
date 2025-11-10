import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../context/UserManagementContext';
import { Users, UserPlus, Search, Filter, Shield, Ban, CheckCircle, Trash2, Edit, Eye, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

export default function AdminUsers() {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    changeUserRole,
    getUserStats,
    searchUsers
  } = useUserManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userStats, setUserStats] = useState({}); // Kullanıcı istatistikleri için state

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer'
  });

  // Kullanıcı istatistiklerini yükle
  useEffect(() => {
    const loadUserStats = async () => {
      const statsMap = {};
      for (const user of users) {
        statsMap[user.id] = await getUserStats(user.id);
      }
      setUserStats(statsMap);
    };

    if (users.length > 0) {
      loadUserStats();
    }
  }, [users]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    addUser(newUser);
    setNewUser({ name: '', email: '', phone: '', role: 'customer' });
    setShowAddModal(false);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getRoleBadge = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light uppercase tracking-wider mb-2">Kullanıcı Yönetimi</h1>
            <p className="text-neutral-600">Toplam {users.length} kullanıcı</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            <UserPlus size={18} />
            Yeni Kullanıcı
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-neutral-300 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="İsim, email veya telefon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
            >
              <option value="all">Tüm Roller</option>
              <option value="customer">Müşteriler</option>
              <option value="admin">Adminler</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="blocked">Engellenmiş</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-600" size={24} />
              <span className="text-sm text-neutral-500 uppercase tracking-wider">Toplam</span>
            </div>
            <p className="text-3xl font-light">{users.length}</p>
          </div>
          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-sm text-neutral-500 uppercase tracking-wider">Aktif</span>
            </div>
            <p className="text-3xl font-light">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-purple-600" size={24} />
              <span className="text-sm text-neutral-500 uppercase tracking-wider">Admin</span>
            </div>
            <p className="text-3xl font-light">{users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center gap-3 mb-2">
              <Ban className="text-red-600" size={24} />
              <span className="text-sm text-neutral-500 uppercase tracking-wider">Engelli</span>
            </div>
            <p className="text-3xl font-light">{users.filter(u => u.status === 'blocked').length}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-neutral-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Siparişler
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Harcama
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredUsers.map((user) => {
                  const stats = userStats[user.id] || { totalOrders: 0, totalSpent: 0 };
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-neutral-500">#{user.user_number || '---'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Mail size={14} />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Phone size={14} />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 text-xs rounded uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                            {user.role === 'admin' ? 'Admin' : 'Müşteri'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded uppercase tracking-wider ${getStatusBadge(user.status)}`}>
                          {user.status === 'active' ? 'Aktif' : 'Engelli'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {stats.totalOrders} sipariş
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {stats.totalSpent.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2 border border-neutral-300 hover:bg-neutral-100 transition-colors"
                            title="Detayları Gör"
                          >
                            <Eye size={16} />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => blockUser(user.id)}
                              className="p-2 border border-neutral-300 hover:bg-red-50 hover:border-red-300 transition-colors"
                              title="Engelle"
                            >
                              <Ban size={16} className="text-red-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => unblockUser(user.id)}
                              className="p-2 border border-neutral-300 hover:bg-green-50 hover:border-green-300 transition-colors"
                              title="Engeli Kaldır"
                            >
                              <CheckCircle size={16} className="text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
                                deleteUser(user.id);
                              }
                            }}
                            className="p-2 border border-neutral-300 hover:bg-red-50 hover:border-red-300 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full p-8">
              <h3 className="text-2xl font-light uppercase tracking-wider mb-6">Yeni Kullanıcı Ekle</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm uppercase tracking-wider text-neutral-600 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full border border-neutral-300 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider text-neutral-600 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border border-neutral-300 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider text-neutral-600 mb-2">Telefon</label>
                  <input
                    type="tel"
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full border border-neutral-300 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-wider text-neutral-600 mb-2">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full border border-neutral-300 px-4 py-3 focus:outline-none focus:border-black"
                  >
                    <option value="customer">Müşteri</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors uppercase tracking-wider"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border border-neutral-300 px-6 py-3 hover:bg-neutral-50 transition-colors uppercase tracking-wider"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light uppercase tracking-wider">Kullanıcı Detayları</h3>
                <button onClick={() => setShowDetailModal(false)}>
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Ad Soyad</p>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Telefon</p>
                    <p className="font-medium">{selectedUser.phone || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Kayıt Tarihi</p>
                    <p className="font-medium">
                      {new Date(selectedUser.created_at || selectedUser.registeredAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Son Giriş</p>
                    <p className="font-medium">
                      {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString('tr-TR') : 'Hiç giriş yapmadı'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-300 pt-6">
                  <h4 className="font-medium uppercase tracking-wider mb-4">İstatistikler</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4">
                      <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Toplam Sipariş</p>
                      <p className="text-2xl font-light">{(userStats[selectedUser.id] || { totalOrders: 0 }).totalOrders}</p>
                    </div>
                    <div className="bg-neutral-50 p-4">
                      <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Toplam Harcama</p>
                      <p className="text-2xl font-light">
                        {(userStats[selectedUser.id] || { totalSpent: 0 }).totalSpent.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full mt-6 border border-neutral-300 px-6 py-3 hover:bg-neutral-50 transition-colors uppercase tracking-wider"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
