import React, { createContext, useContext, useState, useEffect } from 'react';

const ContactContext = createContext();

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};

export const ContactProvider = ({ children }) => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('contactMessages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('contactMessages', JSON.stringify(messages));
  }, [messages]);

  const addMessage = (messageData) => {
    const newMessage = {
      ...messageData,
      id: Date.now(),
      date: new Date().toISOString(),
      isRead: false,
      status: 'new' // new, responded, closed
    };
    setMessages(prev => [newMessage, ...prev]);
    return newMessage;
  };

  const markAsRead = (messageId) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const updateStatus = (messageId, status) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    ));
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getUnreadCount = () => {
    return messages.filter(msg => !msg.isRead).length;
  };

  return (
    <ContactContext.Provider value={{
      messages,
      addMessage,
      markAsRead,
      updateStatus,
      deleteMessage,
      getUnreadCount
    }}>
      {children}
    </ContactContext.Provider>
  );
};
