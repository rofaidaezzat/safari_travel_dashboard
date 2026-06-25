import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { useCreateCourseMutation } from "../../app/services/crudCourse";
import { useGetUniversitiesQuery } from "../../app/services/crudUniversity";
import { createCourseSchema } from "../../validation/schemas";
import { ValidationError } from "yup";
import { useToast } from "../../hooks/use-toast";

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCourseModal({
  open,
  onClose,
}: CreateCourseModalProps) {
  const { toast } = useToast();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const { data: universitiesData } = useGetUniversitiesQuery({ limit: 100 });
  const universities = universitiesData?.data.universities || [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState(""); // comma separated
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleUniversityToggle = (id: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t);
      
      await createCourseSchema.validate({
        title,
        description,
        tags: tagsArray,
        universities: selectedUniversities,
      }, { abortEarly: false });
      setErrors({});

      await createCourse({
        title,
        description,
        tags: tagsArray,
        universities: selectedUniversities,
      }).unwrap();

      toast({
        title: "Course created",
        description: `Course ${title} has been created successfully.`,
      });

      // Reset
      setTitle("");
      setDescription("");
      setTags("");
      setSelectedUniversities([]);
      onClose();
    } catch (error: any) {
      if (error instanceof ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
           if (err.path) newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        toast({
            variant: "destructive",
            title: "Creation failed",
            description:
            error?.data?.message || "Could not create the course. Please try again.",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">Add Course</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course Title (e.g. General Chemistry I)"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Introduction to basic principles..."
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="chemistry, science, freshman"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Belongs to Universities</label>
            <div className="border border-border rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 bg-muted/10">
              {universities.length > 0 ? (
                universities.map((uni) => (
                  <label key={uni._id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedUniversities.includes(uni._id)}
                      onChange={() => handleUniversityToggle(uni._id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>{uni.name} <span className="text-xs text-muted-foreground">({uni.country})</span></span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No universities found</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-primary hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
