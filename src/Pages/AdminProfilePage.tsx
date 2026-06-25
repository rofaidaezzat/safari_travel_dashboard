import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  MessageCircle,
  MapPin,
  Link as LinkIcon,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  Globe,
} from "lucide-react";
import { DashboardLayout } from "../Components/DashboardLayout";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import {
  useGetEmployeeByIdQuery,
  useUpdateAdminProfileMutation,
  type SocialMediaLink,
} from "../app/services/crudEmployee";
import { useToast } from "../hooks/use-toast";

const SOCIAL_PRESETS = [
  { title: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { title: "Twitter / X", placeholder: "https://twitter.com/username" },
  { title: "Instagram", placeholder: "https://instagram.com/username" },
  { title: "Facebook", placeholder: "https://facebook.com/username" },
  { title: "Website", placeholder: "https://yourwebsite.com" },
];

export default function AdminProfilePage() {
  const { toast } = useToast();
  const userId = localStorage.getItem("userId") || "";

  const { data: employee, isLoading: isFetching } = useGetEmployeeByIdQuery(userId, {
    skip: !userId,
  });

  const [updateAdminProfile, { isLoading: isSaving }] = useUpdateAdminProfileMutation();

  const [phoneNum, setPhoneNum] = useState("");
  const [whatsNum, setWhatsNum] = useState("");
  const [address, setAddress] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (employee) {
      setPhoneNum(employee.phone_num || "");
      setWhatsNum(employee.whats_num || "");
      setAddress(employee.address || "");
      setSocialLinks(
        employee.social_media_links && employee.social_media_links.length > 0
          ? employee.social_media_links
          : []
      );
    }
  }, [employee]);

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { title: "", link: "" }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSocialChange = (index: number, field: "title" | "link", value: string) => {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Strip _id and any extra fields — API only accepts { title, link }
    const validLinks = socialLinks
      .filter((s) => s.title.trim() && s.link.trim())
      .map(({ title, link }) => ({ title, link }));

    try {
      await updateAdminProfile({
        id: userId,
        body: {
          phone_num: phoneNum || undefined,
          whats_num: whatsNum || undefined,
          address: address || undefined,
          social_media_links: validLinks.length > 0 ? validLinks : undefined,
        },
      }).unwrap();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({
        title: "Profile Updated",
        description: "Your admin profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error?.data?.message || "Could not save profile changes.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <User className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Profile</h1>
            <p className="text-muted-foreground">
              Manage your contact information and social media links
            </p>
          </div>
        </motion.div>

        {isFetching ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Account Info
                </h2>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="h-10 px-4 rounded-xl border border-border bg-muted/40 flex items-center text-sm font-medium">
                    {employee?.name || "—"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="h-10 px-4 rounded-xl border border-border bg-muted/40 flex items-center text-sm font-medium">
                    {employee?.email || "—"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="h-10 px-4 rounded-xl border border-border bg-muted/40 flex items-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {employee?.role || "Admin"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Contact Details
                  <span className="ml-auto text-xs font-normal text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Admin only
                  </span>
                </h2>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone Number
                    </label>
                    <Input
                      id="phone_num"
                      type="tel"
                      placeholder="+20 100 000 0000"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      WhatsApp Number
                    </label>
                    <Input
                      id="whats_num"
                      type="tel"
                      placeholder="+20 100 000 0000"
                      value={whatsNum}
                      onChange={(e) => setWhatsNum(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Address
                  </label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, Cairo, Egypt"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </motion.div>

            {/* Social Media Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Social Media Links
                  <span className="ml-1 text-xs font-normal text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Admin only
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Link
                </button>
              </div>

              <div className="px-6 py-5 space-y-3">
                {socialLinks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                    <LinkIcon className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No social links added yet.</p>
                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add your first link
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {socialLinks.map((link, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 items-start"
                      >
                        <div className="flex-shrink-0 w-40">
                          <select
                            value={link.title}
                            onChange={(e) => handleSocialChange(index, "title", e.target.value)}
                            className="h-10 w-full px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">Platform</option>
                            {SOCIAL_PRESETS.map((preset) => (
                              <option key={preset.title} value={preset.title}>
                                {preset.title}
                              </option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex-1 relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="url"
                            placeholder={
                              SOCIAL_PRESETS.find((p) => p.title === link.title)?.placeholder ||
                              "https://example.com/your-profile"
                            }
                            value={link.link}
                            onChange={(e) => handleSocialChange(index, "link", e.target.value)}
                            className="pl-9 rounded-xl"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-end"
            >
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-gradient-primary hover:opacity-90 min-w-[160px] gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
