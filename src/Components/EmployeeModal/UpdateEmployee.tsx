import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { type Employee, useUpdateEmployeeMutation } from "../../app/services/crudEmployee";
import { updateEmployeeSchema } from "../../validation/schemas";
import { ValidationError } from "yup";
import { useToast } from "../../hooks/use-toast";

interface UpdateEmployeeModalProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}

export function UpdateEmployeeModal({
  open,
  employee,
  onClose,
}: UpdateEmployeeModalProps) {
  const { toast } = useToast();
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setRole(employee.role);
    }
  }, [employee]);

  if (!open || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployeeSchema.validate({ name, email, role }, { abortEarly: false });
      setErrors({});

      await updateEmployee({
        id: employee._id,
        body: { name, email, role },
      }).unwrap();
      toast({
        title: "Employee updated",
        description: `Employee ${name} has been updated successfully.`,
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
            error?.data?.message || "Could not update the employee. Please try again.",
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
          <h2 className="text-lg font-semibold">Update Employee</h2>
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
              placeholder="Employee name"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@wasel.com"
            />
             {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
            </select>
             {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
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
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

