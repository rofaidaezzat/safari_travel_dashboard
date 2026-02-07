import { motion } from "framer-motion";
import { X, MapPin, Calendar, User, Phone, Users, Plane } from "lucide-react";
import { useGetTravelByIdQuery } from "../../app/services/crudTravel";

interface ViewTravelModalProps {
    open: boolean;
    id: string | null;
    onClose: () => void;
  }
  
  export function ViewTravelModal({ open, id, onClose }: ViewTravelModalProps) {
    const { data: travel, isLoading } = useGetTravelByIdQuery(id || "", {
      skip: !id,
    });
  
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl rounded-2xl bg-background border border-border shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Travel Request Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading details...</div>
          ) : travel ? (
            <div className="p-6 space-y-8">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <span className="text-sm text-muted-foreground block">Full Name</span>
                        <span className="text-base font-medium">{travel.fullname}</span>
                    </div>
                     <div>
                        <span className="text-sm text-muted-foreground block">Address</span>
                        <span className="text-base font-medium">{travel.address}</span>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground block">Phone</span>
                        <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-base font-medium">{travel.phonenumber}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground block">WhatsApp</span>
                        <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span className="text-base font-medium">{travel.whatsapp}</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Trip Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
                    <Plane className="h-4 w-4" /> Trip Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-center gap-2">
                        <div>
                            <span className="text-sm text-muted-foreground block">From</span>
                            <div className="flex items-center gap-1 font-medium">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {travel.from}
                            </div>
                        </div>
                        <span className="text-muted-foreground">→</span>
                        <div>
                            <span className="text-sm text-muted-foreground block">To</span>
                             <div className="flex items-center gap-1 font-medium">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {travel.to}
                            </div>
                        </div>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground block">Date</span>
                        <div className="flex items-center gap-2 font-medium">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(travel.date).toLocaleDateString()}
                        </div>
                    </div>
                     <div>
                        <span className="text-sm text-muted-foreground block">Type</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                            {travel.type}
                        </span>
                    </div>
                    <div>
                         <span className="text-sm text-muted-foreground block">Passengers</span>
                         <div className="flex items-center gap-2 font-medium">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{travel.passengers?.adults} Adults, {travel.passengers?.children} Children</span>
                        </div>
                    </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                  <button
                      className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
                      onClick={onClose}
                  >
                      Close
                  </button>
              </div>
            </div>
          ) : (
             <div className="p-8 text-center text-muted-foreground">Request not found.</div>
          )}
        </motion.div>
      </div>
    );
  }
