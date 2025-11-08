import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useOrders } from '../../contexts/OrderContext';
import { useApp } from '../../contexts/AppContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign, Users, Package } from 'lucide-react';

export default function AdminReports() {
  const { stats, salesData, topProducts } = useDashboard();
  const { orders } = useOrders();
  const { products } = useApp();
  const { users } = useUserManagement();

  const [dateRange, setDateRange] = useState('all');
  const [reportType, setReportType] = useState('sales');

  // CSV Export fonksiyonu
  const exportToCSV = (data, filename) => {
    const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
    const headers = Object.keys(data[0] || {}).join(',');
    const fullContent = `${headers}\n${csvContent}`;
    
    const blob = new Blob(['\ufeff' + fullContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Satış Raporu Export
  const exportSalesReport = () => {
    const salesReport = orders.map(order => ({
      'Sipariş No': order.id,
      'Tarih': new Date(order.createdAt).toLocaleDateString('tr-TR'),
      'Müşteri': order.customerName || 'Misafir',
      'Ürün Sayısı': order.items?.length || 0,
      'Toplam': order.total || 0,
      'Durum': order.status,
      'Ödeme Yöntemi': order.paymentMethod || 'Kredi Kartı'
    }));
    exportToCSV(salesReport, 'satis_raporu');
  };

  // Ürün Raporu Export
  const exportProductsReport = () => {
    const productsReport = products.map(product => ({
      'ID': product.id,
      'Ürün Adı': product.name,
      'Kategori': product.category,
      'Fiyat': product.price,
      'Stok': product.stock,
      'Renk': product.color || '-',
      'Durum': product.stock > 0 ? 'Stokta' : 'Tükendi'
    }));
    exportToCSV(productsReport, 'urun_raporu');
  };

  // Müşteri Raporu Export
  const exportCustomersReport = () => {
    const customersReport = users.filter(u => u.role === 'customer').map(user => ({
      'ID': user.id,
      'Ad Soyad': user.name,
      'Email': user.email,
      'Telefon': user.phone,
      'Toplam Sipariş': user.totalOrders || 0,
      'Toplam Harcama': user.totalSpent || 0,
      'Durum': user.status,
      'Kayıt Tarihi': new Date(user.registeredAt).toLocaleDateString('tr-TR')
    }));
    exportToCSV(customersReport, 'musteri_raporu');
  };

  // Gelir Analizi
  const getRevenueAnalysis = () => {
    const today = new Date();
    const thisMonth = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === today.getMonth() && 
             orderDate.getFullYear() === today.getFullYear() &&
             o.status === 'completed';
    });

    const lastMonth = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return orderDate.getMonth() === lastMonthDate.getMonth() && 
             orderDate.getFullYear() === lastMonthDate.getFullYear() &&
             o.status === 'completed';
    });

    const thisMonthRevenue = thisMonth.reduce((sum, o) => sum + o.totalAmount, 0);
    const lastMonthRevenue = lastMonth.reduce((sum, o) => sum + o.totalAmount, 0);
    const growth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    return {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      growth,
      thisMonthOrders: thisMonth.length,
      lastMonthOrders: lastMonth.length
    };
  };

  // En Çok Satan Kategoriler
  const getTopCategories = () => {
    const categoryRevenue = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = product.category || 'Diğer';
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = { revenue: 0, count: 0 };
          }
          categoryRevenue[category].revenue += item.price * item.quantity;
          categoryRevenue[category].count += item.quantity;
        }
      });
    });

    return Object.entries(categoryRevenue)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const revenueAnalysis = getRevenueAnalysis();
  const topCategories = getTopCategories();

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-light uppercase tracking-wider mb-8">İstatistikler & Raporlama</h1>

        {/* Hızlı İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-green-600" size={32} />
              <span className="text-sm uppercase tracking-wider text-neutral-500">Bu Ay Gelir</span>
            </div>
            <p className="text-3xl font-light mb-2">
              {revenueAnalysis.thisMonth.toLocaleString('tr-TR')} ₺
            </p>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} className={revenueAnalysis.growth >= 0 ? 'text-green-600' : 'text-red-600'} />
              <span className={revenueAnalysis.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {revenueAnalysis.growth}%
              </span>
              <span className="text-neutral-500">önceki aya göre</span>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center justify-between mb-4">
              <FileText className="text-blue-600" size={32} />
              <span className="text-sm uppercase tracking-wider text-neutral-500">Bu Ay Sipariş</span>
            </div>
            <p className="text-3xl font-light mb-2">{revenueAnalysis.thisMonthOrders}</p>
            <p className="text-sm text-neutral-500">
              Geçen ay: {revenueAnalysis.lastMonthOrders}
            </p>
          </div>

          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-purple-600" size={32} />
              <span className="text-sm uppercase tracking-wider text-neutral-500">Toplam Müşteri</span>
            </div>
            <p className="text-3xl font-light mb-2">
              {users.filter(u => u.role === 'customer').length}
            </p>
            <p className="text-sm text-neutral-500">
              Aktif: {users.filter(u => u.role === 'customer' && u.status === 'active').length}
            </p>
          </div>

          <div className="bg-white p-6 border border-neutral-300">
            <div className="flex items-center justify-between mb-4">
              <Package className="text-amber-600" size={32} />
              <span className="text-sm uppercase tracking-wider text-neutral-500">Ürün Çeşidi</span>
            </div>
            <p className="text-3xl font-light mb-2">{products.length}</p>
            <p className="text-sm text-neutral-500">
              Stokta: {products.filter(p => p.stock > 0).length}
            </p>
          </div>
        </div>

        {/* Rapor Export Butonları */}
        <div className="bg-white border border-neutral-300 p-6 mb-8">
          <h3 className="text-xl font-light uppercase tracking-wider mb-4">Rapor İndir</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={exportSalesReport}
              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-neutral-300 hover:border-black hover:bg-neutral-50 transition-all"
            >
              <Download size={20} />
              <div className="text-left">
                <p className="font-medium uppercase tracking-wider">Satış Raporu</p>
                <p className="text-xs text-neutral-500">{orders.length} sipariş</p>
              </div>
            </button>

            <button
              onClick={exportProductsReport}
              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-neutral-300 hover:border-black hover:bg-neutral-50 transition-all"
            >
              <Download size={20} />
              <div className="text-left">
                <p className="font-medium uppercase tracking-wider">Ürün Raporu</p>
                <p className="text-xs text-neutral-500">{products.length} ürün</p>
              </div>
            </button>

            <button
              onClick={exportCustomersReport}
              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-neutral-300 hover:border-black hover:bg-neutral-50 transition-all"
            >
              <Download size={20} />
              <div className="text-left">
                <p className="font-medium uppercase tracking-wider">Müşteri Raporu</p>
                <p className="text-xs text-neutral-500">
                  {users.filter(u => u.role === 'customer').length} müşteri
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* En Çok Satan Ürünler */}
        <div className="bg-white border border-neutral-300 mb-8">
          <div className="p-6 border-b border-neutral-300">
            <h3 className="text-xl font-light uppercase tracking-wider">En Çok Satan Ürünler</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr key="header-products">
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Sıra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Ürün</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Satış Adedi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Toplam Gelir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {topProducts.slice(0, 10).map((product, index) => (
                  <tr key={product.productId || `product-${index}`} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium">{index + 1}</td>
                    <td className="px-6 py-4 text-sm">{product.name}</td>
                    <td className="px-6 py-4 text-sm">{product.totalSold} adet</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {product.revenue.toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kategori Analizi */}
        <div className="bg-white border border-neutral-300">
          <div className="p-6 border-b border-neutral-300">
            <h3 className="text-xl font-light uppercase tracking-wider">Kategori Bazlı Satışlar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr key="header-categories">
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Satış Adedi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Toplam Gelir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Oran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {topCategories.map((category, index) => {
                  const totalRevenue = topCategories.reduce((sum, c) => sum + c.revenue, 0);
                  const percentage = ((category.revenue / totalRevenue) * 100).toFixed(1);
                  return (
                    <tr key={category.name || `category-${index}`} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 text-sm font-medium">{category.name}</td>
                      <td className="px-6 py-4 text-sm">{category.count} adet</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {category.revenue.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
