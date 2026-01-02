import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AnimatePresence } from "framer-motion";

// Lazy Loaded Pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentPending = lazy(() => import("./pages/PaymentPending"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const GameEasterEgg = lazy(() => import("./pages/GameEasterEgg"));
const AffiliateTracker = lazy(() => import("./pages/AffiliateTracker").then(module => ({ default: module.AffiliateTracker })));
const Revendedor = lazy(() => import("./pages/Revendedor"));

// Affiliate Pages (ValeDoce)
const AffiliateCredits = lazy(() => import("./pages/affiliate/Credits"));
const AffiliateSettings = lazy(() => import("./pages/affiliate/Settings"));
const YsaAffiliateTracker = lazy(() => import("./pages/affiliate/AffiliateTracker").then(module => ({ default: module.YsaAffiliateTracker })));

// Admin Pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const ValeDoceReport = lazy(() => import("./pages/admin/ValeDoceReport"));
const Orders = lazy(() => import("./pages/admin/Orders"));

// Providers
import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { StoreProvider } from "./context/StoreContext";
import { AuthProvider } from "./context/AuthContext";
import { CouponProvider } from "./context/CouponContext";
import { AffiliateProvider } from "./context/AffiliateContext";
import { ValeDoceProvider } from "./context/ValeDoceContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Componente interno para gerenciar AnimatePresence com location
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/pending" element={<PaymentPending />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="/easteregg" element={<GameEasterEgg />} />
        <Route path="/revendedor" element={<Revendedor />} />
        
        {/* Affiliate Routes (legacy) */}
        <Route path="/afiliado/:code" element={<AffiliateTracker />} />
        
        {/* ValeDoce Routes */}
        <Route path="/ysa/:slug" element={<YsaAffiliateTracker />} />
        <Route path="/y/creditos" element={<AffiliateCredits />} />
        <Route path="/y/settings" element={<AffiliateSettings />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/valedoce"
          element={
            <ProtectedRoute>
              <ValeDoceReport />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StoreProvider>
            <ProductProvider>
              <CouponProvider>
                <AffiliateProvider>
                  <ValeDoceProvider>
                    <CartProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Suspense fallback={<LoadingSpinner fullScreen />}>
                          <AnimatedRoutes />
                        </Suspense>
                      </BrowserRouter>
                    </CartProvider>
                  </ValeDoceProvider>
                </AffiliateProvider>
              </CouponProvider>
            </ProductProvider>
          </StoreProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
