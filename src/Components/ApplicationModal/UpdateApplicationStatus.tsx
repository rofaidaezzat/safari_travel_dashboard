import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../UI/Button";
import { useUpdateApplicationStatusMutation, type Application } from "../../app/services/crudApplication";
import { updateApplicationStatusSchema } from "../../validation/schemas";
import { ValidationError } from "yup";
import { useToast } from "../../hooks/use-toast";

interface UpdateApplicationStatusModalProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
}

export function UpdateApplicationStatusModal({
  open,
  application,
  onClose,
}: UpdateApplicationStatusModalProps) {
  const { toast } = useToast();
  const [updateApplicationStatus, { isLoading }] = useUpdateApplicationStatusMutation();
  const [status, setStatus] = useState<Application["status"]>(application?.status || "New");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open || !application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateApplicationStatusSchema.validate({ status }, { abortEarly: false });
      setErrors({});

      await updateApplicationStatus({ 
        id: application._id, 
        status 
      }).unwrap();
      
      toast({
        title: "Status updated",
        description: `Application status has been updated to ${status}.`,
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
            error?.data?.message || "Could not update the application status. Please try again.",
        });
      }
    }
  };

  const statuses: Application["status"][] = [
    "New", 
    "Contacted", 
    "Documents Received", 
    "Submitted", 
    "Accepted", 
    "Visa", 
    "Traveled", 
    "Rejected"
  ];

  const getStatusColor = (statusOption: Application["status"]) => {
    switch (statusOption) {
      case "New":
        return "border-blue-500 bg-blue-500/10 text-blue-500";
      case "Contacted":
        return "border-purple-500 bg-purple-500/10 text-purple-500";
      case "Documents Received":
        return "border-yellow-500 bg-yellow-500/10 text-yellow-500";
      case "Submitted":
        return "border-indigo-500 bg-indigo-500/10 text-indigo-500";
      case "Accepted":
        return "border-green-500 bg-green-500/10 text-green-500";
      case "Visa":
        return "border-cyan-500 bg-cyan-500/10 text-cyan-500";
      case "Traveled":
        return "border-emerald-500 bg-emerald-500/10 text-emerald-500";
      case "Rejected":
        return "border-red-500 bg-red-500/10 text-red-500";
      default:
        return "border-gray-500 bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Update Application Status</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Applicant: {application.fullName}</label>
            <p className="text-xs text-muted-foreground">{application.email}</p>
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
                      ? getStatusColor(statusOption)
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
