import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import DashboardHome from "./Pages/DashboardHome";
import LoginPage from "./Pages/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmployeesPage from "./Pages/EmployeesPage";
import PartnersPage from "./Pages/PartnerPage";
import UniversityPage from "./Pages/UniversityPage";
import CoursesPage from "./Pages/CoursesPage";
import LeadPage from "./Pages/LeadPage";
import ApplicationPage from "./Pages/ApplicationPage";
import Travel from "./Pages/Travel";
import NewsPage from "./Pages/News";
import BlogPage from "./Pages/Blog";
function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/employees" element={<EmployeesPage />} />
            <Route path="/dashboard/partner" element={<PartnersPage />} />
            <Route path="/dashboard/universities" element={<UniversityPage />} />  
            <Route path="/dashboard/courses" element={<CoursesPage />} />
            <Route path="/dashboard/leads" element={<LeadPage />} />
            <Route path="/dashboard/applications" element={<ApplicationPage />} />
            <Route path="/dashboard/travel" element={<Travel />} />
            <Route path="/dashboard/news" element={<NewsPage />} />
            <Route path="/dashboard/blog" element={<BlogPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
