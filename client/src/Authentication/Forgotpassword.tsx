import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setSent(true);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-8">
      <section className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-orange-100 sm:p-8">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-emerald-500" size={42} />
            <h1 className="mt-4 text-2xl font-black text-slate-900">Check your inbox</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              If an account exists for that address, a password reset link will arrive shortly.
            </p>
            <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-slate-900">Reset your password</h1>
            <p className="mt-2 text-sm text-slate-500">We’ll email you a one-time reset link.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <span className="relative mt-2 block">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-orange-100 bg-orange-50/40 py-3 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </span>
              </label>
              {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600">
                <ArrowLeft size={15} /> Back to sign in
              </Link>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function errorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Unable to send the reset link. Please try again.";
}
