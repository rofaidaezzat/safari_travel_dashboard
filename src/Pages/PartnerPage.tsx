import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { useGetPartnersQuery, type Partner } from "../app/services/crudPartner";
import { CreatePartnerModal } from "../Components/PartnerModal/CreatePartner";
import { UpdatePartnerModal } from "../Components/PartnerModal/UpdatePartner";
import { DeletePartnerModal } from "../Components/PartnerModal/DeletePartner";
import { Pagination } from "../Components/Pagination";
import { TableSkeleton } from "../Components/UI/TableSkeleton";

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetPartnersQuery({ page, limit: 10, sort });

  const partners = data?.data.partners || [];

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenUpdate = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowUpdate(true);
  };

  const handleOpenDelete = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowDelete(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Partners</h1>
            <p className="text-muted-foreground">Manage your partners and universities</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners..."
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Website</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={4} />
                ) : filteredPartners.length > 0 ? (
                  filteredPartners.map((partner) => (
                    <tr key={partner._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {partner.logo && (
                             <img 
                               src={partner.logo.startsWith('http') ? partner.logo : `https://lavishly-fogless-sang.ngrok-free.dev/${partner.logo}`} 
                               alt={partner.name} 
                               className="h-8 w-8 rounded-full object-cover" 
                             />
                          )}
                          <span className="font-medium">{partner.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{partner.type}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        <a href={partner.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                          {partner.website}
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenUpdate(partner)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleOpenDelete(partner)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                       {isError ? (
                          <div className="flex flex-col items-center gap-2">
                            <span>
                              {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.data?.message || 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.message || 
                                "Failed to load partners."
                              }
                            </span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : (
                         "No partners found"
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
                    Showing {filteredPartners.length} results
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

        
        <CreatePartnerModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdatePartnerModal 
          open={showUpdate} 
          partner={selectedPartner} 
          onClose={() => setShowUpdate(false)} 
        />
        <DeletePartnerModal 
          open={showDelete} 
          partner={selectedPartner} 
          onClose={() => setShowDelete(false)} 
        />
      </div>
    </DashboardLayout>
  );
}
