import React, { useState } from 'react';
import { useContact } from '../../contexts/ContactContext';
import { Mail, MailOpen, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminContact = () => {
  const { messages, markAsRead, updateStatus, deleteMessage, getUnreadCount } = useContact();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMessages = filterStatus === 'all'
    ? messages
    : messages.filter(msg => msg.status === filterStatus);

  const handleView = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      deleteMessage(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      new: { label: 'Yeni', color: 'text-blue-600', bg: 'bg-blue-50' },
      responded: { label: 'Yanıtlandı', color: 'text-green-600', bg: 'bg-green-50' },
      closed: { label: 'Kapatıldı', color: 'text-neutral-600', bg: 'bg-neutral-100' }
    };
    return statuses[status] || statuses.new;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light uppercase tracking-wider">İletişim Mesajları</h2>
          {getUnreadCount() > 0 && (
            <p className="text-sm text-neutral-600 mt-1">
              {getUnreadCount()} okunmamış mesaj
            </p>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="all">Tümü ({messages.length})</option>
          <option value="new">Yeni ({messages.filter(m => m.status === 'new').length})</option>
          <option value="responded">Yanıtlandı ({messages.filter(m => m.status === 'responded').length})</option>
          <option value="closed">Kapatıldı ({messages.filter(m => m.status === 'closed').length})</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <Mail size={48} className="mx-auto mb-4 text-neutral-300" />
              <p>Mesaj bulunmuyor</p>
            </div>
          ) : (
            filteredMessages.map(message => {
              const statusInfo = getStatusInfo(message.status);
              return (
                <div
                  key={message.id}
                  onClick={() => handleView(message)}
                  className={`p-4 border-b border-neutral-200 cursor-pointer hover:bg-neutral-50 transition ${
                    selectedMessage?.id === message.id ? 'bg-neutral-100' : ''
                  } ${!message.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {!message.isRead ? (
                      <Mail size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                    ) : (
                      <MailOpen size={18} className="text-neutral-400 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-sm truncate ${!message.isRead ? 'font-medium' : 'font-light'}`}>
                          {message.name}
                        </p>
                        <span className={`px-2 py-0.5 text-xs ${statusInfo.bg} ${statusInfo.color} rounded flex-shrink-0`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mb-1">{message.email}</p>
                      {message.subject && (
                        <p className="text-xs text-neutral-500 truncate">Konu: {message.subject}</p>
                      )}
                      <p className="text-xs text-neutral-400 mt-2">
                        {new Date(message.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {!selectedMessage ? (
            <div className="bg-white border border-neutral-200 p-12 text-center">
              <Eye size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">Mesaj görüntülemek için listeden seçin</p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200">
              {/* Message Header */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-light mb-2">{selectedMessage.name}</h3>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p>E-posta: {selectedMessage.email}</p>
                      {selectedMessage.phone && <p>Telefon: {selectedMessage.phone}</p>}
                      {selectedMessage.subject && <p>Konu: {selectedMessage.subject}</p>}
                      <p className="text-xs text-neutral-400 mt-2">
                        {new Date(selectedMessage.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'new')}
                    disabled={selectedMessage.status === 'new'}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Yeni
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'responded')}
                    disabled={selectedMessage.status === 'responded'}
                    className="px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Yanıtlandı
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'closed')}
                    disabled={selectedMessage.status === 'closed'}
                    className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Kapat
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-6">
                <h4 className="text-sm font-medium mb-3 uppercase tracking-wider text-neutral-600">Mesaj</h4>
                <div className="bg-neutral-50 p-4 rounded">
                  <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Toplam Mesaj</p>
          <p className="text-2xl font-light">{messages.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Okunmamış</p>
          <p className="text-2xl font-light text-blue-600">{getUnreadCount()}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Yanıtlandı</p>
          <p className="text-2xl font-light text-green-600">
            {messages.filter(m => m.status === 'responded').length}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Kapatıldı</p>
          <p className="text-2xl font-light">{messages.filter(m => m.status === 'closed').length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;
