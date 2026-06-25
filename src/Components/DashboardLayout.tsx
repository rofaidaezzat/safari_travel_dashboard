import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo_safari-removebg-preview.png";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  ChevronRight,
  UserCheck,
  Newspaper,
  PenTool,
  Book,
  UserCircle,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", adminOnly: false },
  { icon: Users, label: "Employees", href: "/dashboard/employees", adminOnly: true },
  {
    icon: GraduationCap,
    label: "Universities",
    href: "/dashboard/universities",
    adminOnly: true,
  },
  { icon: Book, label: "Courses", href: "/dashboard/courses", adminOnly: true },
  { icon: BookOpen, label: "Partner", href: "/dashboard/partner", adminOnly: true },
  { icon: FileText, label: "Applications", href: "/dashboard/applications", adminOnly: false },
  { icon: Newspaper, label: "News", href: "/dashboard/news", adminOnly: true },
  { icon: PenTool, label: "Blog", href: "/dashboard/blog", adminOnly: true },
  { icon: UserCheck, label: "Leads", href: "/dashboard/leads", adminOnly: true },
  { icon: UserCircle, label: "My Profile", href: "/dashboard/admin-profile", adminOnly: true },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const filteredMenuItems = menuItems.filter((item) => {
    if (role === "Employee") {
      return !item.adminOnly;
    }
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-72 bg-[#0b122c] transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#1d2d5f]">
            <img src={logo} alt="Safari Logo" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#013298] text-white"
                      : "text-white/70 hover:bg-[#0a3ca8] hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[#1d2d5f]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-[#0a3ca8] hover:text-white transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{localStorage.getItem("name") || "Admin User"}</p>
                <p className="text-xs text-muted-foreground">{localStorage.getItem("email") || "admin@safari.edu"}</p>
              </div>
              <Link
                to="/dashboard/admin-profile"
                className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium hover:opacity-80 transition-opacity"
                title="My Profile"
              >
                {localStorage.getItem("name")?.charAt(0).toUpperCase() || "A"}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
