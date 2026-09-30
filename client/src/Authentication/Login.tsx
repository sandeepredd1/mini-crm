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

  const [errors, setErrors] = useState<FormErrors>(
    {}
  );

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const email = form.email.trim();
    const password = form.password;

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#f8f7ff] to-[#fdf2f8] px-4 py-6 sm:px-6">
      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main glow */}

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-300/25 blur-[120px]" />

        <div
          className="absolute -bottom-48 -right-40 h-[520px] w-[520px] animate-pulse rounded-full bg-pink-300/25 blur-[130px]"
          style={{
            animationDelay: "1.5s",
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-indigo-300/15 blur-[120px]"
          style={{
            animationDelay: "0.8s",
          }}
        />

        {/* Floating circles */}

        <div
          className="absolute left-[8%] top-[18%] h-16 w-16 animate-bounce rounded-full border border-white/60 bg-white/20 backdrop-blur-sm"
          style={{
            animationDuration: "5s",
          }}
        />

        <div
          className="absolute right-[9%] top-[16%] h-10 w-10 animate-bounce rounded-full border border-white/70 bg-purple-200/20 backdrop-blur-sm"
          style={{
            animationDuration: "4s",
            animationDelay: "0.5s",
          }}
        />

        <div
          className="absolute bottom-[15%] left-[12%] h-8 w-8 animate-bounce rounded-full border border-white/60 bg-pink-200/20"
          style={{
            animationDuration: "4.5s",
            animationDelay: "1s",
          }}
        />

        <div
          className="absolute bottom-[20%] right-[15%] h-20 w-20 animate-spin rounded-[28px] border border-white/60 bg-white/20 backdrop-blur-sm"
          style={{
            animationDuration: "15s",
          }}
        />

        {/* Small glowing dots */}

        <div className="absolute left-[18%] top-[35%] h-2 w-2 animate-ping rounded-full bg-purple-500" />

        <div
          className="absolute right-[20%] top-[40%] h-2 w-2 animate-ping rounded-full bg-pink-500"
          style={{
            animationDelay: "1s",
          }}
        />

        <div
          className="absolute bottom-[30%] left-[25%] h-1.5 w-1.5 animate-ping rounded-full bg-indigo-500"
          style={{
            animationDelay: "2s",
          }}
        />

        {/* Decorative lines */}

        <div className="absolute left-0 top-1/2 h-px w-[25%] bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

        <div className="absolute right-0 top-1/2 h-px w-[25%] bg-gradient-to-l from-transparent via-pink-300/40 to-transparent" />
      </div>

      {/* ================= LOGIN CONTAINER ================= */}

      <div className="relative z-10 w-full max-w-[430px] animate-[fadeIn_.7s_ease-out]">
        {/* Card shadow/glow */}

        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-purple-500/20 via-indigo-500/10 to-pink-500/20 blur-xl" />

        {/* ================= CARD ================= */}

        <div className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/70 p-6 shadow-[0_30px_90px_rgba(76,29,149,0.16)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_100px_rgba(76,29,149,0.22)] sm:p-8">
          {/* Card shine */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl transition-all duration-700 group-hover:scale-125" />

          {/* Top shine line */}

          <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white to-transparent" />

          <div className="relative">
            {/* ================= HEADER ================= */}

            <div className="mb-6 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <h1 className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-[30px] font-extrabold tracking-tight text-transparent sm:text-[34px]">
                  Welcome back
                </h1>
              </div>
            </div>

            {/* ================= SERVER ERROR ================= */}

            {error && (
              <div className="mb-4 flex animate-[shake_.4s_ease-in-out] items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 shadow-sm">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xs font-bold text-red-600">
                    !
                  </span>
                </div>

                <p className="text-sm leading-5 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* ================= EMAIL ================= */}

              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-[13px] font-bold text-gray-700"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={18}
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-all duration-300 ${
                      errors.email
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:scale-110 group-focus-within:text-purple-500"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 animate-[scaleIn_.2s_ease-out] text-emerald-500"
                      />
                    )}
                </div>

                {errors.email && (
                  <p className="mt-1.5 animate-[fadeIn_.2s_ease-out] text-xs font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* ================= PASSWORD ================= */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-[13px] font-bold text-gray-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-purple-600 transition-all duration-200 hover:text-pink-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="group relative">
                  <LockKeyhole
                    size={18}
                    className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-all duration-300 ${
                      errors.password
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:scale-110 group-focus-within:text-purple-500"
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
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:scale-105 hover:bg-purple-50 hover:text-purple-600 active:scale-95"
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
                  <p className="mt-1.5 animate-[fadeIn_.2s_ease-out] text-xs font-medium text-red-500">
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
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-purple-600 transition-transform duration-200 hover:scale-110 focus:ring-2 focus:ring-purple-400"
                  />

                  <span className="text-xs font-medium text-gray-500 transition-colors group-hover:text-gray-700">
                    Keep me signed in
                  </span>
                </label>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <ShieldCheck size={13} />
                  Secure login
                </div>
              </div>

              {/* ================= BUTTON ================= */}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-5 flex h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-400/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-400/40 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {/* Animated shine */}

                <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[180%]" />

                {/* Glow */}

                <span className="absolute inset-0 rounded-2xl opacity-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] transition-opacity duration-300 group-hover:opacity-100" />

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

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-bold text-purple-600 transition-all duration-200 hover:text-pink-600 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}