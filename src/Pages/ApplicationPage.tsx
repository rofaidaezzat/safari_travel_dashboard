import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye, UserPlus, Download } from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { Pagination } from "../Components/Pagination";
import { useGetApplicationsQuery, type Application } from "../app/services/crudApplication";
import { useGetMyAssignmentsQuery } from "../app/services/crudAssignment";
import { CreateApplicationModal } from "../Components/ApplicationModal/CreateApplication";
import { UpdateApplicationStatusModal } from "../Components/ApplicationModal/UpdateApplicationStatus";
import { DeleteApplicationModal } from "../Components/ApplicationModal/DeleteApplication";
import { ViewApplicationModal } from "../Components/ApplicationModal/ViewApplication";
import { AssignApplicationModal } from "../Components/ApplicationModal/AssignApplication";
import { UpdateAssignmentStatusModal } from "../Components/UpdateAssignmentStatusModal";
import { TableSkeleton } from "../Components/UI/TableSkeleton";

interface ApplicationWithAssignment extends Application {
  assignmentId?: string;
  assignmentStatus?: string;
}

export default function ApplicationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  // Assignment Status Update State
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");


  
  const role = localStorage.getItem("role");
  const isEmployee = role === "Employee";

  // Fetch all applications (for Admin)
  const { data: allAppsData, isLoading: isAppsLoading, isError: isAppsError, error: appsError, refetch: refetchApps } = useGetApplicationsQuery(
    { page, limit: 10, sort },
    { skip: isEmployee }
  );

  // Fetch assigned applications (for Employee)
  const { data: assignmentsData, isLoading: isAssignLoading, isError: isAssignError, error: assignError, refetch: refetchAssign } = useGetMyAssignmentsQuery(
    { page, limit: 10 },
    { skip: !isEmployee }
  );
  
  let applications: ApplicationWithAssignment[] = [];
  let pagination = { currentPage: 1, numberOfPages: 1 };
  let isError = false;
  let isLoading = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let error: any = null;
  let refetch = () => {};

  if (isEmployee) {
    isLoading = isAssignLoading;
    const assignedApps = assignmentsData?.data.assignments
      .filter((item) => item.item_type === "Application")
      .map((item) => {
        const app = item.item_id as Application;
        return { ...app, status: item.status, assignmentId: item._id, assignmentStatus: item.status };
      }) || [];
    
    applications = assignedApps;
    pagination = assignmentsData?.pagination || { currentPage: 1, numberOfPages: 1, limit: 10 };
    isError = isAssignError;
    error = assignError;
    refetch = refetchAssign;
  } else {
    // For Admin, use applications directly
    applications = allAppsData?.data.applications.map(app => ({
        ...app,
        assignmentStatus: app.status
    })) || [];

    pagination = allAppsData?.pagination || { currentPage: 1, numberOfPages: 1, limit: 10 };
    isLoading = isAppsLoading;
    isError = isAppsError;
    error = appsError;
    refetch = refetchApps;
  }
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.desiredMajor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.desiredCountry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || (app.status || "Pending") === statusFilter;

    const appDate = new Date(app.createdAt);
    const matchesStart = startDate === "" || appDate >= new Date(startDate);
    const matchesEnd = endDate === "" || appDate <= new Date(endDate + "T23:59:59");

    return matchesSearch && matchesStatus && matchesStart && matchesEnd;
  });

  const handleExportExcel = () => {
    const headers = ["Name", "Email", "Major", "Country", "Nationality", "Passport No.", "Graduation Year", "HS Grade", "Desired University", "Status", "Created At"];
    const rows = filteredApplications.map((app) => [
      app.fullName,
      app.email,
      app.desiredMajor,
      app.desiredCountry,
      app.nationality,
      app.passportNumber,
      app.graduationYear,
      app.highSchoolGrade,
      app.desiredUniversity,
      app.status || "Pending",
      new Date(app.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleOpenUpdate = (app: Application) => {
    setSelectedApplication(app);
    setShowUpdate(true);
  };
  const handleOpenDelete = (app: Application) => {
    setSelectedApplication(app);
    setShowDelete(true);
  };

  const handleOpenView = (app: Application) => {
    setSelectedApplication(app);
    setShowView(true);
  };

  const handleOpenAssign = (app: Application) => {
    setSelectedApplication(app);
    setShowAssign(true);
  };

  const handleOpenUpdateStatus = (app: Application, assignmentId: string | null, status: string) => {
    setSelectedApplication(app);
    setSelectedAssignmentId(assignmentId);
    setCurrentStatus(status);
    setShowUpdateStatus(true);
  };


  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-muted-foreground">Manage student applications</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Row 1: Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
            </select>
          </div>

          {/* Row 2: Status Filter + Date Range + Export Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Status Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Clear Filters */}
            {(statusFilter || startDate || endDate) && (
              <button
                onClick={() => { setStatusFilter(""); setStartDate(""); setEndDate(""); }}
                className="h-10 px-4 rounded-xl border border-input bg-background text-sm hover:bg-muted transition-colors text-muted-foreground"
              >
                Clear Filters
              </button>
            )}

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              disabled={filteredApplications.length === 0}
              className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center gap-2 transition-colors ml-auto"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>





        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border overflow-hidden max-w-full"
        >
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Major</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Country</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">University</th>
      
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={8} />
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app._id} className={`border-t border-border transition-colors ${app.is_assigned ? "bg-blue-500/10 hover:bg-blue-500/20" : "hover:bg-muted/30"}`}>
                      <td className="py-4 px-6">
                        <span className="font-medium">{app.fullName}</span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{app.email}</td>
                      <td className="py-4 px-6 text-muted-foreground">{app.desiredMajor}</td>
                      <td className="py-4 px-6 text-muted-foreground">{app.desiredCountry}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {typeof app.desiredUniversity === "object" && app.desiredUniversity !== null
                          ? (app.desiredUniversity as any).name
                          : app.desiredUniversity || "-"}
                      </td>
                     
                     
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                            <span 
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80
                                ${app.status === "Completed" ? "bg-green-100 text-green-800" : 
                                  app.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                  app.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                  app.status ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}
                                onClick={() => handleOpenUpdateStatus(app, app.assignmentId || null, app.status || "Pending")}
                            >
                                {app.status || "Pending"}
                            </span>
                        </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenView(app)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenUpdate(app)}
                            title="Update Status"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenAssign(app)}
                            title="Assign to Employee"
                          >
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleOpenDelete(app)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                       {isError ? (
                          <div className="flex flex-col items-center gap-2">
                            <span>
                              {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.data?.message || 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.message || 
                                "Failed to load applications."
                              }
                            </span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : (
                         "No applications found"
                       )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {applications.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {filteredApplications.length} results
            </p>
            <div className="order-1 sm:order-2">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.numberOfPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateApplicationModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdateApplicationStatusModal 
          open={showUpdate} 
          application={selectedApplication} 
          onClose={() => setShowUpdate(false)} 
        />
        <DeleteApplicationModal 
          open={showDelete} 
          application={selectedApplication} 
          onClose={() => setShowDelete(false)} 
        />
        <ViewApplicationModal 
          open={showView} 
          application={selectedApplication} 
          onClose={() => setShowView(false)} 
        />
        <AssignApplicationModal
          open={showAssign}
          application={selectedApplication}
          onClose={() => setShowAssign(false)}
        />
        {showUpdateStatus && (
            <UpdateAssignmentStatusModal
                open={showUpdateStatus}
                assignmentId={selectedAssignmentId}
                itemId={selectedApplication?._id}
                itemType="Application"
                currentStatus={currentStatus}
                onClose={() => setShowUpdateStatus(false)}
            />
        )}
      </div>
    </DashboardLayout>
  );
}
