import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../UI/Button";
import { useDeleteLeadMutation, type Lead } from "../../app/services/crudLead";
import { useToast } from "../../hooks/use-toast";

interface DeleteLeadModalProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
}
export function DeleteLeadModal({
  open,
  lead,
  onClose,
}: DeleteLeadModalProps) {
  const { toast } = useToast();
  const [deleteLead, { isLoading }] = useDeleteLeadMutation();

  if (!open || !lead) return null;

  const handleDelete = async () => {
    try {
      await deleteLead(lead._id).unwrap();
      
      toast({
        title: "Lead deleted",
        description: `Lead ${lead.name} has been deleted successfully.`,
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description:
          error?.data?.message || "Could not delete the lead. Please try again.",
      });
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
          <h2 className="text-lg font-semibold">Delete Lead</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Warning</p>
              <p className="text-sm text-muted-foreground mt-1">
                This action cannot be undone. This will permanently delete the lead.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm">
              Are you sure you want to delete <span className="font-semibold">{lead.name}</span>?
            </p>
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <p className="text-muted-foreground">Email: {lead.email}</p>
              <p className="text-muted-foreground">Phone: {lead.phone}</p>
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
              type="button"
              variant="destructive"
              className="rounded-xl"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Lead"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
