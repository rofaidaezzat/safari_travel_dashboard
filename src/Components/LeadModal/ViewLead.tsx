import { motion } from "framer-motion";
import { X, Mail, Phone, MessageSquare, Calendar, Tag, UserCheck } from "lucide-react";
import { type Lead } from "../../app/services/crudLead";

interface ViewLeadModalProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
}

export function ViewLeadModal({
  open,
  lead,
  onClose,
}: ViewLeadModalProps) {
  if (!open || !lead) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500/10 text-blue-500";
      case "Contacted":
      case "In Progress":
        return "bg-yellow-500/10 text-yellow-500";
      case "Closed":
      case "Completed":
        return "bg-green-500/10 text-green-500";
      case "Cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getAssignedToName = () => {
    if (!lead.assignedTo) return null;
    if (typeof lead.assignedTo === "object") {
      return lead.assignedTo.name || lead.assignedTo.email || null;
    }
    return lead.assignedTo;
  };

  const assignedToName = getAssignedToName();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">Lead Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Header with name and status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{lead.name}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h4>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{lead.phone}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </h4>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm leading-relaxed">{lead.message}</p>
            </div>
          </div>

          {assignedToName && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="font-medium">{assignedToName}</p>
                {typeof lead.assignedTo === "object" && lead.assignedTo.email && (
                  <p className="text-xs text-muted-foreground mt-0.5">{lead.assignedTo.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-medium">{formatDate(lead.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Updated At</p>
                <p className="text-sm font-medium">{formatDate(lead.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
