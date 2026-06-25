import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../UI/Button";
import { type Course, useDeleteCourseMutation } from "../../app/services/crudCourse";
import { useToast } from "../../hooks/use-toast";

interface DeleteCourseModalProps {
  open: boolean;
  course: Course | null;
  onClose: () => void;
}

export function DeleteCourseModal({
  open,
  course,
  onClose,
}: DeleteCourseModalProps) {
  const { toast } = useToast();
  const [deleteCourse, { isLoading }] = useDeleteCourseMutation();

  if (!open || !course) return null;

  const handleDelete = async () => {
    try {
      await deleteCourse(course._id).unwrap();
      toast({
        title: "Course deleted",
        description: `Course ${course.title} has been deleted.`,
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description:
          error?.data?.message || "Could not delete the course. Please try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-2xl bg-background border border-border shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Course
            </h2>
            <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{course.title}</span>?
            This action cannot be undone.
          </p>
        </div>

         <div className="flex justify-end gap-2 p-4 bg-muted/20">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Course"}
            </Button>
        </div>
      </motion.div>
    </div>
  );
}
