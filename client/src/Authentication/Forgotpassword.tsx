import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Add your forgot-password API here when backend is ready.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        html,
        body,
        #root {
          height: 100%;
          margin: 0;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .scale-in {
          animation: scaleIn 0.5s ease-out;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">

        {/* Background Decorations */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />

        {/* Main Card */}
        <div className="relative z-10 w-full max-w-[420px] scale-in">

          <div className="rounded-3xl border border-orange-100 bg-white/95 p-6 shadow-2xl shadow-orange-200/40 backdrop-blur-xl sm:p-8">

           

            {/* Heading */}
            <div className="mb-6 text-center fade-in">
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Enter your email to reset your password
              </p>
            </div>

            {sent ? (
              /* Success State */
              <div className="fade-in text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Reset Link Sent
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  If an account exists for{" "}
                  <span className="font-medium text-gray-700">
                    {email}
                  </span>
                  , you will receive a password reset link.
                </p>

                <Link
                  to="/login"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-amber-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            ) : (
              /* Form */
              <form
                onSubmit={handleSubmit}
                className="space-y-5 fade-in"
              >
                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                {/* Back Login */}
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-orange-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </form>
            )}
          </div>

        
        </div>
      </div>
    </>
  );
}