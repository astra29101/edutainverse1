
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import Courses from "./pages/Courses";
import CourseView from "./pages/CourseView";
import LearnerDashboard from "./pages/LearnerDashboard";
import NotFound from "./pages/NotFound";

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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:courseId" element={
              <ProtectedRoute>
                <CourseView />
              </ProtectedRoute>
            } />
            <Route path="/my-courses" element={
              <ProtectedRoute requiredRole="learner">
                <LearnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-course" element={
              <ProtectedRoute requiredRole="admin">
                <CreateCourse />
              </ProtectedRoute>
            } />
            <Route path="/edit-course/:courseId" element={
              <ProtectedRoute requiredRole="admin">
                <EditCourse />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
