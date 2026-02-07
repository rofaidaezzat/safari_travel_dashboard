import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { Pagination } from "../Components/Pagination";
import { useGetLeadsQuery, type Lead } from "../app/services/crudLead";
import { CreateLeadModal } from "../Components/LeadModal/CreateLead";
import { UpdateLeadStatusModal } from "../Components/LeadModal/UpdateLeadStatus";
import { DeleteLeadModal } from "../Components/LeadModal/DeleteLead";
import { ViewLeadModal } from "../Components/LeadModal/ViewLead";
import { TableSkeleton } from "../Components/UI/TableSkeleton";

export default function LeadPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetLeadsQuery({ page, limit: 10, sort });

  const leads = data?.data.leads || [];

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const handleOpenUpdate = (lead: Lead) => {
    setSelectedLead(lead);
    setShowUpdate(true);
  };

  const handleOpenDelete = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDelete(true);
  };

  const handleOpenView = (lead: Lead) => {
    setSelectedLead(lead);
    setShowView(true);
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-500/10 text-blue-500";
      case "Contacted":
        return "bg-yellow-500/10 text-yellow-500";
      case "Closed":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground">Manage your leads and prospects</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Leads
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={6} />
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-medium">{lead.name}</span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{lead.email}</td>
                      <td className="py-4 px-6 text-muted-foreground">{lead.phone}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenView(lead)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenUpdate(lead)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleOpenDelete(lead)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                       {isError ? (
                          <div className="flex flex-col items-center gap-2">
                            <span>
                              {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.data?.message || 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.message || 
                                "Failed to load leads."
                              }
                            </span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : (
                         "No leads found"
                       )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {filteredLeads.length} results
            </p>
            <div className="order-1 sm:order-2">
              <Pagination
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.numberOfPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateLeadModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdateLeadStatusModal 
          open={showUpdate} 
          lead={selectedLead} 
          onClose={() => setShowUpdate(false)} 
        />
        <DeleteLeadModal 
          open={showDelete} 
          lead={selectedLead} 
          onClose={() => setShowDelete(false)} 
        />
        <ViewLeadModal 
          open={showView} 
          lead={selectedLead} 
          onClose={() => setShowView(false)} 
        />
      </div>
    </DashboardLayout>
  );
}
