import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, User, Phone, MapPin, Plane, Calendar, Users } from "lucide-react";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { useUpdateTravelMutation, type Travel } from "../../app/services/crudTravel";
import { useToast } from "../../hooks/use-toast";

interface UpdateTravelModalProps {
  open: boolean;
  travel: Travel | null;
  onClose: () => void;
}

export function UpdateTravelModal({ open, travel, onClose }: UpdateTravelModalProps) {
  const { toast } = useToast();
  const [updateTravel, { isLoading }] = useUpdateTravelMutation();

  const [formData, setFormData] = useState({
      fullname: "",
      phonenumber: "",
      whatsapp: "",
      address: "",
      from: "",
      to: "",
      date: "",
      adults: 1,
      children: 0,
      type: "flight"
  });

  useEffect(() => {
    if (travel) {
        setFormData({
            fullname: travel.fullname || "",
            phonenumber: travel.phonenumber || "",
            whatsapp: travel.whatsapp || "",
            address: travel.address || "",
            from: travel.from || "",
            to: travel.to || "",
            date: travel.date ? new Date(travel.date).toISOString().split('T')[0] : "",
            adults: travel.passengers?.adults || 1,
            children: travel.passengers?.children || 0,
            type: travel.type || "flight"
        });
    }
  }, [travel]);

  if (!open || !travel) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: Partial<Travel> = {
          fullname: formData.fullname,
          phonenumber: formData.phonenumber,
          whatsapp: formData.whatsapp,
          address: formData.address,
          from: formData.from,
          to: formData.to, 
          date: formData.date,
          passengers: {
              adults: Number(formData.adults),
              children: Number(formData.children)
          },
          type: formData.type
      };

      await updateTravel({ id: travel._id, body: payload }).unwrap();
      
      toast({
        title: "Request Updated",
        description: `Travel request for ${formData.fullname} updated successfully.`,
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.data?.message || "Could not update travel request.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl rounded-2xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10 w-full">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Update Travel Request
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <User className="w-4 h-4" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="fullname">Full Name</label>
                    <Input
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Enter full name"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="address">Address</label>
                    <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Residential address"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="phonenumber">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="phonenumber"
                            name="phonenumber"
                            className="pl-9"
                            value={formData.phonenumber}
                            onChange={handleChange}
                            placeholder="+20..."
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="whatsapp">WhatsApp Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="whatsapp"
                            name="whatsapp"
                            className="pl-9"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            placeholder="+20..."
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* Trip Details Section */}
          <div className="space-y-4">
             <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                <MapPin className="w-4 h-4" /> Trip Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="from">From</label>
                    <select
                        id="from"
                        name="from"
                        value={formData.from}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="" disabled>Select Origin</option>
                        <option value="Cairo">Cairo</option>
                        <option value="Alexandria">Alexandria</option>
                        <option value="Hurghada">Hurghada</option>
                        <option value="Sharm El Sheikh">Sharm El Sheikh</option>
                        <option value="Luxor">Luxor</option>
                        <option value="Aswan">Aswan</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Riyadh">Riyadh</option>
                        <option value="Jeddah">Jeddah</option>
                        <option value="London">London</option>
                        <option value="Paris">Paris</option>
                        <option value="New York">New York</option>
                        <option value="Istanbul">Istanbul</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="to">To</label>
                     <select
                        id="to"
                        name="to"
                        value={formData.to}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="" disabled>Select Destination</option>
                        <option value="Cairo">Cairo</option>
                        <option value="Alexandria">Alexandria</option>
                        <option value="Hurghada">Hurghada</option>
                        <option value="Sharm El Sheikh">Sharm El Sheikh</option>
                        <option value="Luxor">Luxor</option>
                        <option value="Aswan">Aswan</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Riyadh">Riyadh</option>
                        <option value="Jeddah">Jeddah</option>
                        <option value="London">London</option>
                        <option value="Paris">Paris</option>
                        <option value="New York">New York</option>
                        <option value="Istanbul">Istanbul</option>
                    </select>
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="date">Travel Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            className="pl-9"
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="type">Trip Type</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="flight">Flight</option>
                        <option value="hotel">Hotel</option>
                        <option value="package">Package</option>
                    </select>
                 </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="adults">Adults</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                         <Input
                            id="adults"
                            name="adults"
                            type="number"
                            min="1"
                            className="pl-9"
                            value={formData.adults}
                            onChange={handleChange}
                        />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="children">Children</label>
                     <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="children"
                            name="children"
                            type="number"
                            min="0"
                            className="pl-9"
                            value={formData.children}
                            onChange={handleChange}
                        />
                    </div>
                 </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl px-6"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-primary hover:opacity-90 px-8"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Request"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
