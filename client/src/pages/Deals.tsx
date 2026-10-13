import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  BriefcaseBusiness,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import api from "../services/api";
import type { Customer, DealStage } from "../types";

interface DealRecord {
  _id: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
  customerId: Customer;
}

interface DealForm {
  title: string;
  value: string;
  stage: DealStage;
  expectedCloseDate: string;
  customerId: string;
}

const stages: DealStage[] = [
  "Lead",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];

const blankForm: DealForm = {
  title: "",
  value: "",
  stage: "Lead",
  expectedCloseDate: "",
  customerId: "",
};

const stageColors: Record<DealStage, string> = {
  Lead: "border-sky-200 bg-sky-50 text-sky-700",
  Qualified: "border-violet-200 bg-violet-50 text-violet-700",
  Proposal: "border-amber-200 bg-amber-50 text-amber-700",
  Won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Lost: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function Deals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFilter = searchParams.get("stage") ?? "all";
  const customerFilter = searchParams.get("customerId") ?? "";
  const searchFilter = (searchParams.get("search") ?? "").trim().toLowerCase();
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRecord | null>(null);
  const [form, setForm] = useState<DealForm>(blankForm);
  const filteredDeals = searchFilter
    ? deals.filter((deal) => deal.title.toLowerCase().includes(searchFilter))
    : deals;

  useEffect(() => {
    let active = true;
    const params = {
      ...(stageFilter === "all" ? {} : { stage: stageFilter }),
      ...(customerFilter ? { customerId: customerFilter } : {}),
    };
    Promise.allSettled([
      api.get<{ deals: DealRecord[] }>("/api/deals", { params }),
      api.get<{ customers: Customer[] }>("/api/customers", {
        params: { limit: 100 },
      }),
    ])
      .then(([dealResult, customerResult]) => {
        if (!active) return;
        if (dealResult.status === "fulfilled") {
          setError("");
          setDeals(dealResult.value.data.deals);
        } else {
          setError(apiErrorMessage(dealResult.reason, "Unable to load deals. Please try again."));
        }
        if (customerResult.status === "fulfilled") {
          setCustomersError("");
          setCustomers(customerResult.value.data.customers);
        } else {
          setCustomersError(apiErrorMessage(customerResult.reason, "Unable to load customers."));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setCustomersLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [customerFilter, reloadKey, stageFilter]);

  const openForm = (deal?: DealRecord) => {
    setError("");
    setEditingDeal(deal ?? null);
    setForm(
      deal
        ? {
            title: deal.title,
            value: String(deal.value),
            stage: deal.stage,
            expectedCloseDate: deal.expectedCloseDate.slice(0, 10),
            customerId: deal.customerId._id,
          }
        : { ...blankForm }
    );
    setModalOpen(true);
  };

  const saveDeal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        value: Number(form.value),
        expectedCloseDate: new Date(
          `${form.expectedCloseDate}T12:00:00.000Z`
        ).toISOString(),
      };
      if (editingDeal) {
        await api.put(`/api/deals/${editingDeal._id}`, payload);
      } else {
        await api.post("/api/deals", payload);
      }
      setModalOpen(false);
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Unable to save this deal."));
    } finally {
      setSaving(false);
    }
  };

  const updateStage = async (deal: DealRecord, stage: DealStage) => {
    setError("");
    try {
      await api.put(`/api/deals/${deal._id}`, {
        title: deal.title,
        value: deal.value,
        stage,
        expectedCloseDate: deal.expectedCloseDate,
        customerId: deal.customerId._id,
      });
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Unable to update deal stage."));
    }
  };

  const deleteDeal = async (deal: DealRecord) => {
    if (!window.confirm(`Delete "${deal.title}"?`)) return;
    setError("");
    setLoading(true);
    try {
      await api.delete(`/api/deals/${deal._id}`);
      setDeals((current) => current.filter((item) => item._id !== deal._id));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Unable to delete this deal."));
    }
  };

  const setFilter = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("stage");
    else next.set("stage", value);
    setSearchParams(next);
  };
  const activeDeals = filteredDeals.filter(
    (deal) => deal.stage !== "Won" && deal.stage !== "Lost"
  );
  const activePipelineValue = activeDeals.reduce(
    (total, deal) => total + deal.value,
    0
  );

  return (
    <section className="deals-page min-h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(251,146,60,0.10),_transparent_38%),linear-gradient(135deg,#f8fafc,#f8fafc_55%,#fff7ed)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative isolate mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#111827] via-[#263247] to-[#63362d] p-5 text-white shadow-2xl shadow-orange-950/10 sm:p-7" style={{ animation: "pageRise .45s ease-out both" }}>
          <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
                <BriefcaseBusiness size={15} /> Revenue workspace
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Deals pipeline</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
                Track opportunities, celebrate wins, and keep momentum moving through every stage.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-36 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Active pipeline</p>
                <p className="mt-1 text-lg font-bold">₹{activePipelineValue.toLocaleString("en-IN")}</p>
              </div>
              <div className="min-w-28 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Opportunities</p>
                <p className="mt-1 text-lg font-bold">{filteredDeals.length}</p>
              </div>
              <button
                type="button"
                onClick={() => openForm()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-50"
              >
                <Plus size={17} /> Add deal
              </button>
            </div>
          </div>
        </header>

        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-orange-100/80 bg-white/80 p-3 pb-3 shadow-sm backdrop-blur" style={{ animation: "pageRise .45s ease-out .06s both" }}>
          {["all", ...stages].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setFilter(stage)}
              aria-pressed={stageFilter === stage}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${
                stageFilter === stage
                  ? "border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/70"
                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {stage === "all" ? "All stages" : stage}
            </button>
          ))}
        </div>

        {error && !modalOpen && <ErrorBanner message={error} />}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-3xl border border-orange-100 bg-white/80 text-sm text-slate-500 shadow-sm">
            <LoaderCircle className="animate-spin text-orange-500" size={20} />
            Loading pipeline…
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-white/90 px-6 py-16 text-center shadow-lg shadow-orange-100/40" style={{ animation: "pageRise .4s ease-out both" }}>
            <BriefcaseBusiness className="mx-auto text-orange-400" size={36} />
            <h2 className="mt-4 text-lg font-bold text-slate-900">{searchFilter ? "No matching deals" : "No deals found"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {searchFilter ? "Try a different search term." : "Add an opportunity or choose another stage filter."}
            </p>
            {searchFilter ? (
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete("search");
                  setSearchParams(next);
                }}
                className="mt-5 rounded-lg border border-orange-200 px-4 py-2.5 text-sm font-semibold text-orange-700"
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openForm()}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Create a deal
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {stages
              .filter((stage) => stageFilter === "all" || stageFilter === stage)
              .map((stage, stageIndex) => {
                const stageDeals = filteredDeals.filter((deal) => deal.stage === stage);
                const totalValue = stageDeals.reduce((total, deal) => total + deal.value, 0);
                return (
                  <section key={stage} className="w-[min(82vw,300px)] shrink-0 rounded-[22px] border border-slate-200/80 bg-white/75 p-3 shadow-sm shadow-slate-900/[0.025] transition duration-200 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50 sm:p-4" style={{ animation: `pageRise .4s ease-out ${stageIndex * 55}ms both` }}>
                    <header className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50/70 px-3 py-2.5">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-slate-800">{stage}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {stageDeals.length} deals · ₹{totalValue.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${stageColors[stage].split(" ")[1]}`} />
                    </header>
                    <div className="space-y-3">
                      {stageDeals.length ? stageDeals.map((deal) => (
                        <article key={deal._id} className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="break-words text-sm font-bold text-slate-900">{deal.title}</h3>
                              <p className="mt-1 truncate text-xs text-slate-500">{deal.customerId?.name ?? "Customer"}</p>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stageColors[deal.stage]}`}>{deal.stage}</span>
                          </div>
                          <p className="mt-4 text-lg font-black text-slate-900">₹{deal.value.toLocaleString("en-IN")}</p>
                          <p className="mt-1 text-[11px] text-slate-500">Close {new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
                          <div className="mt-3 flex items-center gap-2 border-t border-orange-50 pt-3">
                            <label className="sr-only" htmlFor={`stage-${deal._id}`}>Deal stage</label>
                            <select
                              id={`stage-${deal._id}`}
                              value={deal.stage}
                              onChange={(event) => void updateStage(deal, event.target.value as DealStage)}
                              className="min-w-0 flex-1 rounded-lg border border-orange-100 bg-orange-50/50 px-2 py-2 text-xs font-semibold text-slate-700"
                            >
                              {stages.map((option) => <option key={option}>{option}</option>)}
                            </select>
                            <button type="button" onClick={() => openForm(deal)} aria-label={`Edit ${deal.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600"><Pencil size={15} /></button>
                            <button type="button" onClick={() => void deleteDeal(deal)} aria-label={`Delete ${deal.title}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>
                          </div>
                        </article>
                      )) : (
                        <div className="rounded-xl border border-dashed border-orange-200 bg-white/70 px-3 py-8 text-center text-xs text-slate-400">No deals in this stage</div>
                      )}
                    </div>
                  </section>
                );
              })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setModalOpen(false);
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="deal-form-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 id="deal-form-title" className="text-xl font-bold text-slate-900">{editingDeal ? "Edit deal" : "New deal"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} disabled={saving} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {error && <ErrorBanner message={error} />}
            <form onSubmit={saveDeal} className="space-y-4">
              <FormField label="Deal title"><input required minLength={2} maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="Website redesign" /></FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Value (₹)"><input required type="number" min="0.01" step="0.01" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} className={inputClass} placeholder="25000" /></FormField>
                <FormField label="Stage"><select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value as DealStage })} className={inputClass}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Expected close date"><input required type="date" value={form.expectedCloseDate} onChange={(event) => setForm({ ...form, expectedCloseDate: event.target.value })} className={inputClass} /></FormField>
                <div>
                  <FormField label="Customer">
                    <select
                      required
                      disabled={customersLoading || customers.length === 0}
                      value={form.customerId}
                      onChange={(event) => setForm({ ...form, customerId: event.target.value })}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                    >
                      <option value="">
                        {customersLoading ? "Loading customers…" : customers.length ? "Select a customer" : "No customers available"}
                      </option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} · {customer.company}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  {customersError ? (
                    <p role="alert" className="mt-2 text-xs text-rose-600">
                      {customersError}{" "}
                      <button type="button" className="font-bold underline" onClick={() => {
                        setCustomersLoading(true);
                        setReloadKey((current) => current + 1);
                      }}>
                        Try again
                      </button>
                    </p>
                  ) : !customersLoading && customers.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Add a customer before creating a deal.{" "}
                      <Link to="/customers" className="font-bold text-orange-600 underline hover:text-orange-700">
                        Go to customers
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={saving} onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving || customersLoading || customers.length === 0} className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save deal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pageRise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .deals-page [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

const inputClass = "w-full rounded-lg border border-orange-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-semibold text-slate-700">{label}{children}</label>;
}

function ErrorBanner({ message }: { message: string }) {
  return <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={17} />{message}<RefreshCw className="ml-auto hidden" size={14} /></div>;
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}
