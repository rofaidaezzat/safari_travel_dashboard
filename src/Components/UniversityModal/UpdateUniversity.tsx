import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { Button } from "../UI/Button";
import { type University, useUpdateUniversityMutation } from "../../app/services/crudUniversity";
import { updateUniversitySchema } from "../../validation/schemas";
import { ValidationError } from "yup";
import { useToast } from "../../hooks/use-toast";

interface UpdateUniversityModalProps {
  open: boolean;
  university: University | null;
  onClose: () => void;
}

interface ImageWithIndex {
  url: string;
  originalIndex: number;
}

export function UpdateUniversityModal({
  open,
  university,
  onClose,
}: UpdateUniversityModalProps) {
  const { toast } = useToast();
  const [updateUniversity, { isLoading: isUpdating }] = useUpdateUniversityMutation();
  
  const isLoading = isUpdating;

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [fees, setFees] = useState("");
  const [description, setDescription] = useState("");
  const [admissionRequirements, setAdmissionRequirements] = useState("");
  const [programs, setPrograms] = useState("");
  
  // State to track existing images with their original server-side index
  const [existingImages, setExistingImages] = useState<ImageWithIndex[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (university) {
      setName(university.name);
      setCountry(university.country);
      setFees(university.fees);
      setDescription(university.description);
      setAdmissionRequirements(university.admissionRequirements);
      setPrograms(university.programs?.join(", ") || "");
      
      // Map images to include their original index
      const imagesWithIndices = (university.images || []).map((url, index) => ({
        url,
        originalIndex: index
      }));
      setExistingImages(imagesWithIndices);
      
      setImagesToDelete([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    }
  }, [university]);

  if (!open || !university) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...newImageFiles, ...files];
      setNewImageFiles(newFiles);

      const newPreviews: string[] = [];
      let processed = 0;
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          processed++;
          if (processed === files.length) {
            setNewImagePreviews([...newImagePreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeExistingImage = (index: number) => {
    const imageToDelete = existingImages[index];
    // Add the original index to the deletion list
    setImagesToDelete([...imagesToDelete, imageToDelete.originalIndex]);
    
    // Remove from UI
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const removeNewImage = (index: number) => {
    const newFiles = [...newImageFiles];
    newFiles.splice(index, 1);
    setNewImageFiles(newFiles);

    const newPreviews = [...newImagePreviews];
    newPreviews.splice(index, 1);
    setNewImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const programsArray = programs.split(",").map(p => p.trim()).filter(p => p);

      await updateUniversitySchema.validate({
        name,
        country,
        fees,
        description,
        admissionRequirements,
        programs: programsArray,
        imagesToDelete
      }, { abortEarly: false });
      setErrors({});

      const formData = new FormData();
      formData.append("name", name);
      formData.append("country", country);
      formData.append("fees", fees);
      formData.append("description", description);
      formData.append("admissionRequirements", admissionRequirements);
      
      // Append programs array
      programsArray.forEach(program => {
        formData.append("programs[]", program);
      });

      // Append images to delete (indices)
      imagesToDelete.forEach((originalIndex, i) => {
        // user requested "imagesToDelete[0] must be a number"
        // so we append keys like imagesToDelete[0], imagesToDelete[1]
        // or just 'imagesToDelete[]' depending on backend.
        // The error said "imagesToDelete[0] must be a number", implying indexed array logic or just standard array parsing.
        // Standard FormData array usually uses key w/ brackets: name[] or name[i]
        // Given previous request for images[i], let's try imagesToDelete[i] 
        formData.append(`imagesToDelete[${i}]`, originalIndex.toString());
      });

      // Append new images
      if (newImageFiles.length > 0) {
        newImageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      // 1. Update details and images
      await updateUniversity({
        id: university._id,
        body: formData,
      }).unwrap();

      toast({
        title: "University updated",
        description: `University ${name} has been updated successfully.`,
      });
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
            title: "Update failed",
            description:
            error?.data?.message || "Could not update the university. Please try again.",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">Update University</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="University Name"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Images</label>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {/* Existing Images */}
                {existingImages.map((imgObj, index) => (
                  <div key={`existing-${imgObj.originalIndex}`} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted/30 group">
                    <img
                      src={imgObj.url}
                      alt={`Existing ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {/* New Image Previews */}
                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted/30 group">
                    <img
                      src={preview}
                      alt={`New Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-md border-2 border-dashed border-input bg-background hover:bg-muted/50 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Add more images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium">Country</label>
                <Select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="" disabled>Select a country</option>
                  {["All", "UK", "Canada", "USA", "Turkey", "Malaysia", "Uzbekistan", "Tajikistan"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
            </div>
             <div className="space-y-1">
                <label className="text-sm font-medium">Fees</label>
                <Input
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="e.g. 5000$"
                />
                {errors.fees && <p className="text-red-500 text-xs">{errors.fees}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description..."
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Admission Requirements</label>
             <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={admissionRequirements}
              onChange={(e) => setAdmissionRequirements(e.target.value)}
              placeholder="e.g. High school diploma..."
            />
            {errors.admissionRequirements && <p className="text-red-500 text-xs">{errors.admissionRequirements}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Programs (comma separated)</label>
            <Input
              value={programs}
              onChange={(e) => setPrograms(e.target.value)}
              placeholder="Engineering, Medicine, Law..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 pb-4">
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
