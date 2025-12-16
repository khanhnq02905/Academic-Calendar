import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EditProfileStudent from "./pages/EditProfile-Student";
import CalendarPage from "./pages/Calendar";
import CreateEvents from "./pages/CreateEvents";
import ApproveEvents from "./pages/ApproveEvents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/profile/student" element={<EditProfileStudent />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/create" element={<CreateEvents />} />
          <Route path="/approve" element={<ApproveEvents />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
