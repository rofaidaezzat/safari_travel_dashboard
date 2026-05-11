import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../Components/UI/Button";
import { Input } from "../Components/UI/Input";
import { useToast } from "../hooks/use-toast";
import { useLoginMutation } from "../app/services/crudAuth";
import { loginEmployeeSchema } from "../validation/schemas";
import { ValidationError } from "yup";
import logo from "../assets/logo_safari-removebg-preview.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    try {
      await loginEmployeeSchema.validate({ email, password }, { abortEarly: false });
      
      const result = await login({ email, password }).unwrap();

      if (result && result.token) {
        localStorage.setItem("accessToken", result.token);
      } else if (result && result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
      } else {
        // Fallback or maybe the whole result is the token? unlikely.
        console.warn("Token not found in response", result);
      }

      // Store User Role if available
      // Based on structure: { data: { user: { role: "Admin" } } }
      if (result?.data?.user?.role) {
        localStorage.setItem("role", result.data.user.role);
      }
      if (result?.data?.user?.email) {
        localStorage.setItem("email", result.data.user.email);
      }
      if (result?.data?.user?.name) {
        localStorage.setItem("name", result.data.user.name);
      }
      if (result?.data?.user?._id) {
          localStorage.setItem("userId", result.data.user._id);
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      if (result?.data?.user?.role === "Employee") {
        navigate("/dashboard/applications");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err instanceof ValidationError) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
           if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("Login failed", err);
        setFormError(
          err?.data?.message || "Please check your credentials and try again.",
        );
        toast({
          variant: "destructive",
          title: "Login failed",
          description:
            err?.data?.message || "Please check your credentials and try again.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background (subtle gradients) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[620px] w-[620px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between"
        >
          {/* Logo Side */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-3xl" />
              <img
                src={logo}
                alt="Wasil Logo"
                className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.25)]"
              />
            </motion.div>

            <p
              className="mt-6 text-sm text-muted-foreground font-arabic max-w-xs"
              dir="rtl"
            >
              لوحة تحكم سفاري للخدمات الطلابية
            </p>
          </div>

          {/* Login Form Side */}
          <div className="flex-1 w-full max-w-md mx-auto">
            <div className="rounded-3xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.35)]">
              <div className="p-8 sm:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                  <p className="text-muted-foreground text-sm">
                    Sign in to access your dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {formError && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      {formError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="login-email"
                      className="block text-sm font-medium"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        autoComplete="email"
                        placeholder="admin@wasil.edu"
                        className="pl-12 h-12 rounded-2xl"
                        required
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-12 rounded-2xl"
                        required
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      {errors.password && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.password}</p>}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#3f55a6] via-[#4b5ca0] to-[#2a1945] hover:brightness-105 text-base shadow-lg shadow-[#3f55a6]/20 focus-visible:ring-2 focus-visible:ring-[#3f55a6]/40"
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
