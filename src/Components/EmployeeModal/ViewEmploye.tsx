import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { useGetEmployeeByIdQuery } from "../../app/services/crudEmployee";

interface ViewEmployeeModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function ViewEmployeeModal({ open, id, onClose }: ViewEmployeeModalProps) {
  const { data: employee, isLoading, error } = useGetEmployeeByIdQuery(id ?? "", {
    skip: !id,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Employee Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <p className="font-medium text-destructive">Failed to load employee data</p>
              <p className="text-xs text-muted-foreground">
                {(error as any)?.data?.message || "Something went wrong"}
              </p>
            </div>
          ) : employee ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input value={employee.name} readOnly />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input value={employee.email} readOnly />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Role</label>
                <Input value={employee.role} readOnly />
              </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <span className={employee.is_active ? "text-green-600" : "text-destructive"}>
                            {employee.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
                
                 {employee.createdAt && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Joined Date</label>
                         <Input 
                            value={new Date(employee.createdAt).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })} 
                            readOnly 
                        />
                    </div>
                 )}
             </div>


              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl w-full"
                  onClick={onClose}
                >
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
