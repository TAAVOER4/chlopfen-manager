
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Index from "./pages/Index";
import ParticipantsPage from "./pages/Participants/ParticipantsPage";
import RegisterParticipant from "./pages/Participants/RegisterParticipant";
import JudgingPage from "./pages/Judging/JudgingPage";
import IndividualJudging from "./pages/Judging/IndividualJudging";
import ResultsPage from "./pages/Results/ResultsPage";
import AdminPage from "./pages/Admin/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/participants" element={<ParticipantsPage />} />
            <Route path="/participants/register" element={<RegisterParticipant />} />
            <Route path="/judging" element={<JudgingPage />} />
            <Route path="/judging/individual/:category" element={<IndividualJudging />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
