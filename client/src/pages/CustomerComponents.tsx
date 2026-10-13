import type { ChangeEvent, FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  Flame,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { Customer, CustomerStatus } from "../types";

export type CustomerForm = Pick<
  Customer,
  "name" | "company" | "email" | "phone" | "status" | "notes"
>;

interface ToolbarProps {
  search: string;
  statusFilter: string;
  error: string;
  success: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAdd: () => void;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

export function CustomerToolbar({
  search,
  statusFilter,
  error,
  success,
  onSearchChange,
  onStatusChange,
  onAdd,
  onDismissError,
  onDismissSuccess,
}: ToolbarProps) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-200">
            <Users size={25} />
          </div>
          <div>
            <p className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-orange-600">
              <Flame size={15} /> CRM Management
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Customers</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your customers and relationships</p>
          </div>
        </div>
        <button type="button" onClick={onAdd} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200">
          <Plus size={18} /> Add Customer
        </button>
      </header>

      {success && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle2 size={18} /><span>{success}</span>
          <button type="button" onClick={onDismissSuccess} aria-label="Dismiss success" className="ml-auto rounded-lg p-1 hover:bg-green-100"><X size={17} /></button>
        </div>
      )}
      {error && (
        <div role="alert" className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} /><span>{error}</span>
          <button type="button" onClick={onDismissError} aria-label="Dismiss error" className="ml-auto rounded-lg p-1 hover:bg-red-100"><X size={17} /></button>
        </div>
      )}

      <div className="mb-7 rounded-3xl border border-orange-100 bg-white p-4 shadow-xl shadow-orange-100/50">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search customers</span>
            <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search customers, companies or emails..."
              className="w-full rounded-xl border border-orange-100 bg-orange-50/40 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </label>
          <label>
            <span className="sr-only">Filter by customer status</span>
            <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)} className="w-full rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 md:w-48">
              <option value="All">All Status</option>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </div>
    </>
  );
}

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  search: string;
  statusFilter: string;
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  deletingId: string;
}

export function CustomerList({
  customers,
  loading,
  search,
  statusFilter,
  onAdd,
  onView,
  onEdit,
  onDelete,
  deletingId,
}: CustomerListProps) {
  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading customers">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="animate-pulse rounded-3xl border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/50">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-100" />
              <div className="flex-1"><div className="mb-2 h-4 w-32 rounded bg-orange-100" /><div className="h-3 w-24 rounded bg-orange-100" /></div>
            </div>
            <div className="mb-3 h-3 w-full rounded bg-orange-50" />
            <div className="h-3 w-4/5 rounded bg-orange-50" />
          </div>
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-white px-6 py-20 text-center shadow-xl shadow-orange-100/50">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-500">
          <UserRound size={34} />
        </div>
        <h2 className="text-xl font-black text-slate-900">No customers found</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {search || statusFilter !== "All" ? "Try changing your search or filter." : "Start adding customers to your CRM."}
        </p>
        {!search && statusFilter === "All" && (
          <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white">
            <UserPlus size={17} /> Add Your First Customer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard
          key={customer._id}
          customer={customer}
          deleting={deletingId === customer._id}
          onView={() => onView(customer._id)}
          onEdit={() => onEdit(customer)}
          onDelete={() => onDelete(customer._id)}
        />
      ))}
    </div>
  );
}

function CustomerCard({
  customer,
  deleting,
  onView,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  deleting: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusClass: Record<CustomerStatus, string> = {
    active: "bg-green-50 text-green-600 ring-1 ring-green-100",
    inactive: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    lead: "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
  };
  return (
    <article className="group rounded-3xl border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-black text-white">{customer.name.charAt(0).toUpperCase()}</div>
          <div className="min-w-0">
            <h2 className="truncate font-black text-slate-900">{customer.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500"><Building2 size={12} /><span className="truncate">{customer.company}</span></p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${statusClass[customer.status]}`}>{customer.status}</span>
      </div>
      <div className="space-y-3 border-t border-orange-50 pt-4">
        <div className="flex min-w-0 items-center gap-3 text-sm text-slate-600"><Mail size={15} className="shrink-0 text-orange-500" /><span className="truncate">{customer.email}</span></div>
        <div className="flex items-center gap-3 text-sm text-slate-600"><Phone size={15} className="shrink-0 text-amber-600" /><span>{customer.phone}</span></div>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-orange-50 pt-4">
        <button type="button" onClick={onView} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-100"><Eye size={15} /> View</button>
        <button type="button" onClick={onEdit} aria-label={`Edit ${customer.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil size={15} /></button>
        <button type="button" onClick={onDelete} disabled={deleting} aria-label={`Delete ${customer.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50">
          {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
    </article>
  );
}

export interface CustomerFormModalProps {
  form: CustomerForm;
  editing: boolean;
  saving: boolean;
  error: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function CustomerFormModal({
  form,
  editing,
  saving,
  error,
  onChange,
  onSubmit,
  onClose,
}: CustomerFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="customer-form-title" className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-900/20">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-50 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              {editing ? <Pencil size={19} /> : <UserPlus size={19} />}
            </div>
            <div>
              <h2 id="customer-form-title" className="text-xl font-black text-slate-900">{editing ? "Edit Customer" : "Add Customer"}</h2>
              <p className="mt-1 text-xs text-slate-500">{editing ? "Update customer information" : "Create a new customer record"}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close form" className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 disabled:opacity-50"><X size={18} /></button>
        </header>
        <form onSubmit={onSubmit} className="space-y-5 p-6">
          {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput label="Name" name="name" value={form.name} onChange={onChange} placeholder="Jordan Lee" autoComplete="name" />
            <FormInput label="Company" name="company" value={form.company} onChange={onChange} placeholder="Northstar Studio" />
            <FormInput label="Email" name="email" value={form.email} onChange={onChange} placeholder="jordan@example.com" type="email" autoComplete="email" />
            <FormInput label="Phone" name="phone" value={form.phone} onChange={onChange} placeholder="+1 555 010 1234" autoComplete="tel" />
          </div>
          <label className="block text-sm font-bold text-slate-700">
            Status
            <select name="status" value={form.status} onChange={onChange} className={inputClass}>
              <option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Notes
            <textarea name="notes" value={form.notes} onChange={onChange} rows={4} maxLength={2000} placeholder="Add notes about this customer..." className={`${inputClass} resize-none`} />
          </label>
          <div className="flex gap-3 border-t border-orange-50 pt-5">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-orange-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-orange-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : editing ? "Update Customer" : "Create Customer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: CustomerFormModalProps["onChange"];
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input required name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className={inputClass} />
    </label>
  );
}

const inputClass = "mt-2 w-full rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100";
