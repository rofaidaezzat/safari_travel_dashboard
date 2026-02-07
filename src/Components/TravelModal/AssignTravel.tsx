import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, UserPlus, Loader2 } from "lucide-react";
import { Button } from "../UI/Button";
import { useAssignTravelMutation, type Travel } from "../../app/services/crudTravel";
import { useGetEmployeesQuery } from "../../app/services/crudEmployee";
import { useToast } from "../../hooks/use-toast";

interface AssignTravelModalProps {
  open: boolean;
  travel: Travel | null;
  onClose: () => void;
}

export function AssignTravelModal({
  open,
  travel,
  onClose,
}: AssignTravelModalProps) {
  const { toast } = useToast();
  const [assignTravel, { isLoading }] = useAssignTravelMutation();
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery({ limit: 100, status: "true" });
  
  const employees = (employeesData?.data?.employees || []).filter(emp => emp.role !== "Admin");
  const [assignedTo, setAssignedTo] = useState("");

  // Clean form when modal opens/closes
  useEffect(() => {
    if (!open) {
        setAssignedTo("");
    }
  }, [open]);

  if (!open || !travel) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select an employee.",
        });
        return;
    }

    try {
      await assignTravel({ id: travel._id, assignedTo }).unwrap();
      
      toast({
        title: "Travel assigned",
        description: `Travel request has been successfully assigned.`,
      });
      onClose();
    } catch (error: any) {
      console.error("Assignment failed", error);
      toast({
        variant: "destructive",
        title: "Assignment failed",
        description:
          error?.data?.message || "Could not assign the travel request. Please try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Assign Travel
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
            <div className="p-4 rounded-lg bg-muted/50">
               <p className="text-sm font-medium">Assigning: {travel.fullname}</p>
               <p className="text-xs text-muted-foreground mt-1">{travel.from} → {travel.to}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Employee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoadingEmployees}
              >
                <option value="">Choose an employee...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
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
              disabled={isLoading || isLoadingEmployees || !assignedTo}
            >
              {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
              ) : (
                  "Assign"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
