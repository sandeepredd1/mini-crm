import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const email = form.email.trim();
    const password = form.password;

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters";
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

    if (name === "email") {
      setErrors((previous) => ({
        ...previous,
        email: "",
      }));
    }

    if (name === "password") {
      setErrors((previous) => ({
        ...previous,
        password: "",
      }));
    }
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
        `${API_URL}/api/auth/login`,
        {
          email: form.email.trim(),
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to sign in. Please check your credentials."
        );
      } else {
        setError(
          "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Orange glows */}

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-orange-300/20 blur-[120px]" />

        <div
          className="absolute -bottom-48 -right-40 h-[520px] w-[520px] animate-pulse rounded-full bg-amber-300/20 blur-[130px]"
          style={{
            animationDelay: "1.5s",
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-orange-200/15 blur-[120px]"
          style={{
            animationDelay: "0.8s",
          }}
        />

        {/* Floating circles */}

        <div
          className="absolute left-[8%] top-[18%] h-16 w-16 animate-bounce rounded-full border border-orange-200/60 bg-white/30 backdrop-blur-sm"
          style={{
            animationDuration: "5s",
          }}
        />

        <div
          className="absolute right-[9%] top-[16%] h-10 w-10 animate-bounce rounded-full border border-amber-200/70 bg-orange-100/30 backdrop-blur-sm"
          style={{
            animationDuration: "4s",
            animationDelay: "0.5s",
          }}
        />

        <div
          className="absolute bottom-[15%] left-[12%] h-8 w-8 animate-bounce rounded-full border border-orange-200/60 bg-orange-100/30"
          style={{
            animationDuration: "4.5s",
            animationDelay: "1s",
          }}
        />

        <div
          className="absolute bottom-[20%] right-[15%] h-20 w-20 animate-spin rounded-[28px] border border-orange-200/60 bg-white/30 backdrop-blur-sm"
          style={{
            animationDuration: "15s",
          }}
        />

        {/* Small glowing dots */}

        <div className="absolute left-[18%] top-[35%] h-2 w-2 animate-ping rounded-full bg-orange-500" />

        <div
          className="absolute right-[20%] top-[40%] h-2 w-2 animate-ping rounded-full bg-amber-500"
          style={{
            animationDelay: "1s",
          }}
        />

        <div
          className="absolute bottom-[30%] left-[25%] h-1.5 w-1.5 animate-ping rounded-full bg-orange-500"
          style={{
            animationDelay: "2s",
          }}
        />

        {/* Decorative lines */}

        <div className="absolute left-0 top-1/2 h-px w-[25%] bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />

        <div className="absolute right-0 top-1/2 h-px w-[25%] bg-gradient-to-l from-transparent via-amber-300/40 to-transparent" />

      </div>

      {/* ================= LOGIN CONTAINER ================= */}

      <div className="relative z-10 w-full max-w-[430px] animate-[fadeIn_.7s_ease-out]">

        {/* Card glow */}

        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 blur-xl" />

        {/* ================= CARD ================= */}

        <div className="group relative max-h-[calc(100vh-32px)] overflow-hidden rounded-[30px] border border-orange-100 bg-white/90 p-5 shadow-[0_30px_90px_rgba(234,88,12,0.16)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_100px_rgba(234,88,12,0.22)] sm:p-7">

          {/* Card glow */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-orange-300/15 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl transition-all duration-700 group-hover:scale-125" />

          {/* Top shine */}

          <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          <div className="relative">

            {/* ================= HEADER ================= */}

            <div className="mb-5 text-center">

             

              <h1 className="bg-gradient-to-r from-gray-900 via-orange-700 to-gray-900 bg-clip-text text-[28px] font-extrabold tracking-tight text-transparent sm:text-[32px]">
                Welcome back
              </h1>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Sign in to your Mini CRM account
              </p>

            </div>

            {/* ================= SERVER ERROR ================= */}

            {error && (
              <div className="mb-3 flex animate-[shake_.4s_ease-in-out] items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 shadow-sm">

                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">

                  <span className="text-xs font-bold text-red-600">
                    !
                  </span>

                </div>

                <p className="text-xs leading-5 text-red-600">
                  {error}
                </p>

              </div>
            )}

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-3.5"
            >

              {/* ================= EMAIL ================= */}

              <div>

                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-xs font-bold text-gray-700"
                >
                  Email address
                </label>

                <div className="group relative">

                  <Mail
                    size={18}
                    className={`pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-all duration-300 ${
                      errors.email
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:scale-110 group-focus-within:text-orange-500"
                    }`}
                  />

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-11 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-md focus:-translate-y-0.5 focus:border-orange-400 focus:bg-white focus:shadow-lg focus:ring-4 focus:ring-orange-100 ${
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
                        size={18}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-[scaleIn_.2s_ease-out] text-emerald-500"
                      />
                    )}

                </div>

                {errors.email && (
                  <p className="mt-1 animate-[fadeIn_.2s_ease-out] text-[11px] font-medium text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* ================= PASSWORD ================= */}

              <div>

                <div className="mb-1.5 flex items-center justify-between">

                  <label
                    htmlFor="login-password"
                    className="text-xs font-bold text-gray-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-orange-600 transition-all duration-200 hover:text-orange-700 hover:underline"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="group relative">

                  <LockKeyhole
                    size={18}
                    className={`pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-all duration-300 ${
                      errors.password
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:scale-110 group-focus-within:text-orange-500"
                    }`}
                  />

                  <input
                    id="login-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-md focus:-translate-y-0.5 focus:border-orange-400 focus:bg-white focus:shadow-lg focus:ring-4 focus:ring-orange-100 ${
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
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:scale-105 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="mt-1 animate-[fadeIn_.2s_ease-out] text-[11px] font-medium text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* ================= REMEMBER ================= */}

              <div className="flex items-center justify-between pt-1">

                <label className="group flex cursor-pointer items-center gap-2">

                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-orange-600 transition-transform duration-200 hover:scale-110 focus:ring-2 focus:ring-orange-400"
                  />

                  <span className="text-[11px] font-medium text-gray-500 transition-colors group-hover:text-gray-700">
                    Keep me signed in
                  </span>

                </label>

                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">

                  <ShieldCheck size={13} />

                  Secure login

                </div>

              </div>

              {/* ================= BUTTON ================= */}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-3 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-orange-400/40 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {/* Animated shine */}

                <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[180%]" />

                {/* Glow */}

                <span className="absolute inset-0 rounded-xl opacity-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] transition-opacity duration-300 group-hover:opacity-100" />

                <span className="relative flex items-center gap-2">

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}

                </span>

              </button>

            </form>

            {/* ================= REGISTER ================= */}

            <p className="mt-4 text-center text-xs text-gray-500 sm:text-sm">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-bold text-orange-600 transition-all duration-200 hover:text-orange-700 hover:underline"
              >
                Create account
              </Link>

            </p>

          </div>

        </div>

      </div>

      {/* ================= ANIMATIONS ================= */}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.98);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.7);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }

            25% {
              transform: translateX(-5px);
            }

            75% {
              transform: translateX(5px);
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