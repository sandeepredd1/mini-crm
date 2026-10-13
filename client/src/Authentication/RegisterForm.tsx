import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import type { RegisterErrors, RegisterValues } from "./Register";

interface RegisterFormProps {
  form: RegisterValues;
  errors: RegisterErrors;
  error: string;
  loading: boolean;
  passwordStrength: { label: string; width: string };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function RegisterForm({
  form,
  errors,
  error,
  loading,
  passwordStrength,
  onChange,
  onSubmit,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      {error && (
        <div role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium leading-4 text-red-600">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate className="space-y-2.5">
        <div>
          <label htmlFor="register-name" className="mb-1 block text-xs font-bold text-gray-700">Full name</label>
          <div className="group relative">
            <User size={16} className={`pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 ${errors.name ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500"}`} />
            <input id="register-name" name="name" type="text" autoComplete="name" value={form.name} onChange={onChange} placeholder="Enter your full name" className={inputClass(errors.name, "pr-3")} />
          </div>
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1 block text-xs font-bold text-gray-700">Email address</label>
          <div className="group relative">
            <Mail size={16} className={`pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 ${errors.email ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500"}`} />
            <input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} placeholder="Enter your email" className={inputClass(errors.email, "pr-10")} />
            {form.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
              <CheckCircle2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
            )}
          </div>
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </div>

        <PasswordField
          id="register-password"
          name="password"
          label="Password"
          value={form.password}
          error={errors.password}
          visible={showPassword}
          onVisibilityChange={() => setShowPassword((visible) => !visible)}
          onChange={onChange}
          placeholder="Create a password"
        >
          {form.password && (
            <div className="mt-1">
              <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 transition-all duration-300" style={{ width: passwordStrength.width }} />
              </div>
              <p className="mt-0.5 text-right text-[9px] font-medium text-gray-400">{passwordStrength.label}</p>
            </div>
          )}
        </PasswordField>

        <PasswordField
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          visible={showConfirmPassword}
          onVisibilityChange={() => setShowConfirmPassword((visible) => !visible)}
          onChange={onChange}
          placeholder="Confirm your password"
        />

        <button type="submit" disabled={loading} className="group relative mt-2 flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-orange-400/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
          <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[180%]" />
          <span className="relative flex items-center gap-2">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account...
              </>
            ) : (
              <>Create account <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" /></>
            )}
          </span>
        </button>
      </form>
      <p className="mt-3 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-orange-600 transition-colors hover:text-orange-700 hover:underline">Sign in</Link>
      </p>
    </>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  error,
  visible,
  onVisibilityChange,
  onChange,
  placeholder,
  children,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  visible: boolean;
  onVisibilityChange: () => void;
  onChange: RegisterFormProps["onChange"];
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-gray-700">{label}</label>
      <div className="group relative">
        <LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500" />
        <input id={id} name={name} type={visible ? "text" : "password"} autoComplete="new-password" value={value} onChange={onChange} placeholder={placeholder} className={inputClass(error, "pr-11")} />
        <button type="button" onClick={onVisibilityChange} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-600">
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {children}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 text-[10px] font-medium text-red-500">{children}</p>;
}

function inputClass(error: string | undefined, padding: string) {
  return `h-10.5 w-full rounded-xl border bg-white pl-10 ${padding} text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus:-translate-y-0.5 focus:border-orange-400 focus:shadow-lg focus:ring-4 focus:ring-orange-100 ${
    error ? "border-red-300 ring-4 ring-red-100" : "border-gray-200"
  }`;
}
