import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { useCreatePartnerMutation } from "../../app/services/crudPartner";
import { createPartnerSchema } from "../../validation/schemas";
import { ValidationError } from "yup";
import { useToast } from "../../hooks/use-toast";

interface CreatePartnerModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePartnerModal({
  open,
  onClose,
}: CreatePartnerModalProps) {
  const { toast } = useToast();
  const [createPartner, { isLoading }] = useCreatePartnerMutation();

  const [name, setName] = useState("");
  const [logo, setLogo] = useState(""); // URL or path
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [website, setWebsite] = useState("");
  const [type, setType] = useState("University");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // TODO: Upload file to server and get URL
      // For now, we'll use the file name as placeholder
      setLogo(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPartnerSchema.validate({ name, website, type }, { abortEarly: false });
      setErrors({});

      const formData = new FormData();
      formData.append("name", name);
      formData.append("website", website);
      formData.append("type", type);
      if (logoFile) {
          formData.append("logo", logoFile);
      }

      await createPartner(formData).unwrap();
      toast({
        title: "Partner created",
        description: `Partner ${name} has been created successfully.`,
      });
      // Reset form
      setName("");
      setLogo("");
      setLogoFile(null);
      setLogoPreview("");
      setWebsite("");
      setType("University");
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
            error?.data?.message || "Could not create the partner. Please try again.",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Add Partner</h2>
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
              placeholder="Partner Name"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Logo</label>
            <div className="flex flex-col gap-3">
              {logoPreview && (
                <div className="relative w-full h-32 rounded-lg border-2 border-border overflow-hidden bg-muted/30">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-md border-2 border-dashed border-input bg-background hover:bg-muted/50 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {logoFile ? logoFile.name : "Choose logo image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
            {/* Note: The backend schema says option, but frontend code strictly enforced it before. 
                Validation schema assumes optional, but we can enforce logic here if needed. 
                For now we rely on the schema which says optional. */ }
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Website</label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://partner.com"
            />
            {errors.website && <p className="text-red-500 text-xs">{errors.website}</p>}
          </div>

           <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="University">University</option>
              <option value="Company">Company</option>
              <option value="Organization">Organization</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
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
              {isLoading ? "Creating..." : "Create Partner"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
