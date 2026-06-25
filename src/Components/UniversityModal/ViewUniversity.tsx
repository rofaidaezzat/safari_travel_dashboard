import { motion } from "framer-motion";
import { X, MapPin, DollarSign, BookOpen, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "../UI/Button";
import { useGetUniversityByIdQuery } from "../../app/services/crudUniversity";

interface ViewUniversityModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function ViewUniversityModal({ open, id, onClose }: ViewUniversityModalProps) {
  const { data: university, isLoading, error } = useGetUniversityByIdQuery(id ?? "", {
    skip: !id,
  });

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">University Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <p className="font-medium text-destructive">Failed to load university data</p>
              <p className="text-xs text-muted-foreground">
                {(error as any)?.data?.message || "Something went wrong"}
              </p>
            </div>
          ) : university ? (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <div className="text-lg font-semibold">{university.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Country
                        </label>
                        <div className="p-2 bg-muted/30 rounded-md border border-border text-sm">
                            {university.country}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Fees
                        </label>
                        <div className="p-2 bg-muted/30 rounded-md border border-border text-sm">
                            {university.fees}
                        </div>
                     </div>
                  </div>
              </div>

               {/* Description */}
              <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Description
                 </label>
                 <div className="p-3 bg-muted/30 rounded-lg border border-border text-sm leading-relaxed min-h-[60px]">
                    {university.description}
                 </div>
              </div>

               {/* Programs */}
              <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Programs
                 </label>
                 <div className="flex flex-wrap gap-2">
                    {university.programs && university.programs.length > 0 ? (
                        university.programs.map((program, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20">
                                {program}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-muted-foreground italic">No programs listed</span>
                    )}
                 </div>
              </div>

               {/* Images */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Images
                 </label>
                 {university.images && university.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {university.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted/30">
                                <img 
                                    src={img} 
                                    alt={`${university.name} ${idx + 1}`} 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border text-sm italic text-muted-foreground">
                        No images available
                    </div>
                 )}
              </div>

               {/* Admission Requirements */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground">Admission Requirements</label>
                 <div className="p-3 bg-muted/30 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap">
                    {university.admissionRequirements}
                 </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                  Close
                </Button>
              </div>

            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
