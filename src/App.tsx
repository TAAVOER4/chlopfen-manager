
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
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Auth/LoginPage";
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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
