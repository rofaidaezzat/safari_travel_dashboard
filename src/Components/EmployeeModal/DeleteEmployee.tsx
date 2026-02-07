import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../UI/Button";
import { type Employee, useDeleteEmployeeMutation } from "../../app/services/crudEmployee";
import { useToast } from "../../hooks/use-toast";

interface DeleteEmployeeModalProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}

export function DeleteEmployeeModal({
  open,
  employee,
  onClose,
}: DeleteEmployeeModalProps) {
  const { toast } = useToast();
  const [deleteEmployee, { isLoading }] = useDeleteEmployeeMutation();

  if (!open || !employee) return null;

  const handleConfirm = async () => {
    try {
      await deleteEmployee(employee._id).unwrap();
      toast({
        title: "Employee deleted",
        description: `${employee.name} has been removed.`,
      });
      onClose();
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      toast({
        variant: "destructive",
        title: "Delete failed",
        description:
          error?.data?.message || "Could not delete the selected employee.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl bg-background border border-border shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Delete Employee</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex gap-3">
            <div className="mt-1">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="font-medium">
                Are you sure you want to delete "{employee.name}"?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This action cannot be undone.
              </p>
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
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

