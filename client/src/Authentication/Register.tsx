import { useMemo, useState } from "react";
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    const confirmPassword = form.confirmPassword;

    if (!name) {
      newErrors.name = "Full name is required";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters";
    }

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
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
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] animate-pulse rounded-full bg-orange-300/20 blur-[110px]" />

        <div
          className="absolute -bottom-40 -right-40 h-[480px] w-[480px] animate-pulse rounded-full bg-amber-300/20 blur-[120px]"
          style={{ animationDelay: "1.5s" }}
        />

        <div
          className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-orange-200/15 blur-[100px]"
          style={{ animationDelay: "0.8s" }}
        />

        <div
          className="absolute left-[8%] top-[16%] h-12 w-12 animate-bounce rounded-full border border-orange-200/60 bg-white/30 backdrop-blur-sm"
          style={{ animationDuration: "5s" }}
        />

        <div
          className="absolute right-[10%] top-[18%] h-8 w-8 animate-bounce rounded-full border border-amber-200/70 bg-orange-100/30 backdrop-blur-sm"
          style={{
            animationDuration: "4s",
            animationDelay: "0.5s",
          }}
        />

        <div
          className="absolute bottom-[16%] left-[12%] h-7 w-7 animate-bounce rounded-full border border-orange-200/60 bg-orange-100/30"
          style={{
            animationDuration: "4.5s",
            animationDelay: "1s",
          }}
        />

        <div
          className="absolute bottom-[18%] right-[14%] h-14 w-14 animate-spin rounded-[20px] border border-orange-200/60 bg-white/30 backdrop-blur-sm"
          style={{ animationDuration: "15s" }}
        />

        <div className="absolute left-[18%] top-[35%] h-2 w-2 animate-ping rounded-full bg-orange-500" />

        <div
          className="absolute right-[20%] top-[40%] h-2 w-2 animate-ping rounded-full bg-amber-500"
          style={{ animationDelay: "1s" }}
        />

      </div>

      {/* REGISTER CARD */}
      <div className="relative z-10 w-full max-w-[410px] animate-[fadeIn_.6s_ease-out]">

        {/* CARD GLOW */}
        <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 blur-xl" />

        {/* CARD */}
        <div className="group relative max-h-[calc(100vh-28px)] overflow-hidden rounded-[26px] border border-orange-100 bg-white/90 p-5 shadow-[0_25px_75px_rgba(234,88,12,0.16)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_85px_rgba(234,88,12,0.22)] sm:p-6">

          {/* CARD GLOWS */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-300/15 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-amber-300/15 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          <div className="relative">

          
            {/* HEADER */}
            <div className="mb-3 text-center">

              <h1 className="bg-gradient-to-r from-gray-900 via-orange-700 to-gray-900 bg-clip-text text-[25px] font-extrabold tracking-tight text-transparent sm:text-[28px]">
                Create account
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Create your Mini CRM account
              </p>

            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium leading-4 text-red-600">
                {error}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-2.5"
            >

              {/* NAME */}
              <div>

                <label
                  htmlFor="register-name"
                  className="mb-1 block text-xs font-bold text-gray-700"
                >
                  Full name
                </label>

                <div className="group relative">

                  <User
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 ${
                      errors.name
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:text-orange-500"
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
                    className={`h-10.5 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus:-translate-y-0.5 focus:border-orange-400 focus:shadow-lg focus:ring-4 focus:ring-orange-100 ${
                      errors.name
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />

                </div>

                {errors.name && (
                  <p className="mt-0.5 text-[10px] font-medium text-red-500">
                    {errors.name}
                  </p>
                )}

              </div>

              {/* EMAIL */}
              <div>

                <label
                  htmlFor="register-email"
                  className="mb-1 block text-xs font-bold text-gray-700"
                >
                  Email address
                </label>

                <div className="group relative">

                  <Mail
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 ${
                      errors.email
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:text-orange-500"
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
                    className={`h-10.5 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus:-translate-y-0.5 focus:border-orange-400 focus:shadow-lg focus:ring-4 focus:ring-orange-100 ${
                      errors.email
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />

                  {form.email &&
                    !errors.email &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                      form.email
                    ) && (
                      <CheckCircle2
                        size={16}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
                      />
                    )}

                </div>

                {errors.email && (
                  <p className="mt-0.5 text-[10px] font-medium text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="register-password"
                  className="mb-1 block text-xs font-bold text-gray-700"
                >
                  Password
                </label>

                <div className="group relative">

                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500"
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
                    className={`h-10.5 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus:-translate-y-0.5 focus:border-orange-400 focus:shadow-lg focus:ring-4 focus:ring-orange-100 ${
                      errors.password
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-600"
                  >
                    {showPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>

                </div>

                {/* PASSWORD STRENGTH */}
                {form.password && (
                  <div className="mt-1">

                    <div className="h-1 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 transition-all duration-300"
                        style={{
                          width:
                            passwordStrength.width,
                        }}
                      />

                    </div>

                    <p className="mt-0.5 text-right text-[9px] font-medium text-gray-400">
                      {passwordStrength.label}
                    </p>

                  </div>
                )}

                {errors.password && (
                  <p className="mt-0.5 text-[10px] font-medium text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label
                  htmlFor="register-confirm-password"
                  className="mb-1 block text-xs font-bold text-gray-700"
                >
                  Confirm password
                </label>

                <div className="group relative">

                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500"
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
                    className={`h-10.5 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus:-translate-y-0.5 focus:border-orange-400 focus:shadow-lg focus:ring-4 focus:ring-orange-100 ${
                      errors.confirmPassword
                        ? "border-red-300 ring-4 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>

                </div>

                {errors.confirmPassword && (
                  <p className="mt-0.5 text-[10px] font-medium text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-orange-400/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}

                </span>

              </button>

            </form>

            {/* LOGIN */}
            <p className="mt-3 text-center text-xs text-gray-500">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-bold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
              >
                Sign in
              </Link>

            </p>

          </div>

        </div>

      </div>

      {/* PAGE ANIMATION */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(18px) scale(0.98);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          html,
          body,
          #root {
            height: 100%;
            margin: 0;
            overflow: hidden;
          }
        `}
      </style>

    </main>
  );
}