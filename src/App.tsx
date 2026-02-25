import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ItemDetail from "./pages/ItemDetail";
import UserProfile from "./pages/UserProfile";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import RentalHistory from "./pages/RentalHistory";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ClaimsPage from "./pages/ClaimsPage";
import EditProfilePage from "./pages/EditProfilePage";
import MyListingsPage from "./pages/MyListingsPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import { ListingsProvider } from "./context/ListingsContext";
import { MessagesProvider } from "./context/MessagesContext";
import { BookingsProvider } from "./context/BookingsContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ReviewsProvider } from "./context/ReviewsContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ListingsProvider>
          <MessagesProvider>
              <BookingsProvider>
                <ReviewsProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                      <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
                      <Route path="/user/:name" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                      <Route path="/chat/:name" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                      <Route path="/rental-history" element={<ProtectedRoute><RentalHistory /></ProtectedRoute>} />
                      <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                      <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
                      <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
                      <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                      <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </ReviewsProvider>
              </BookingsProvider>
          </MessagesProvider>
        </ListingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
