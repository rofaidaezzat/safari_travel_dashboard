import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../UI/Button";
import { useUpdateLeadStatusMutation, type Lead } from "../../app/services/crudLead";
import { updateLeadStatusSchema } from "../../validation/schemas";
import { ValidationError } from "yup";
import { useToast } from "../../hooks/use-toast";

interface UpdateLeadStatusModalProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
}

export function UpdateLeadStatusModal({
  open,
  lead,
  onClose,
}: UpdateLeadStatusModalProps) {
  const { toast } = useToast();
  const [updateLeadStatus, { isLoading }] = useUpdateLeadStatusMutation();
  const [status, setStatus] = useState<Lead["status"]>(lead?.status || "New");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLeadStatusSchema.validate({ status }, { abortEarly: false });
      setErrors({});

      await updateLeadStatus({ 
        id: lead._id, 
        status 
      }).unwrap();
      
      toast({
        title: "Status updated",
        description: `Lead status has been updated to ${status}.`,
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
            error?.data?.message || "Could not update the lead status. Please try again.",
        });
      }
    }
  };

  const statuses: Lead["status"][] = ["New", "Contacted", "Closed"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Update Lead Status</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Lead: {lead.name}</label>
            <p className="text-xs text-muted-foreground">{lead.email}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => setStatus(statusOption)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    status === statusOption
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <span className="font-medium text-sm">{statusOption}</span>
                </button>
              ))}
            </div>
            {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}
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
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
