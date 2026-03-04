import { motion } from "framer-motion";
import { X, User, Mail, Phone, Globe, FileText, GraduationCap, Calendar, Award, MapPin, Building2, ExternalLink, Files } from "lucide-react";
import { type Application } from "../../app/services/crudApplication";

interface ViewApplicationModalProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
}

export function ViewApplicationModal({
  open,
  application,
  onClose,
}: ViewApplicationModalProps) {
  if (!open || !application) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-500/10 text-blue-500";
      case "Accepted":
        return "bg-green-500/10 text-green-500";
      case "Rejected":
        return "bg-red-500/10 text-red-500";
     
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-2xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">Application Details</h2>
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
              <h3 className="text-2xl font-bold">{application.fullName}</h3>
              <p className="text-sm text-muted-foreground mt-1">ID: {application._id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{application.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm">{application.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nationality</p>
                  <p className="font-medium text-sm">{application.nationality}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Passport Number</p>
                  <p className="font-medium text-sm">{application.passportNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Academic Information</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Graduation Year</p>
                  <p className="font-medium text-sm">{application.graduationYear}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">High School Grade</p>
                  <p className="font-medium text-sm">{application.highSchoolGrade}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desired Program */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Desired Program</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Major</p>
                  <p className="font-medium text-sm">{application.desiredMajor}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="font-medium text-sm">{application.desiredCountry}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">University ID</p>
                  <p className="font-medium text-sm">
                    {typeof application.desiredUniversity === "object" && application.desiredUniversity !== null
                      ? (application.desiredUniversity as any).name
                      : application.desiredUniversity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Documents</h4>
              <div className="grid grid-cols-2 gap-3">
                {application.documents.map((doc, index) => (
                  <a 
                    key={index} 
                    href={doc} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Files className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">Document {index + 1}</p>
                      <p className="text-xs text-muted-foreground truncate">Click to view</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-medium">{formatDate(application.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Updated At</p>
                <p className="text-sm font-medium">{formatDate(application.updatedAt)}</p>
              </div>
            </div>
          </div>

          {application.assignedTo && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium">
                Assigned To:{" "}
                {typeof application.assignedTo === "object"
                  ? application.assignedTo.name || application.assignedTo.email || application.assignedTo._id
                  : application.assignedTo}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
