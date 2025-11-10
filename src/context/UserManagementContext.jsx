import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { userService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';

const UserManagementContext = createContext();

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within UserManagementProvider');
  }
  return context;
};

export const UserManagementProvider = ({ children }) => {
  const { orders } = useOrders();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Supabase'den kullanıcıları yükle
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Users load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && users.length > 0) {
      // Calculate user stats from orders
      const updatedUsers = users.map(user => {
        const userOrders = orders.filter(o => o.user_email === user.email);
        return {
          ...user,
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        };
      });
      if (JSON.stringify(updatedUsers) !== JSON.stringify(users)) {
        setUsers(updatedUsers);
      }
    }
  }, [orders, loading]);

  const addUser = async (userData) => {
    try {
      const newUser = await userService.create({
        ...userData,
        status: 'active'
      });
      await loadUsers();
      return newUser;
    } catch (error) {
      console.error('Add user error:', error);
      throw error;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      await userService.update(userId, updates);
      await loadUsers();
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await userService.delete(userId);
      await loadUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  };

  const blockUser = (userId) => {
    updateUser(userId, { status: 'blocked' });
  };

  const unblockUser = (userId) => {
    updateUser(userId, { status: 'active' });
  };

  const changeUserRole = (userId, newRole) => {
    updateUser(userId, { role: newRole });
  };

  const getUserOrders = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kullanıcı siparişleri alınamadı:', error);
      return [];
    }
  };

  const getUserStats = async (userId) => {
    try {
      const userOrders = await getUserOrders(userId);
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.total_amount || order.total || 0), 0);
      const averageOrderValue = userOrders.length > 0 ? totalSpent / userOrders.length : 0;
      
      return {
        totalOrders: userOrders.length,
        totalSpent,
        averageOrderValue,
        lastOrderDate: userOrders.length > 0 
          ? new Date(Math.max(...userOrders.map(o => new Date(o.created_at)))).toISOString()
          : null
      };
    } catch (error) {
      console.error('Kullanıcı istatistikleri alınamadı:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lastOrderDate: null
      };
    }
  };

  const getActiveUsers = () => {
    return users.filter(u => u.status === 'active');
  };

  const getBlockedUsers = () => {
    return users.filter(u => u.status === 'blocked');
  };

  const getAdminUsers = () => {
    return users.filter(u => u.role === 'admin');
  };

  const getCustomerUsers = () => {
    return users.filter(u => u.role === 'customer');
  };

  const searchUsers = (query) => {
    const lowerQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.phone.includes(query)
    );
  };

  const value = {
    users,
    addUser,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    changeUserRole,
    getUserOrders,
    getUserStats,
    getActiveUsers,
    getBlockedUsers,
    getAdminUsers,
    getCustomerUsers,
    searchUsers
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};
