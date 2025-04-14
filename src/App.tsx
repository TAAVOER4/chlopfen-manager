
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Index from "./pages/Index";
import ParticipantsPage from "./pages/Participants/ParticipantsPage";
import RegisterParticipant from "./pages/Participants/RegisterParticipant";
import RegisterGroup from "./pages/Participants/RegisterGroup";
import EditParticipant from "./pages/Participants/EditParticipant";
import EditGroup from "./pages/Participants/EditGroup";
import JudgingPage from "./pages/Judging/JudgingPage";
import IndividualJudging from "./pages/Judging/IndividualJudging";
import GroupJudging from "./pages/Judging/GroupJudging";
import ResultsPage from "./pages/Results/ResultsPage";
import AdminPage from "./pages/Admin/AdminPage";
import UsersPage from "./pages/Admin/UsersPage";
import SponsorsPage from "./pages/Admin/SponsorsPage";
import SchedulePage from "./pages/Admin/SchedulePage";
import TournamentPage from "./pages/Admin/TournamentPage";
import TournamentParticipantsPage from "./pages/Admin/TournamentParticipantsPage";
import TournamentJudgesPage from "./pages/Admin/TournamentJudgesPage";
import ReportsPage from "./pages/Admin/ReportsPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Auth/LoginPage";
import { UserProvider } from "./contexts/UserContext";
import { TournamentProvider } from "./contexts/TournamentContext";
import SupabaseConnectionTest from "./components/SupabaseConnectionTest";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <TournamentProvider>
          <Toaster />
          <Sonner />
          <SupabaseConnectionTest />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/participants" element={<ParticipantsPage />} />
                <Route path="/participants/register" element={<RegisterParticipant />} />
                <Route path="/participants/register-group" element={<RegisterGroup />} />
                <Route path="/participants/edit/:id" element={<EditParticipant />} />
                <Route path="/participants/edit-group/:id" element={<EditGroup />} />
                <Route path="/judging" element={<JudgingPage />} />
                <Route path="/judging/individual/:category" element={<IndividualJudging />} />
                <Route path="/judging/group/:size" element={<GroupJudging />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/sponsors" element={<SponsorsPage />} />
                <Route path="/admin/schedule" element={<SchedulePage />} />
                <Route path="/admin/tournament" element={<TournamentPage />} />
                <Route path="/admin/tournament/:tournamentId/participants" element={<TournamentParticipantsPage />} />
                <Route path="/admin/tournament/:tournamentId/judges" element={<TournamentJudgesPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TournamentProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
