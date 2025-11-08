import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './contexts/AppContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './contexts/ToastContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import { OrderProvider } from './contexts/OrderContext';
import { AuthProvider } from './contexts/AuthContext';
import { ReviewProvider } from './contexts/ReviewContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { CouponProvider } from './contexts/CouponContext';
import { BlogProvider } from './contexts/BlogContext';
import { ContactProvider } from './contexts/ContactContext';
import { FaqProvider } from './contexts/FaqContext';
import { CartReminderProvider } from './contexts/CartReminderContext';
import { FlashSaleProvider } from './contexts/FlashSaleContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { DashboardProvider } from './context/DashboardContext';
import { InventoryProvider } from './context/InventoryContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserManagementProvider } from './context/UserManagementContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import LoadingFallback from './components/LoadingFallback';
import { testSupabaseConnection } from './utils/testSupabase';

// Test Supabase connection on app load
testSupabaseConnection();

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = React.lazy(() => import('./pages/OrderSuccessPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const MyOrdersPage = React.lazy(() => import('./pages/MyOrdersPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = React.lazy(() => import('./pages/BlogDetailPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const FaqPage = React.lazy(() => import('./pages/FaqPage'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const CartReminderPopup = React.lazy(() => import('./components/CartReminderPopup'));

function App() {
  return (
    <Router>
      <HelmetProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AuthProvider>
              <AppProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  <RecentlyViewedProvider>
                    <CouponProvider>
                      <FlashSaleProvider>
                        <PaymentProvider>
                          <BlogProvider>
                            <ContactProvider>
                              <FaqProvider>
                                <OrderProvider>
                                  <DashboardProvider>
                                    <InventoryProvider>
                                      <UserManagementProvider>
                                        <NotificationProvider>
                                        <ReviewProvider>
                                        <CartReminderProvider>
                                          <ToastProvider>
                                        <React.Suspense fallback={<LoadingFallback />}>
                                          <CartReminderPopup />
                                          <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/compare" element={<ComparePage />} />
                          <Route path="/blog" element={<BlogPage />} />
                          <Route path="/blog/:slug" element={<BlogDetailPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/faq" element={<FaqPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/my-orders" element={<MyOrdersPage />} />
                          <Route path="/admin-login" element={<AdminLogin />} />
                          <Route path="/admin/*" element={<AdminDashboard />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        </React.Suspense>
                        </ToastProvider>
                      </CartReminderProvider>
                    </ReviewProvider>
                  </NotificationProvider>
                </UserManagementProvider>
              </InventoryProvider>
            </DashboardProvider>
          </OrderProvider>
            </FaqProvider>
          </ContactProvider>
        </BlogProvider>
        </PaymentProvider>
        </FlashSaleProvider>
        </CouponProvider>
        </RecentlyViewedProvider>
        </ComparisonProvider>
        </WishlistProvider>
      </AppProvider>
    </AuthProvider>
    </CurrencyProvider>
    </LanguageProvider>
  </HelmetProvider>
  </Router>
  );
}

export default App;
