import * as yup from "yup";

// --- Application Schemas ---

export const createApplicationSchema = yup.object().shape({
    fullName: yup.string().required("Full Name is required"),
    phone: yup.string().required("Phone is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    nationality: yup.string().required("Nationality is required"),
    passportNumber: yup.string().required("Passport Number is required"),
    graduationYear: yup
        .string()
        .required("Graduation Year is required")
        .test("valid-year", "Graduation year must be between 2000 and 2030", (value) => {
            if (!value) return false;
            const year = parseInt(value, 10);
            return year >= 2000 && year <= 2030;
        }),
    highSchoolGrade: yup.string().required("High School Grade is required"),
    desiredMajor: yup.string().required("Desired Major is required"),
    desiredCountry: yup.string().optional(),
    desiredUniversity: yup.string()
        .length(24, "University ID must be exactly 24 characters")
        .matches(/^[0-9a-fA-F]{24}$/, "University ID must be a valid hex string")
        .required("Desired University ID is required"),
    documents: yup.array().of(yup.string()).optional(),
});

export const updateApplicationStatusSchema = yup.object().shape({
    status: yup.string()
        .oneOf(["New", "Contacted", "Documents Received", "Submitted", "Accepted", "Visa", "Traveled", "Rejected", "Pending", "In Progress", "Completed", "Cancelled"], "Invalid status")
        .required("Status is required"),
});

export const assignApplicationSchema = yup.object().shape({
    assignedTo: yup.string().length(24, "Invalid ID").required("Assignee is required"),
});

export const addNoteSchema = yup.object().shape({
    note: yup.string().required("Note is required"),
});

// --- Employee Schemas ---

export const registerEmployeeSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
    role: yup.string().oneOf(["Admin", "Employee"], "Invalid role").optional(), // Optional in frontend form usually, default handled
});

export const loginEmployeeSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
});

export const updateEmployeeSchema = yup.object().shape({
    name: yup.string().optional(),
    email: yup.string().email("Invalid email").optional(),
    role: yup.string().oneOf(["Admin", "Employee"], "Invalid role").optional(),
    is_active: yup.boolean().optional(),
});

// --- Lead Schemas ---

export const createLeadSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup.string().required("Phone is required"),
    message: yup.string().required("Message is required"),
});

export const updateLeadStatusSchema = yup.object().shape({
    status: yup.string()
        .oneOf(["New", "Contacted", "Closed", "Pending", "In Progress", "Completed", "Cancelled"], "Invalid status")
        .required("Status is required"),
});

// --- Partner Schemas ---

export const updateTravelStatusSchema = yup.object().shape({
    status: yup.string()
        .oneOf(["Pending", "In Progress", "Completed", "Cancelled"], "Invalid status")
        .required("Status is required"),
});

export const createPartnerSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    // Logo is often handled as File object in frontend, backend schema expects string (url). 
    // We'll validate presence of file separately if needed or allow empty if optional.
    // Joi said optional.
    logo: yup.string().optional(),
    website: yup.string().url("Invalid URL").optional(),
    type: yup.string().required("Type is required"),
});

export const updatePartnerSchema = yup.object().shape({
    name: yup.string().optional(),
    logo: yup.string().optional(),
    website: yup.string().url("Invalid URL").optional(),
    type: yup.string().optional(),
});

// --- University Schemas ---

export const createUniversitySchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    country: yup.string().required("Country is required"),
    description: yup.string().required("Description is required"),
    programs: yup.array().of(yup.string()).optional(),
    fees: yup.string().required("Fees are required").test(
        "non-negative-fees",
        "Fees cannot be negative",
        (value) => {
            if (!value) return true;
            const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
            return isNaN(num) || num >= 0;
        }
    ),
    admissionRequirements: yup.string().required("Requirements are required"),
    images: yup.array().of(yup.string()).optional(),
    videoUrl: yup.string().url("Invalid URL").optional(),
});

export const updateUniversitySchema = yup.object().shape({
    name: yup.string().optional(),
    country: yup.string().optional(),
    description: yup.string().optional(),
    programs: yup.array().of(yup.string()).optional(),
    fees: yup.string().optional().test(
        "non-negative-fees",
        "Fees cannot be negative",
        (value) => {
            if (!value) return true;
            const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
            return isNaN(num) || num >= 0;
        }
    ),
    admissionRequirements: yup.string().optional(),
    images: yup.array().of(yup.string()).optional(),
    imagesToDelete: yup.array().of(yup.number().integer().min(0)).optional(),
    videoUrl: yup.string().url("Invalid URL").optional(),
});

// --- Course Schemas ---

export const createCourseSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    tags: yup.array().of(yup.string()).optional(),
    universities: yup.array().of(yup.string()).optional(),
});

export const updateCourseSchema = yup.object().shape({
    title: yup.string().optional(),
    description: yup.string().optional(),
    tags: yup.array().of(yup.string()).optional(),
    universities: yup.array().of(yup.string()).optional(),
});
