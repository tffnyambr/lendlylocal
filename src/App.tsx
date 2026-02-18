import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ItemDetail from "./pages/ItemDetail";
import UserProfile from "./pages/UserProfile";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import { ListingsProvider } from "./context/ListingsContext";
import { MessagesProvider } from "./context/MessagesContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ListingsProvider>
        <MessagesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/user/:name" element={<UserProfile />} />
              <Route path="/chat/:name" element={<ChatPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MessagesProvider>
      </ListingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
