
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import AuthVisualBackground from "../components/auth/AuthVisualBackground";
import RegisterForm from "./RegisterForm";

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const password = form.password;

    if (!password) {
      return { label: "", width: "0%" };
    }

    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;

    if (score <= 1) {
      return { label: "Weak", width: "25%" };
    }

    if (score === 2) {
      return { label: "Medium", width: "50%" };
    }

    if (score === 3) {
      return { label: "Strong", width: "75%" };
    }

    return { label: "Very strong", width: "100%" };
  }, [form.password]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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

    const nextErrors: RegisterErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      nextErrors.name = "Full name is required";
    } else if (name.length < 2) {
      nextErrors.name = "Name must contain at least 2 characters";
    }

    if (!email) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must contain at least 8 characters";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Axios baseURL already includes /api.
      const response = await api.post("/auth/register", {
        name,
        email,
        password: form.password,
      });

      console.log("Registration successful:", response.status);

      navigate("/login", {
        state: {
          message: "Account created successfully. Please log in.",
        },
      });
    } catch (requestError: unknown) {
      if (axios.isAxiosError<{ message?: string }>(requestError)) {
        const status = requestError.response?.status;
        const message = requestError.response?.data?.message;

        if (status === 409) {
          setError(
            message || "An account with this email already exists."
          );
        } else if (status === 400) {
          setError(
            message || "Please check your registration details."
          );
        } else if (status === 404) {
          setError(
            "Registration endpoint not found. Check the deployed backend route."
          );
        } else if (status === 500) {
          setError(
            message || "Server error. Please try again later."
          );
        } else if (!requestError.response) {
          setError(
            "Unable to reach the server. Please check your connection and try again."
          );
        } else {
          setError(
            message || "Unable to create your account. Please try again."
          );
        }

        console.error("Registration API error:", {
          status,
          message,
          baseURL: requestError.config?.baseURL,
          url: requestError.config?.url,
        });
      } else {
        setError("An unexpected error occurred. Please try again.");
        console.error("Registration error:", requestError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-4">
      <AuthVisualBackground />

      <div className="relative z-10 w-full max-w-[410px] animate-[fadeIn_.6s_ease-out]">
        <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 blur-xl" />

        <section className="group relative overflow-hidden rounded-[26px] border border-orange-100 bg-white/90 p-5 shadow-[0_25px_75px_rgba(234,88,12,0.16)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_85px_rgba(234,88,12,0.22)] sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-300/15 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-amber-300/15 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          <div className="relative">
            <header className="mb-3 text-center">
              <h1 className="bg-gradient-to-r from-gray-900 via-orange-700 to-gray-900 bg-clip-text text-[25px] font-extrabold tracking-tight text-transparent sm:text-[28px]">
                Create account
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Create your Mini CRM account
              </p>
            </header>

            <RegisterForm
              form={form}
              errors={errors}
              error={error}
              loading={loading}
              passwordStrength={passwordStrength}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
