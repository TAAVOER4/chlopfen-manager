
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Index from "./pages/Index";
import ParticipantsPage from "./pages/Participants/ParticipantsPage";
import RegisterParticipant from "./pages/Participants/RegisterParticipant";
import RegisterGroup from "./pages/Participants/RegisterGroup";
import EditParticipant from "./pages/Participants/EditParticipant";
import JudgingPage from "./pages/Judging/JudgingPage";
import IndividualJudging from "./pages/Judging/IndividualJudging";
import ResultsPage from "./pages/Results/ResultsPage";
import AdminPage from "./pages/Admin/AdminPage";
import JudgesPage from "./pages/Admin/JudgesPage";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./contexts/UserContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/participants" element={<ParticipantsPage />} />
              <Route path="/participants/register" element={<RegisterParticipant />} />
              <Route path="/participants/register-group" element={<RegisterGroup />} />
              <Route path="/participants/edit/:id" element={<EditParticipant />} />
              <Route path="/judging" element={<JudgingPage />} />
              <Route path="/judging/individual/:category" element={<IndividualJudging />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/judges" element={<JudgesPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
