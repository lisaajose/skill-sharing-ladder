import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/Layout";
import Placeholder from "@/pages/Placeholder";
import Skills from "@/pages/Skills";
import Matches from "@/pages/Matches";
import Sessions from "@/pages/Sessions";
import Progress from "@/pages/Progress";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";

import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function RequireAuth() {
  const { current } = useAuth();
  if (!current) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route element={<RequireAuth />}>
              <Route path="skills" element={<Skills />} />
              <Route path="matches" element={<Matches />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="progress" element={<Progress />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:id" element={<Profile />} />
            </Route>
            <Route path="auth" element={<Auth />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root"); if (rootElement) { createRoot(rootElement).render(<App />); }