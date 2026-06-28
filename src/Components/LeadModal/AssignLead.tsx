import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { Button } from "../UI/Button";
import { useAssignLeadMutation } from "../../app/services/crudLead";
import type { Lead } from "../../app/services/crudLead";
import { useGetEmployeesQuery } from "../../app/services/crudEmployee";
import { useToast } from "../../hooks/use-toast";

interface AssignLeadModalProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
}

export function AssignLeadModal({
  open,
  lead,
  onClose,
}: AssignLeadModalProps) {
  const { toast } = useToast();
  const [assignLead, { isLoading }] = useAssignLeadMutation();
  const { data: employeesData } = useGetEmployeesQuery({ limit: 100, status: "true" });
  
  const employees = (employeesData?.data?.employees || []).filter(emp => emp.role !== "Admin");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (lead && open) {
       if (typeof lead.assignedTo === "object" && lead.assignedTo !== null) {
         setAssignedTo(lead.assignedTo._id || "");
       } else if (typeof lead.assignedTo === "string") {
         setAssignedTo(lead.assignedTo);
       } else {
         setAssignedTo("");
       }
    }
  }, [lead, open]);

  if (!open || !lead) return null;

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
      await assignLead({ id: lead._id, assignedTo }).unwrap();
      
      toast({
        title: "Lead assigned",
        description: `Lead has been successfully assigned.`,
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment failed",
        description:
          error?.data?.message || "Could not assign the lead. Please try again.",
      });
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
            <UserPlus className="h-5 w-5 text-primary" />
            Assign Lead
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
            <p className="text-sm font-medium text-muted-foreground">
              Send to Employee
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Employee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Assign"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
