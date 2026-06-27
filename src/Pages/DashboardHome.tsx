import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  FileText,
  UserCheck,
  BookOpen,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { DashboardLayout } from "../Components/DashboardLayout";
import { DashboardSkeleton } from "../Components/UI/DashboardSkeleton";
import { Link, Navigate } from "react-router-dom";
import {
  useGetDashboardCountsQuery,
  useGetDashboardTrendsQuery,
  useGetApplicationStatusQuery,
  useGetRecentActivitiesQuery,
  useGetDashboardCoursesCountQuery,
} from "../app/services/crudDashboard";

// TODO: Replace with actual API data
export default function DashboardHome() {
  const { data: counts, isLoading: countsLoading } = useGetDashboardCountsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: trends, isLoading: trendsLoading } = useGetDashboardTrendsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: appStatus, isLoading: appStatusLoading } = useGetApplicationStatusQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: coursesCount, isLoading: coursesCountLoading } = useGetDashboardCoursesCountQuery(undefined, { refetchOnMountOrArgChange: true });
  const [page, setPage] = useState(1);
  const { data: activities, isLoading: activitiesLoading, isFetching } = useGetRecentActivitiesQuery({ page, limit: 10 }, { refetchOnMountOrArgChange: true });

  const isLoading = countsLoading || trendsLoading || appStatusLoading || activitiesLoading || coursesCountLoading;

  if (localStorage.getItem("role") === "Employee") {
    return <Navigate to="/dashboard/applications" replace />;
  }

  const getRecentActivityIcon = (type: string) => {
    switch (type) {
      case "Partner":
        return BookOpen;
      case "Lead":
        return UserCheck;
      case "Application":
        return FileText;
      default:
        return MessageSquare;
    }
  };

  const getRecentActivityColor = (type: string) => {
    switch (type) {
      case "Partner":
        return "text-green-500 bg-green-500/10";
      case "Lead":
        return "text-orange-500 bg-orange-500/10";
      case "Application":
        return "text-cyan-500 bg-cyan-500/10";
      default:
        return "text-pink-500 bg-pink-500/10";
    }
  };

  const stats = [
    {
      title: "Total Employees",
      value: counts?.totalEmployees || 0,
      isPositive: true,
      icon: Users,
      href: "/dashboard/employees",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Universities",
      value: counts?.totalUniversities || 0,
      isPositive: true,
      icon: GraduationCap,
      href: "/dashboard/universities",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Courses",
      value: coursesCount || 0,
      isPositive: true,
      icon: BookOpen,
      href: "/dashboard/courses",
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Partners",
      value: counts?.totalPartners || 0,
      isPositive: true,
      icon: BookOpen,
      href: "/dashboard/partner",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Leads",
      value: counts?.totalLeads || 0,
      isPositive: true,
      icon: UserCheck,
      href: "/dashboard/leads",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Applications",
      value: counts?.totalApplications || 0,
      isPositive: true,
      icon: FileText,
      href: "/dashboard/applications",
      color: "bg-cyan-500/10 text-cyan-500",
    },
  ];
  return (
    <DashboardLayout>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={stat.href}>
                <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <span className="flex items-center text-sm font-medium text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      {/* stat.change is just placeholder now */}
                      {/* {stat.change} */}
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Monthly Trends</h3>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
              {trendsLoading ? (
                <div className="h-[300px] flex items-center justify-center">Loading trends...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends || []}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorApplications)"
                  name="Applications"
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  name="Leads"
                />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </motion.div>

          {/* Application Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Application Status</h3>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#013298" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {activitiesLoading && <div>Loading activities...</div>}
            
            {activities && activities.map((activity, index) => {
               const Icon = getRecentActivityIcon(activity.type);
               const colorClass = getRecentActivityColor(activity.type);
               
               return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {/* activity.type doesn't have description in API response, usually message covers it */}
                      {activity.type} Activity
                      {activity.status && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          {activity.status}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
               );
            })}
            {activities && activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No activities found.
                </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || activitiesLoading || isFetching}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm font-medium">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!activities || activities.length < 10 || activitiesLoading || isFetching}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
          </div>
        </motion.div>

       
        </div>
      )}
    </DashboardLayout>
  );
}
