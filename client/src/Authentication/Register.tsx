import {
  useMemo,
  useState,
} from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const password = form.password;

    if (!password) {
      return {
        label: "",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: "Weak",
        width: "25%",
      };
    }

    if (score === 2) {
      return {
        label: "Medium",
        width: "50%",
      };
    }

    if (score === 3) {
      return {
        label: "Strong",
        width: "75%",
      };
    }

    return {
      label: "Very strong",
      width: "100%",
    };
  }, [form.password]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword =
      form.confirmPassword;

    if (!name) {
      newErrors.name =
        "Full name is required";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters";
    }

    if (!email) {
      newErrors.email =
        "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password =
        "Password is required";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      await axios.post(
        `${API_URL}/api/auth/register`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to create your account."
        );
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#f8f7ff] to-[#fdf2f8] px-4 py-6 sm:px-6">
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-300/25 blur-[120px]" />

        <div className="absolute -bottom-48 -right-40 h-[520px] w-[520px] animate-pulse rounded-full bg-pink-300/25 blur-[130px]" />

        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-indigo-300/15 blur-[120px]" />

        <div className="absolute left-[8%] top-[18%] h-16 w-16 animate-bounce rounded-full border border-white/60 bg-white/20 backdrop-blur-sm" />

        <div className="absolute right-[9%] top-[16%] h-10 w-10 animate-bounce rounded-full border border-white/70 bg-purple-200/20 backdrop-blur-sm" />

        <div className="absolute bottom-[15%] left-[12%] h-8 w-8 animate-bounce rounded-full border border-white/60 bg-pink-200/20" />

        <div className="absolute bottom-[20%] right-[15%] h-20 w-20 animate-spin rounded-[28px] border border-white/60 bg-white/20 backdrop-blur-sm" />

        <div className="absolute left-[18%] top-[35%] h-2 w-2 animate-ping rounded-full bg-purple-500" />

        <div className="absolute right-[20%] top-[40%] h-2 w-2 animate-ping rounded-full bg-pink-500" />

        <div className="absolute bottom-[30%] left-[25%] h-1.5 w-1.5 animate-ping rounded-full bg-indigo-500" />

        <div className="absolute left-0 top-1/2 h-px w-[25%] bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

        <div className="absolute right-0 top-1/2 h-px w-[25%] bg-gradient-to-l from-transparent via-pink-300/40 to-transparent" />
      </div>

      {/* REGISTER CONTAINER */}

      <div className="relative z-10 w-full max-w-[460px] animate-[fadeIn_.7s_ease-out]">
        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-purple-500/20 via-indigo-500/10 to-pink-500/20 blur-xl" />

        <div className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/70 p-6 shadow-[0_30px_90px_rgba(76,29,149,0.16)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_100px_rgba(76,29,149,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white to-transparent" />

          <div className="relative">
            {/* HEADER */}

            <div className="mb-6 text-center">
              <h1 className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-[30px] font-extrabold tracking-tight text-transparent sm:text-[34px]">
                Create account
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Create your Mini CRM account
              </p>
            </div>

            {/* SERVER ERROR */}

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-[13px] font-bold text-gray-700"
                >
                  Full name
                </label>

                <div className="group relative">
                  <User
                    size={18}
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 ${
                      errors.name
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:text-purple-500"
                    }`}
                  />

                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`h-[52px] w-full rounded-2xl border bg-white/80 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:-translate-y-0.5 focus:bg-white focus:shadow-lg ${
                      errors.name
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200 hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                    }`}
                  />
                </div>

                {errors.name && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-[13px] font-bold text-gray-700"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={18}
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 ${
                      errors.email
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:text-purple-500"
                    }`}
                  />

                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`h-[52px] w-full rounded-2xl border bg-white/80 pl-11 pr-11 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:-translate-y-0.5 focus:bg-white focus:shadow-lg ${
                      errors.email
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200 hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                    }`}
                  />

                  {form.email &&
                    !errors.email &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                      form.email
                    ) && (
                      <CheckCircle2
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
                      />
                    )}
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-[13px] font-bold text-gray-700"
                >
                  Password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500"
                  />

                  <input
                    id="register-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={`h-[52px] w-full rounded-2xl border bg-white/80 pl-11 pr-12 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:-translate-y-0.5 focus:bg-white focus:shadow-lg ${
                      errors.password
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200 hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {form.password && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 transition-all duration-300"
                        style={{
                          width:
                            passwordStrength.width,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-[11px] font-medium text-gray-400">
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-2 block text-[13px] font-bold text-gray-700"
                >
                  Confirm password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500"
                  />

                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`h-[52px] w-full rounded-2xl border bg-white/80 pl-11 pr-12 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:-translate-y-0.5 focus:bg-white focus:shadow-lg ${
                      errors.confirmPassword
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200 hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-5 flex h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-400/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[180%]" />

                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* LOGIN */}

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}

              <Link
                to="/login"
                className="font-bold text-purple-600 transition-colors hover:text-pink-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}