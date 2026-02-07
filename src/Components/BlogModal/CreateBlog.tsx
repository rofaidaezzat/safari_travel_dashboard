import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { useCreateBlogMutation } from "../../app/services/crudBlog";
import { useToast } from "../../hooks/use-toast";

interface CreateBlogModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateBlogModal({ open, onClose }: CreateBlogModalProps) {
  const { toast } = useToast();
  const [createBlog, { isLoading }] = useCreateBlogMutation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    const newErrors: Record<string, string> = {};
    if (!title) newErrors.title = "Title is required";
    if (!content) newErrors.content = "Content is required";
    if (!author) newErrors.author = "Author is required";
    if (!coverImage) newErrors.coverImage = "Cover image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("author", author);
      
      // Process tags (comma separated)
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
      tagsArray.forEach((tag) => formData.append("tags[]", tag));
       
      if (coverImage) formData.append("coverImage", coverImage);

      await createBlog(formData).unwrap();
      
      toast({
        title: "Blog created",
        description: `Blog post "${title}" created successfully.`,
      });
      
      // Reset form
      setTitle("");
      setContent("");
      setAuthor("");
      setTags("");
      setCoverImage(null);
      setPreview(null);
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: error?.data?.message || "Could not create blog post.",
      });
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
          <h2 className="text-lg font-semibold">Create Blog Post</h2>
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
              placeholder="Blog Title"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Author</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author Name"
              />
              {errors.author && <p className="text-red-500 text-xs">{errors.author}</p>}
            </div>
             <div className="space-y-1">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tech, news, update"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Content</label>
            <textarea
              className="w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full blog content..."
            />
            {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Cover Image</label>
            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${preview ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="blog-image-upload"
                onChange={handleImageChange}
              />
              <label htmlFor="blog-image-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                {preview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4" /> Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Click to upload image</span>
                  </div>
                )}
              </label>
            </div>
             {errors.coverImage && <p className="text-red-500 text-xs">{errors.coverImage}</p>}
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
              {isLoading ? "Creating..." : "Create Blog"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
