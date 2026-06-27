import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Input } from "../UI/Input";
import { SearchableSelect } from "../UI/SearchableSelect";
import { Button } from "../UI/Button";
import { useCreateApplicationMutation } from "../../app/services/crudApplication";
import { useGetUniversitiesQuery } from "../../app/services/crudUniversity";
import { createApplicationSchema } from "../../validation/schemas";
import { ValidationError } from "yup";
import { useToast } from "../../hooks/use-toast";

interface CreateApplicationModalProps {
  open: boolean;
  onClose: () => void;
}

const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Argentine", "Armenian", "Australian",
  "Austrian", "Azerbaijani", "Bahraini", "Bangladeshi", "Belarusian", "Belgian",
  "Bolivian", "Bosnian", "Brazilian", "British", "Bulgarian", "Cambodian", "Canadian",
  "Chilean", "Chinese", "Colombian", "Croatian", "Cypriot", "Czech", "Danish",
  "Dutch", "Ecuadorian", "Egyptian", "Emirati", "Estonian", "Ethiopian", "Filipino",
  "Finnish", "French", "Georgian", "German", "Ghanaian", "Greek", "Hungarian",
  "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Italian",
  "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kuwaiti", "Kyrgyz", "Latvian",
  "Lebanese", "Libyan", "Lithuanian", "Luxembourgish", "Malaysian", "Maldivian",
  "Malian", "Maltese", "Mexican", "Moldovan", "Mongolian", "Moroccan", "Nepalese",
  "New Zealander", "Nigerian", "Norwegian", "Omani", "Pakistani", "Palestinian",
  "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan",
  "Saudi", "Scottish", "Senegalese", "Serbian", "Singaporean", "Slovak", "Slovenian",
  "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese",
  "Swedish", "Swiss", "Syrian", "Tajik", "Tanzanian", "Thai", "Tunisian", "Turkish",
  "Turkmen", "Ugandan", "Ukrainian", "Uzbek", "Venezuelan", "Vietnamese", "Yemeni", "Zimbabwean",
];

const COUNTRIES = [
  { value: "Uzbekistan", label: "Uzbekistan (أوزبكستان)" },
  { value: "Azerbaijan", label: "Azerbaijan (أذربيجان)" },
  { value: "Tajikistan", label: "Tajikistan (طاجكستان)" },
  { value: "Turkey", label: "Turkey (تركيا)" },
  { value: "Poland", label: "Poland (بولندا)" },
  { value: "Spain", label: "Spain (إسبانيا)" },
  { value: "Malaysia", label: "Malaysia (ماليزيا)" },
  { value: "Other", label: "Other" },
];

const GRADUATION_YEAR_MAX = 2030;
const GRADUATION_YEARS = Array.from(
  { length: GRADUATION_YEAR_MAX - 2000 + 1 },
  (_, i) => String(GRADUATION_YEAR_MAX - i)
);

const nationalityOptions = NATIONALITIES.map((item) => ({
  value: item,
  label: item,
}));

const graduationYearOptions = GRADUATION_YEARS.map((year) => ({
  value: year,
  label: year,
}));

export function CreateApplicationModal({
  open,
  onClose,
}: CreateApplicationModalProps) {
  const { toast } = useToast();
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const { data: universitiesData } = useGetUniversitiesQuery({ limit: 100 }); // Fetch enough for dropdown
  
  const universities = universitiesData?.data?.universities || [];
  const universityOptions = universities.map((uni) => ({
    value: uni._id,
    label: uni.name,
  }));

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [highSchoolGrade, setHighSchoolGrade] = useState("");
  const [desiredMajor, setDesiredMajor] = useState("");
  const [desiredCountry, setDesiredCountry] = useState("");
  const [desiredUniversity, setDesiredUniversity] = useState("");
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setDocumentFiles([...documentFiles, ...files]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...documentFiles];
    newFiles.splice(index, 1);
    setDocumentFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApplicationSchema.validate({
        fullName,
        phone,
        email,
        nationality,
        passportNumber,
        graduationYear,
        highSchoolGrade,
        desiredMajor,
        desiredCountry,
        desiredUniversity
      }, { abortEarly: false });
      setErrors({});

      setErrors({});

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("nationality", nationality);
      formData.append("passportNumber", passportNumber);
      formData.append("graduationYear", graduationYear);
      formData.append("highSchoolGrade", highSchoolGrade);
      formData.append("desiredMajor", desiredMajor);
      formData.append("desiredCountry", desiredCountry);
      formData.append("desiredUniversity", desiredUniversity);
      
      documentFiles.forEach((file) => {
        formData.append("documents", file);
      });

      await createApplication(formData).unwrap();
      
      toast({
        title: "Application created",
        description: `Application for ${fullName} has been created successfully.`,
      });
      // Reset form
      setFullName("");
      setPhone("");
      setEmail("");
      setNationality("");
      setPassportNumber("");
      setGraduationYear("");
      setHighSchoolGrade("");
      setDesiredMajor("");
      setDesiredCountry("");
      setDesiredUniversity("");
      setDocumentFiles([]);
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
            title: "Creation failed",
            description:
            error?.data?.message || "Could not create the application. Please try again.",
        });
      }
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
        className="w-full max-w-2xl rounded-2xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">Add Application</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student Name"
              />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0123456789"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Nationality</label>
              <SearchableSelect
                value={nationality}
                onChange={setNationality}
                options={nationalityOptions}
                placeholder="Select nationality"
                searchPlaceholder="Search nationality..."
              />
              {errors.nationality && <p className="text-red-500 text-xs">{errors.nationality}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Passport Number</label>
              <Input
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                placeholder="A1234567"
              />
              {errors.passportNumber && <p className="text-red-500 text-xs">{errors.passportNumber}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Graduation Year</label>
              <SearchableSelect
                value={graduationYear}
                onChange={setGraduationYear}
                options={graduationYearOptions}
                placeholder="Select graduation year"
                searchPlaceholder="Search year..."
              />
              {errors.graduationYear && <p className="text-red-500 text-xs">{errors.graduationYear}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">High School Grade</label>
            <Input
              value={highSchoolGrade}
              onChange={(e) => setHighSchoolGrade(e.target.value)}
              placeholder="95%"
            />
            {errors.highSchoolGrade && <p className="text-red-500 text-xs">{errors.highSchoolGrade}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Desired Major</label>
              <Input
                value={desiredMajor}
                onChange={(e) => setDesiredMajor(e.target.value)}
                placeholder="Computer Science"
              />
              {errors.desiredMajor && <p className="text-red-500 text-xs">{errors.desiredMajor}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Desired Country</label>
              <SearchableSelect
                value={desiredCountry}
                onChange={setDesiredCountry}
                options={COUNTRIES}
                placeholder="Select country"
                searchPlaceholder="Search country..."
              />
              {errors.desiredCountry && <p className="text-red-500 text-xs">{errors.desiredCountry}</p>}
            </div>
          </div>


          <div className="space-y-1">
            <label className="text-sm font-medium">Desired University</label>
            <SearchableSelect
              value={desiredUniversity}
              onChange={setDesiredUniversity}
              options={universityOptions}
              placeholder="Select a university"
              searchPlaceholder="Search university..."
            />
            {errors.desiredUniversity && <p className="text-red-500 text-xs">{errors.desiredUniversity}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Documents</label>
            <div className="flex flex-col gap-3">
              {documentFiles.length > 0 && (
                <div className="space-y-2">
                  {documentFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30">
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-md border-2 border-dashed border-input bg-background hover:bg-muted/50 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upload Documents
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground">Supported files: PDF, Images</p>
            </div>
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
              {isLoading ? "Creating..." : "Create Application"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
