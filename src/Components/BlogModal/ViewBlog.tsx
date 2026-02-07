import { motion } from "framer-motion";
import { X, User, Calendar, Tag } from "lucide-react";
import { useGetBlogByIdQuery } from "../../app/services/crudBlog";

interface ViewBlogModalProps {
    open: boolean;
    id: string | null;
    onClose: () => void;
  }
  
  export function ViewBlogModal({ open, id, onClose }: ViewBlogModalProps) {
    const { data: blog, isLoading } = useGetBlogByIdQuery(id || "", {
      skip: !id,
    });
  
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl rounded-2xl bg-background border border-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading details...</div>
          ) : blog ? (
            <>
              {/* Header Image */}
              <div className="relative h-64 w-full bg-muted flex-shrink-0">
                {blog.coverImage ? (
                  <img 
                    src={blog.coverImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No Image Available
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
  
              {/* Content */}
              <div className="p-8 overflow-y-auto">
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {blog.author}
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                           <Tag className="h-3 w-3" /> {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-3xl font-bold mb-4">{blog.title}</h2>
                </div>
  
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{blog.content}</p>
                </div>
              </div>

               <div className="bg-muted/50 p-4 border-t border-border flex justify-end">
                    <button
                        className="px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted text-foreground text-sm font-medium transition-colors"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </>
          ) : (
             <div className="p-8 text-center text-muted-foreground">Blog post not found.</div>
          )}
        </motion.div>
      </div>
    );
  }
