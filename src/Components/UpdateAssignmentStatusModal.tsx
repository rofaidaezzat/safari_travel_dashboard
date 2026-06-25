import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./UI/Button";
import { useUpdateAssignmentStatusMutation } from "../app/services/crudAssignment";
import { useUpdateTravelStatusMutation, useAssignTravelMutation } from "../app/services/crudTravel";
import { useUpdateApplicationStatusMutation, useAssignApplicationMutation } from "../app/services/crudApplication";
import { useToast } from "../hooks/use-toast";

interface UpdateAssignmentStatusModalProps {
  open: boolean;
  assignmentId: string | null;
  itemId?: string; // ID of Travel or Application
  itemType?: "Travel" | "Application";
  currentStatus: string;
  onClose: () => void;
}

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Cancelled"];

export function UpdateAssignmentStatusModal({
  open,
  assignmentId,
  itemId,
  itemType,
  currentStatus,
  onClose,
}: UpdateAssignmentStatusModalProps) {
  const { toast } = useToast();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAssignmentStatusMutation();
  const [assignTravel, { isLoading: isAssigningTravel }] = useAssignTravelMutation();
  const [updateTravelStatus, { isLoading: isUpdatingTravel }] = useUpdateTravelStatusMutation();
  const [assignApplication, { isLoading: isAssigningApp }] = useAssignApplicationMutation();
  const [updateApplicationStatus, { isLoading: isUpdatingApp }] = useUpdateApplicationStatusMutation();
  
  // Watch assignments to find the new ID after assignment - REMOVED as we no longer fetch assignments for this flow
  // const { data: assignmentsData } = useGetAssignmentsQuery(...) 

  const [status, setStatus] = useState(currentStatus);
  const [isProcessingAssignment, setIsProcessingAssignment] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus(currentStatus || "Pending");
      setIsProcessingAssignment(false);
    }
  }, [open, currentStatus]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    // If there is an assignment ID, always update via the assigned endpoint (for both Admin and Employee)
    if (assignmentId) {
        try {
            await updateStatus({ id: assignmentId, status }).unwrap();
            toast({
                title: "Status Updated",
                description: `Status updated to ${status}.`,
            });
            onClose();
        } catch (error: any) {
            console.error("Status update failed", error);
            toast({
                variant: "destructive",
                title: "Update failed",
                description: error?.data?.message || "Could not update status.",
            });
        }
        return;
    }

    // Fallback: No assignment ID — update item status directly (unassigned items only)
    const role = localStorage.getItem("role");
    if (role === "Admin" && itemId && itemType) {
        try {
            if (itemType === "Travel") {
                await updateTravelStatus({ id: itemId, status }).unwrap();
            } else {
                await updateApplicationStatus({ id: itemId, status }).unwrap();
            }
            toast({
                title: "Status Updated",
                description: `${itemType} status updated to ${status}.`,
            });
            onClose();
        } catch (error: any) {
            console.error("Admin direct update failed", error);
            toast({
                variant: "destructive",
                title: "Update failed",
                description: error?.data?.message || "Could not update status.",
            });
        }
        return;
    }

    // Employee with no assignment — needs assignment first
    if (!itemId || !itemType) {
        console.error("Missing item details for assignment");
        return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not identify your user ID. Please log out and log in again.",
        });
        return;
    }

    try {
        setIsProcessingAssignment(true);
        if (itemType === "Travel") {
            await assignTravel({ id: itemId, assignedTo: userId }).unwrap();
        } else {
            await assignApplication({ id: itemId, assignedTo: userId }).unwrap();
        }
    } catch (error: any) {
        setIsProcessingAssignment(false);
        toast({
            variant: "destructive",
            title: "Assignment Failed",
            description: error?.data?.message || "Could not assign the item.",
        });
    }
  };

  const isLoading = isUpdating || isAssigningTravel || isAssigningApp || isProcessingAssignment || isUpdatingTravel || isUpdatingApp;

  const getStatusColor = (statusOption: string) => {
    switch (statusOption) {
      case "Pending":
        return "border-yellow-500 bg-yellow-500/10 text-yellow-600";
      case "In Progress":
        return "border-blue-500 bg-blue-500/10 text-blue-600";
      case "Completed":
        return "border-green-500 bg-green-500/10 text-green-600";
      case "Cancelled":
        return "border-red-500 bg-red-500/10 text-red-600";
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
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Update Status
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Status</label>
              <div className="grid grid-cols-2 gap-3">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStatus(opt)}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${
                      status === opt
                        ? getStatusColor(opt)
                        : "border-border hover:border-muted-foreground bg-card"
                    }`}
                  >
                    <span className="font-medium text-sm">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-primary hover:opacity-90 min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
              ) : (
                  "Update Status"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
