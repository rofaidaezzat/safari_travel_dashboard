import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { Pagination } from "../Components/Pagination";
import { useGetUniversitiesQuery, type University } from "../app/services/crudUniversity";
import { CreateUniversityModal } from "../Components/UniversityModal/CreateUniversity";
import { UpdateUniversityModal } from "../Components/UniversityModal/UpdateUniversity";
import { DeleteUniversityModal } from "../Components/UniversityModal/DeleteUniversity";
import { ViewUniversityModal } from "../Components/UniversityModal/ViewUniversity";
import { TableSkeleton } from "../Components/UI/TableSkeleton";
import { useGetCoursesQuery } from "../app/services/crudCourse";

export default function UniversityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetUniversitiesQuery({ page, limit: 10, sort });
  const { data: coursesData } = useGetCoursesQuery({ limit: 100 });
  
  const universities = data?.data.universities || [];
  const coursesList = coursesData?.data?.courses || [];

  const getCoursesForUniversity = (uniId: string, uniCourses?: string[]) => {
    if (uniCourses && uniCourses.length > 0) {
      return coursesList.filter(c => uniCourses.includes(c._id));
    }
    return coursesList.filter(c => 
      c.universities && c.universities.some(u => typeof u === "string" ? u === uniId : u._id === uniId)
    );
  };

  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenUpdate = (uni: University) => {
    setSelectedUniversity(uni);
    setShowUpdate(true);
  };

  const handleOpenDelete = (uni: University) => {
    setSelectedUniversity(uni);
    setShowDelete(true);
  };

   const handleOpenView = (uni: University) => {
    setSelectedUniversity(uni);
    setShowView(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Universities</h1>
            <p className="text-muted-foreground">Manage universities and programs</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add University
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search universities..."
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Image</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Country</th>
                   <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Fees</th>
                   <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Programs</th>
                   <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Courses</th>
                   <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                 {isLoading ? (
                   <TableSkeleton columns={7} />
                ) : filteredUniversities.length > 0 ? (
                  filteredUniversities.map((uni) => (
                    <tr key={uni._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                          {uni.images && uni.images.length > 0 ? (
                            <img 
                              src={uni.images[0]} 
                              alt={uni.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No img</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                           <span className="font-medium">{uni.name}</span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{uni.country}</td>
                       <td className="py-4 px-6 text-muted-foreground">{uni.fees}</td>
                       <td className="py-4 px-6 text-muted-foreground">
                           {uni.programs?.length ?? 0} Programs
                       </td>
                       <td className="py-4 px-6 text-muted-foreground">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {getCoursesForUniversity(uni._id, uni.courses).length > 0 ? (
                              getCoursesForUniversity(uni._id, uni.courses).map((course, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {course.title}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                       </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenView(uni)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenUpdate(uni)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleOpenDelete(uni)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr>
                     <td colSpan={7} className="py-8 text-center text-muted-foreground">
                       {isError ? (
                          <div className="flex flex-col items-center gap-2">
                            <span>
                              {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.data?.message || 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.message || 
                                "Failed to load universities."
                              }
                            </span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : (
                         "No universities found"
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
                    Showing {filteredUniversities.length} results
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

        {/* Modals will be added here */}
        <CreateUniversityModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdateUniversityModal 
          open={showUpdate} 
          university={selectedUniversity} 
          onClose={() => setShowUpdate(false)} 
        />
        <DeleteUniversityModal 
          open={showDelete} 
          university={selectedUniversity} 
          onClose={() => setShowDelete(false)} 
        />
        <ViewUniversityModal 
          open={showView} 
          id={selectedUniversity?._id || null} 
          onClose={() => setShowView(false)} 
        />
      </div>
    </DashboardLayout>
  );
}
