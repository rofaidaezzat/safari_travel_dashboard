import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";

import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import {
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
  type Employee,
} from "../app/services/crudEmployee";
import { useToast } from "../hooks/use-toast";
import { CreateEmployeeModal } from "../Components/EmployeeModal/CreateEmployee";
import { UpdateEmployeeModal } from "../Components/EmployeeModal/UpdateEmployee";
import { DeleteEmployeeModal } from "../Components/EmployeeModal/DeleteEmployee";
import { ViewEmployeeModal } from "../Components/EmployeeModal/ViewEmploye";
import { Pagination } from "../Components/Pagination";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { toast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const { data, isError, error, refetch } = useGetEmployeesQuery({
    page,
    limit: 10,
    sort,
    status: statusFilter,
    role: roleFilter,
  });

  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const employees: Employee[] = data?.data.employees ?? [];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleActive = async (emp: Employee) => {
    try {
      await updateEmployee({
        id: emp._id,
        body: { is_active: !emp.is_active },
      }).unwrap();
      toast({
        title: "Status updated",
        description: `Employee ${emp.name} is now ${
          !emp.is_active ? "inactive" : "active"
        }.`,
      });
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          error?.data?.message || "Could not update employee status.",
      });
    }
  };

  const handleOpenUpdate = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowUpdate(true);
  };

  const handleOpenDelete = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowDelete(true);
  };

  const handleOpenView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowView(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage system employees</p>
          </div>
          <Button
            className="rounded-xl bg-gradient-primary hover:opacity-90"
            type="button"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
          </select>
        </div>

        {/* Loading / Error */}




        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border overflow-hidden max-w-full"
        >
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Employee
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Created At
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {emp.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(emp)}
                          disabled={isUpdating}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            emp.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {emp.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {new Date(emp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            type="button"
                            onClick={() => handleOpenView(emp)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            type="button"
                            onClick={() => handleOpenUpdate(emp)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            onClick={() => handleOpenDelete(emp)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                       {isError ? (
                          <div className="flex flex-col items-center gap-2">
                            <span>
                              {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.data?.message || 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (error as any)?.message || 
                                "Failed to load employees."
                              }
                            </span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                          </div>
                       ) : (
                         "No employees found"
                       )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {filteredEmployees.length} results
            </p>
            <div className="order-1 sm:order-2">
              <Pagination
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.numberOfPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateEmployeeModal open={showCreate} onClose={() => setShowCreate(false)} />
        <UpdateEmployeeModal
          open={showUpdate}
          employee={selectedEmployee}
          onClose={() => setShowUpdate(false)}
        />
        <DeleteEmployeeModal
          open={showDelete}
          employee={selectedEmployee}
          onClose={() => setShowDelete(false)}
        />
        <ViewEmployeeModal
          open={showView}
          id={selectedEmployee?._id || null}
          onClose={() => setShowView(false)}
        />
      </div>
    </DashboardLayout>
  );
}
