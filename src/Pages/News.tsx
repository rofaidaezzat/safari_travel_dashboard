import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye, Tag, User, Calendar } from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { useGetNewsQuery, type News as NewsType } from "../app/services/crudNews";
import { Pagination } from "../Components/Pagination";
import { CreateNewsModal } from "../Components/NewsModal/CreateNews";
import { UpdateNewsModal } from "../Components/NewsModal/UpdateNews";
import { DeleteNewsModal } from "../Components/NewsModal/DeleteNews";
import { ViewNewsModal } from "../Components/NewsModal/ViewNews";
import { TableSkeleton } from "../Components/UI/TableSkeleton";

const NewsPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsType | null>(null);

  const { data, isLoading, isError, refetch } = useGetNewsQuery({
    page,
    limit: 10,
    search: searchTerm,
  });

  const newsList = data?.data.news ?? [];

  const handleOpenUpdate = (news: NewsType) => {
    setSelectedNews(news);
    setShowUpdate(true);
  };

  const handleOpenDelete = (news: NewsType) => {
    setSelectedNews(news);
    setShowDelete(true);
  };

  const handleOpenView = (news: NewsType) => {
    setSelectedNews(news);
    setShowView(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">News Management</h1>
            <p className="text-muted-foreground">Create and manage news articles</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            type="button"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add News
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Article</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Tags</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Author</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Created At</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={5} />
                ) : newsList.length > 0 ? (
                    newsList.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {item.coverImage ? (
                                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                                )}
                            </div>
                            <span className="font-medium line-clamp-1 max-w-[200px]">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex flex-wrap gap-1">
                            {item.tags && item.tags.length > 0 ? (
                                <>
                                    {item.tags.slice(0, 2).map((tag: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground flex items-center gap-1">
                                            <Tag className="w-2 h-2" /> {tag}
                                        </span>
                                    ))}
                                    {item.tags.length > 2 && <span className="text-xs text-muted-foreground">+{item.tags.length - 2}</span>}
                                </>
                            ) : (
                                <span className="text-muted-foreground text-xs">No tags</span>
                            )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2 font-medium">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {item.author}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenView(item)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenUpdate(item)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => handleOpenDelete(item)}
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
                            <span>Failed to load news.</span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : (
                         "No news articles found"
                       )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {newsList.length} results
            </p>
            <div className="order-1 sm:order-2">
              <Pagination
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.numberOfPages > 0 ? data.pagination.numberOfPages : Math.ceil(data.results / data.pagination.limit) || 1}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateNewsModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdateNewsModal
          open={showUpdate}
          news={selectedNews}
          onClose={() => setShowUpdate(false)}
        />
        <DeleteNewsModal
          open={showDelete}
          news={selectedNews}
          onClose={() => setShowDelete(false)}
        />
        <ViewNewsModal
          open={showView}
          id={selectedNews?._id || null}
          onClose={() => setShowView(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default NewsPage;
