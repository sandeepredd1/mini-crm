import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import api from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setComplete(true);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-8">
      <section className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-orange-100 sm:p-8">
        <h1 className="text-2xl font-black text-slate-900">Choose a new password</h1>
        {complete ? (
          <>
            <p className="mt-3 text-sm text-emerald-700">Your password has been updated.</p>
            <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white">
              <ArrowLeft size={16} /> Sign in
            </Link>
          </>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {!token && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">This reset link is missing its token.</p>}
            <label className="block text-sm font-semibold text-slate-700">
              New password
              <span className="relative mt-2 block">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={17} />
                <input type="password" required minLength={8} maxLength={100} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-orange-100 bg-orange-50/40 py-3 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
              </span>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Confirm password
              <input type="password" required minLength={8} maxLength={100} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
            </label>
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <button type="submit" disabled={loading || !token} className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              {loading ? "Updating…" : "Update password"}
            </button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          </form>
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
  return "Unable to update your password. Please try again.";
}
