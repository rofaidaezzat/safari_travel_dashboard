import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "../UI/Button";
import { useDeleteBlogMutation, type Blog } from "../../app/services/crudBlog";
import { useToast } from "../../hooks/use-toast";

interface DeleteBlogModalProps {
  open: boolean;
  blog: Blog | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteBlogModal({ open, blog, onClose, onDeleted }: DeleteBlogModalProps) {
  const { toast } = useToast();
  const [deleteBlog, { isLoading }] = useDeleteBlogMutation();

  if (!open || !blog) return null;

  const handleDelete = async () => {
    try {
      await deleteBlog(blog._id).unwrap();
      toast({
        title: "Blog deleted",
        description: `Blog post deleted successfully.`,
      });
      onClose();
      onDeleted?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error?.data?.message || "Could not delete blog post.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl bg-background border border-border shadow-xl p-6"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Delete Blog Post?</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">"{blog.title}"</span>? 
              This action cannot be undone.
            </p>
          </div>

          <div className="flex w-full gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
