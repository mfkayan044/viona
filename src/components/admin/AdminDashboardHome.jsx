import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Package } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboardHome() {
  const { stats, salesData, topProducts, categoryStats, recentOrders, getOrderStatusBreakdown } = useDashboard();

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, bgColor }) => (
    <div className="bg-white p-6 border border-neutral-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-light">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 ${bgColor} bg-opacity-10`}>
          <Icon size={24} className={bgColor.replace('bg-', 'text-')} />
        </div>
      </div>
    </div>
  );

  const statusBreakdown = getOrderStatusBreakdown();

  return (
    <div className="space-y-8">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Gelir"
          value={`${stats.totalRevenue.toLocaleString('tr-TR')} ₺`}
          icon={DollarSign}
          bgColor="bg-green-600"
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats.totalOrders}
          icon={ShoppingBag}
          bgColor="bg-blue-600"
        />
        <StatCard
          title="Müşteri Sayısı"
          value={stats.totalCustomers}
          icon={Users}
          bgColor="bg-purple-600"
          trend="up"
          trendValue="+8 yeni"
        />
        <StatCard
          title="Ürün Sayısı"
          value={stats.totalProducts}
          icon={Package}
          bgColor="bg-amber-600"
        />
      </div>

      {/* Ek İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-neutral-300">
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Bekleyen Siparişler</p>
          <p className="text-2xl font-light">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white p-6 border border-neutral-300">
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Tamamlanan Siparişler</p>
          <p className="text-2xl font-light">{stats.completedOrders}</p>
        </div>
        <div className="bg-white p-6 border border-neutral-300">
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Ortalama Sipariş Değeri</p>
          <p className="text-2xl font-light">{stats.averageOrderValue.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Satış Trendi */}
        <div className="bg-white p-6 border border-neutral-300">
          <h3 className="text-lg font-light uppercase tracking-wider mb-6">Son 7 Gün Satış Trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Gelir (₺)" />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Sipariş Sayısı" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* En Çok Satan Ürünler */}
        <div className="bg-white p-6 border border-neutral-300">
          <h3 className="text-lg font-light uppercase tracking-wider mb-6">En Çok Satan Ürünler</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSold" fill="#3b82f6" name="Satış Adedi" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Kategori Dağılımı */}
        <div className="bg-white p-6 border border-neutral-300">
          <h3 className="text-lg font-light uppercase tracking-wider mb-6">Kategori Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name} (${entry.count})`}
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sipariş Durum Dağılımı */}
        <div className="bg-white p-6 border border-neutral-300">
          <h3 className="text-lg font-light uppercase tracking-wider mb-6">Sipariş Durumları</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="Sipariş Sayısı">
                {statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Son Siparişler */}
      <div className="bg-white border border-neutral-300">
        <div className="p-6 border-b border-neutral-300">
          <h3 className="text-lg font-light uppercase tracking-wider">Son Siparişler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customerName || 'Misafir'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(order.total || 0).toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
