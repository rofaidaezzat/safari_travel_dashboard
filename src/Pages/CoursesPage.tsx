import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { Pagination } from "../Components/Pagination";
import { useGetCoursesQuery, type Course } from "../app/services/crudCourse";
import { useGetUniversitiesQuery } from "../app/services/crudUniversity";
import { CreateCourseModal } from "../Components/CourseModal/CreateCourse";
import { UpdateCourseModal } from "../Components/CourseModal/UpdateCourse";
import { DeleteCourseModal } from "../Components/CourseModal/DeleteCourse";
import { TableSkeleton } from "../Components/UI/TableSkeleton";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [universityFilter, setUniversityFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetCoursesQuery({ page, limit: 10, sort }, { refetchOnMountOrArgChange: true });
  const { data: universitiesData } = useGetUniversitiesQuery({ limit: 1000 }, { refetchOnMountOrArgChange: true });

  const courses = data?.data.courses || [];
  const universitiesList = universitiesData?.data?.universities || [];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (!universityFilter) return true;

    // Check if course belongs to the selected university
    return course.universities && course.universities.some(
      (u: any) => (typeof u === "string" ? u : u._id) === universityFilter
    );
  });

  const handleOpenUpdate = (course: Course) => {
    setSelectedCourse(course);
    setShowUpdate(true);
  };

  const handleOpenDelete = (course: Course) => {
    setSelectedCourse(course);
    setShowDelete(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Courses</h1>
            <p className="text-muted-foreground">Manage courses and associate them with universities</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by title, description, or tags..."
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
          <select
            value={universityFilter}
            onChange={(e) => { setUniversityFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Universities</option>
            {universitiesList.map((uni) => (
              <option key={uni._id} value={uni._id}>{uni.name}</option>
            ))}
          </select>
          {universityFilter && (
            <button
              onClick={() => setUniversityFilter("")}
              className="h-10 px-3 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground w-1/4">Title</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground w-1/3">Description</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Tags</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Universities</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={5} />
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-foreground">{course.title}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">
                        {course.description}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {course.tags && course.tags.length > 0 ? (
                            course.tags.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {course.universities && course.universities.length > 0 ? (
                            course.universities.map((uni: any, idx) => (
                              <span key={idx} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${universityFilter && (typeof uni === "string" ? uni : uni._id) === universityFilter ? "bg-primary/20 text-primary font-medium" : "bg-muted text-muted-foreground"}`}>
                                {uni.name || uni}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenUpdate(course)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => handleOpenDelete(course)}
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
                            <span>
                              {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.data?.message || 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.message || 
                                "Failed to load courses."
                              }
                            </span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : universityFilter ? (
                         "No courses found for the selected university"
                       ) : (
                         "No courses found"
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
                    Showing {filteredCourses.length} results
                    {universityFilter && (
                      <span className="ml-1 text-primary font-medium">
                        · filtered by {universitiesList.find(u => u._id === universityFilter)?.name}
                      </span>
                    )}
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

        <CreateCourseModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdateCourseModal 
          open={showUpdate} 
          course={selectedCourse} 
          onClose={() => setShowUpdate(false)} 
        />
        <DeleteCourseModal 
          open={showDelete} 
          course={selectedCourse} 
          onClose={() => setShowDelete(false)} 
        />
      </div>
    </DashboardLayout>
  );
}

