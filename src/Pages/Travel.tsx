import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye, MapPin, UserPlus } from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { useGetTravelsQuery, type Travel as TravelType } from "../app/services/crudTravel";
import { useGetMyAssignmentsQuery } from "../app/services/crudAssignment";
import { Pagination } from "../Components/Pagination";
import { CreateTravelModal } from "../Components/TravelModal/CreateTravel";
import { UpdateTravelModal } from "../Components/TravelModal/UpdateTravel";
import { DeleteTravelModal } from "../Components/TravelModal/DeleteTravel";
import { ViewTravelModal } from "../Components/TravelModal/ViewTravel";
import { AssignTravelModal } from "../Components/TravelModal/AssignTravel";
import { UpdateAssignmentStatusModal } from "../Components/UpdateAssignmentStatusModal";
import { TableSkeleton } from "../Components/UI/TableSkeleton";

interface TravelWithAssignment extends TravelType {
  assignmentId?: string;
  assignmentStatus?: string;
}

const Travel = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("");
  
  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [selectedTravel, setSelectedTravel] = useState<TravelType | null>(null);

  // Assignment Status Update State
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");

  const role = localStorage.getItem("role");
  const isEmployee = role === "Employee";

  // Fetch all travels (for Admin)
  const { data: allTravelsData, isLoading: isLoadingTravels, isError: isTravelsError, refetch: refetchTravels } = useGetTravelsQuery({
    page,
    limit: 10,
    search: searchTerm,
    type: filterType,
    sort: sortOrder
  }, { skip: isEmployee, refetchOnMountOrArgChange: true });

  // Fetch assigned travels (for Employee)
  const { data: assignmentsData, isLoading: isLoadingAssign, isError: isAssignError, refetch: refetchAssign } = useGetMyAssignmentsQuery(
    { page, limit: 10 },
    { skip: !isEmployee, refetchOnMountOrArgChange: true }
  );

  let travels: TravelWithAssignment[] = [];
  let pagination = { currentPage: 1, numberOfPages: 1, limit: 10 };
  let isLoading = false;
  let isError = false;
  let refetch = () => {};

  if (isEmployee) {
    const assignedTravels = assignmentsData?.data.assignments
      .filter((item) => item.item_type === "Travel" && item.item_id)
      .map((item) => {
          const travel = item.item_id as TravelType;
          return { ...travel, status: item.status, assignmentId: item._id, assignmentStatus: item.status };
      }) || [];
    
    // Client-side filtering for employee assignments if needed, 
    // though the requirement implies just showing assigned items.
    // We can apply search/filter locally if the API doesn't support it for assignments yet.
    travels = assignedTravels.filter(t => {
        if (searchTerm && !t.fullname.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterType !== "all" && t.type !== filterType) return false;
        return true;
    });

    pagination = assignmentsData?.pagination || { currentPage: 1, numberOfPages: 1, limit: 10 };
    isLoading = isLoadingAssign;
    isError = isAssignError;
    refetch = refetchAssign;
  } else {
    // For Admin, use travels directly as they now contain status and assignment info
    travels = allTravelsData?.data.travels.map(travel => ({
        ...travel,
        // use local status if available, fallback to "Pending"
        assignmentStatus: travel.status
    })) ?? [];

    pagination = allTravelsData?.pagination || { currentPage: 1, numberOfPages: 1, limit: 10 };
    isLoading = isLoadingTravels;
    isError = isTravelsError;
    refetch = refetchTravels;
  }


  const handleOpenUpdate = (travel: TravelType) => {
    setSelectedTravel(travel);
    setShowUpdate(true);
  };

  const handleOpenDelete = (travel: TravelType) => {
    setSelectedTravel(travel);
    setShowDelete(true);
  };

  const handleOpenView = (travel: TravelType) => {
    setSelectedTravel(travel);
    setShowView(true);
  };

  const handleOpenAssign = (travel: TravelType) => {
    setSelectedTravel(travel);
    setShowAssign(true);
  };

  const handleOpenUpdateStatus = (travel: TravelType, assignmentId: string | null, status: string) => {
    setSelectedTravel(travel);
    setSelectedAssignmentId(assignmentId);
    setCurrentStatus(status);
    setShowUpdateStatus(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Travel Packages</h1>
            <p className="text-muted-foreground">Manage travel destinations and packages</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            type="button"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <select
                className="h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filterType}
                onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1); // Reset page on filter change
                }}
            >
                <option value="all">All Types</option>
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
                <option value="package">Package</option>
            </select>
            <select
                className="h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={sortOrder}
                onChange={(e) => {
                    setSortOrder(e.target.value);
                    setPage(1); // Reset page on sort change
                }}
            >
                <option value="">Default Sort</option>
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="date">Travel Date (Earliest)</option>
                <option value="-date">Travel Date (Latest)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border overflow-hidden max-w-full"
        >
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Full Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Trip</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Passengers</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={7} />
                ) : travels.length > 0 ? (
                    travels.map((travel) => (
                    <tr
                      key={travel._id}
                      className={`border-t border-border transition-colors ${travel.is_assigned ? "bg-blue-500/10 hover:bg-blue-500/20" : "hover:bg-muted/30"}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                            <span className="font-medium">{travel.fullname}</span>
                            <span className="text-xs text-muted-foreground">{travel.phonenumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {travel.from} <span className="text-xs px-1">→</span> {travel.to}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {new Date(travel.date).toLocaleDateString()}
                      </td>
                       <td className="py-4 px-6 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                            {travel.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                            <span 
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80
                                ${travel.status === "Completed" ? "bg-green-100 text-green-800" : 
                                  travel.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                  travel.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                  travel.status ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}
                                onClick={() => handleOpenUpdateStatus(travel, travel.assignmentId || null, travel.status || "Pending")}
                            >
                                {travel.status || "Pending"}
                            </span>
                        </td>
                       <td className="py-4 px-6 text-sm text-muted-foreground">
                        {travel.passengers?.adults} Adults, {travel.passengers?.children} Kids
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenView(travel)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenUpdate(travel)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          {!isEmployee && (
                              <button
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              onClick={() => handleOpenAssign(travel)}
                              title="Assign to Employee"
                              >
                              <UserPlus className="h-4 w-4 text-muted-foreground" />
                              </button>
                          )}
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleOpenDelete(travel)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                       {isError ? (
                          <div className="flex flex-col items-center gap-2">
                            <span>Failed to load travels.</span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : (
                         "No travel packages found"
                       )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {travels.length > 0 && (
           <Pagination
             currentPage={pagination.currentPage}
             totalPages={pagination.numberOfPages}
             onPageChange={(p) => setPage(p)}
             totalItems={pagination.limit * pagination.numberOfPages} // Approximated
             itemsPerPage={pagination.limit}
           />
        )}

        {/* Modals */}
        <CreateTravelModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdateTravelModal
          open={showUpdate}
          travel={selectedTravel}
          onClose={() => setShowUpdate(false)}
        />
        <DeleteTravelModal
          open={showDelete}
          travel={selectedTravel}
          onClose={() => setShowDelete(false)}
        />
        <ViewTravelModal
          open={showView}
          id={selectedTravel?._id || null}
          onClose={() => setShowView(false)}
        />
        {showAssign && (
            <AssignTravelModal
                open={showAssign}
                travel={selectedTravel}
                onClose={() => setShowAssign(false)}
            />
        )}
        {showUpdateStatus && (
            <UpdateAssignmentStatusModal
                open={showUpdateStatus}
                assignmentId={selectedAssignmentId}
                itemId={selectedTravel?._id}
                itemType="Travel"
                currentStatus={currentStatus}
                onClose={() => setShowUpdateStatus(false)}
            />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Travel;
