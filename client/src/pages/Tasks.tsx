import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckSquare,
  Circle,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import api from "../services/api";
import type { Customer, DealStage, TaskPriority } from "../types";

interface DealOption {
  _id: string;
  title: string;
  stage: DealStage;
  customerId?: Pick<Customer, "_id" | "name" | "company"> | string | null;
}

interface TaskRecord {
  _id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  customerId?: Customer | null;
  dealId?: DealOption | null;
}

interface TaskForm {
  title: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  customerId: string;
  dealId: string;
}

const blankForm: TaskForm = {
  title: "",
  dueDate: "",
  priority: "Medium",
  completed: false,
  customerId: "",
  dealId: "",
};

const filters = ["all", "today", "upcoming", "overdue", "completed"];
const priorities: TaskPriority[] = ["Low", "Medium", "High"];

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isOverdue(task: TaskRecord): boolean {
  return !task.completed && task.dueDate.slice(0, 10) < localDateKey();
}

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "all";
  const customerFilter = searchParams.get("customerId") ?? "";
  const searchFilter = (searchParams.get("search") ?? "").trim().toLowerCase();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<DealOption[]>([]);
  const [relationsLoading, setRelationsLoading] = useState(true);
  const [relationsError, setRelationsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [form, setForm] = useState<TaskForm>(blankForm);
  const filteredTasks = searchFilter
    ? tasks.filter((task) =>
        task.title.toLowerCase().includes(searchFilter) ||
        (task.customerId?.name.toLowerCase().includes(searchFilter) ?? false) ||
        (task.dealId?.title.toLowerCase().includes(searchFilter) ?? false)
      )
    : tasks;

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get<{ tasks: TaskRecord[] }>("/api/tasks", {
        params: {
          ...(statusFilter === "all" ? {} : { status: statusFilter }),
          ...(customerFilter ? { customerId: customerFilter } : {}),
        },
      }),
      api.get<{ customers: Customer[] }>("/api/customers", {
        params: { limit: 100 },
      }),
      api.get<{ deals: DealOption[] }>("/api/deals"),
    ])
      .then(([taskResult, customerResult, dealResult]) => {
        if (!active) return;
        const relationshipFailures: string[] = [];
        if (taskResult.status === "fulfilled") {
          setError("");
          setTasks(taskResult.value.data.tasks);
        } else {
          setError(apiErrorMessage(taskResult.reason, "Unable to load tasks. Please try again."));
        }
        if (customerResult.status === "fulfilled") {
          setCustomers(customerResult.value.data.customers);
        } else {
          relationshipFailures.push(apiErrorMessage(customerResult.reason, "Unable to load customers."));
        }
        if (dealResult.status === "fulfilled") {
          setDeals(dealResult.value.data.deals);
        } else {
          relationshipFailures.push(apiErrorMessage(dealResult.reason, "Unable to load deals."));
        }
        setRelationsError(relationshipFailures.length ? relationshipFailures.join(" ") : "");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRelationsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [customerFilter, reloadKey, statusFilter]);

  const openForm = (task?: TaskRecord) => {
    setError("");
    setEditingTask(task ?? null);
    setForm(
      task
        ? {
            title: task.title,
            dueDate: task.dueDate.slice(0, 10),
            priority: task.priority,
            completed: task.completed,
            customerId: task.customerId?._id ?? "",
            dealId: task.dealId?._id ?? "",
          }
        : { ...blankForm }
    );
    setModalOpen(true);
  };

  const saveTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        dueDate: new Date(`${form.dueDate}T12:00:00.000Z`).toISOString(),
        customerId: form.customerId || undefined,
        dealId: form.dealId || undefined,
      };
      if (editingTask) await api.put(`/api/tasks/${editingTask._id}`, payload);
      else await api.post("/api/tasks", payload);
      setModalOpen(false);
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Unable to save this task."));
    } finally {
      setSaving(false);
    }
  };

  const toggleCompleted = async (task: TaskRecord) => {
    setError("");
    try {
      await api.put(`/api/tasks/${task._id}`, {
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        completed: !task.completed,
        customerId: task.customerId?._id,
        dealId: task.dealId?._id,
      });
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Unable to update task."));
    }
  };

  const deleteTask = async (task: TaskRecord) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setError("");
    try {
      await api.delete(`/api/tasks/${task._id}`);
      setTasks((current) => current.filter((item) => item._id !== task._id));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Unable to delete this task."));
    }
  };

  const dealsForCustomer = form.customerId
    ? deals.filter((deal) => {
        const dealCustomerId =
          typeof deal.customerId === "string"
            ? deal.customerId
            : deal.customerId?._id;
        return !dealCustomerId || dealCustomerId === form.customerId;
      })
    : deals;

  const setFilter = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next);
  };
  const openTasksInView = filteredTasks.filter((task) => !task.completed).length;
  const overdueTasksInView = filteredTasks.filter(isOverdue).length;
  const highPriorityInView = filteredTasks.filter(
    (task) => !task.completed && task.priority === "High"
  ).length;

  return (
    <section className="tasks-page min-h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(251,146,60,0.10),_transparent_38%),linear-gradient(135deg,#f8fafc,#f8fafc_55%,#fff7ed)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="relative isolate mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#111827] via-[#263247] to-[#63362d] p-5 text-white shadow-2xl shadow-orange-950/10 sm:p-7" style={{ animation: "pageRise .45s ease-out both" }}>
          <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
                <CheckSquare size={15} /> Daily focus
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Tasks that move you forward</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
                Prioritize follow-ups, stay ahead of due dates, and keep every promise on track.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-28 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Open in view</p>
                <p className="mt-1 text-lg font-bold">{openTasksInView}</p>
              </div>
              <div className={`min-w-28 rounded-xl border px-4 py-3 backdrop-blur ${overdueTasksInView ? "border-rose-200/20 bg-rose-300/10" : "border-white/10 bg-white/[0.08]"}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Overdue</p>
                <p className={`mt-1 text-lg font-bold ${overdueTasksInView ? "text-rose-200" : "text-white"}`}>{overdueTasksInView}</p>
              </div>
              <button
                type="button"
                onClick={() => openForm()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-50"
              >
                <Plus size={17} /> Add task
              </button>
            </div>
          </div>
          {highPriorityInView > 0 && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-200/15 bg-orange-300/10 px-3 py-1.5 text-xs font-medium text-orange-100">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
              {highPriorityInView} high-priority {highPriorityInView === 1 ? "task" : "tasks"} to focus on
            </p>
          )}
        </header>

        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-orange-100/80 bg-white/80 p-3 pb-3 shadow-sm backdrop-blur" style={{ animation: "pageRise .45s ease-out .06s both" }}>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setFilter(filter)}
              aria-pressed={statusFilter === filter}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition duration-200 hover:-translate-y-0.5 ${
                statusFilter === filter
                  ? "border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/70"
                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {error && !modalOpen && <ErrorBanner message={error} />}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-3xl border border-orange-100 bg-white/80 text-sm text-slate-500 shadow-sm">
            <LoaderCircle className="animate-spin text-orange-500" size={20} /> Loading tasks…
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-white/90 px-6 py-16 text-center shadow-lg shadow-orange-100/40" style={{ animation: "pageRise .4s ease-out both" }}>
            <CheckSquare className="mx-auto text-orange-400" size={36} />
            <h2 className="mt-4 text-lg font-bold text-slate-900">{searchFilter ? "No matching tasks" : "No tasks found"}</h2>
            <p className="mt-1 text-sm text-slate-500">{searchFilter ? "Try a different search term." : "Create a task or switch to another filter."}</p>
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
              <button type="button" onClick={() => openForm()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white">
                <Plus size={16} /> Create a task
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.035]" style={{ animation: "pageRise .4s ease-out both" }}>
            <ul className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <li key={task._id} className="group flex flex-wrap items-center gap-3 px-4 py-4 transition duration-200 hover:bg-orange-50/50 sm:flex-nowrap sm:px-5">
                    <button
                      type="button"
                      onClick={() => void toggleCompleted(task)}
                      aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition duration-200 group-hover:scale-105 ${task.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-orange-400 hover:bg-orange-50"}`}
                    >
                      {task.completed ? <Check size={16} /> : <Circle size={16} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-semibold ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {[task.customerId?.name, task.dealId?.title].filter(Boolean).join(" · ") || "No linked customer or deal"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${task.priority === "High" ? "bg-rose-50 text-rose-700" : task.priority === "Low" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>{task.priority}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${overdue ? "text-rose-600" : "text-slate-500"}`}>
                      <CalendarDays size={14} />
                      {overdue ? "Overdue · " : ""}{new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <div className="ml-auto flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => openForm(task)} aria-label={`Edit ${task.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600"><Pencil size={16} /></button>
                      <button type="button" onClick={() => void deleteTask(task)} aria-label={`Delete ${task.title}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setModalOpen(false);
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="task-form-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 id="task-form-title" className="text-xl font-bold text-slate-900">{editingTask ? "Edit task" : "New task"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} disabled={saving} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {error && <ErrorBanner message={error} />}
            {relationsError && (
              <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {relationsError}{" "}
                <button
                  type="button"
                  className="font-bold underline"
                  onClick={() => {
                    setRelationsLoading(true);
                    setReloadKey((current) => current + 1);
                  }}
                >
                  Try again
                </button>
              </div>
            )}
            <form onSubmit={saveTask} className="space-y-4">
              <FormField label="Task title"><input required minLength={2} maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="Follow up with the customer" /></FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Due date"><input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className={inputClass} /></FormField>
                <FormField label="Priority"><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })} className={inputClass}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></FormField>
              </div>
              <div>
                <FormField label="Customer (optional)">
                  <select
                    disabled={relationsLoading || customers.length === 0}
                    value={form.customerId}
                    onChange={(event) => {
                      const customerId = event.target.value;
                      const selectedDeal = deals.find((deal) => deal._id === form.dealId);
                      const selectedDealCustomerId = selectedDeal
                        ? typeof selectedDeal.customerId === "string"
                          ? selectedDeal.customerId
                          : selectedDeal.customerId?._id
                        : undefined;
                      setForm({
                        ...form,
                        customerId,
                        dealId:
                          customerId &&
                          selectedDealCustomerId &&
                          selectedDealCustomerId !== customerId
                            ? ""
                            : form.dealId,
                      });
                    }}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                  >
                    <option value="">
                      {relationsLoading
                        ? "Loading customers…"
                        : customers.length
                          ? "No customer linked"
                          : "No customers available"}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} · {customer.company}
                      </option>
                    ))}
                  </select>
                </FormField>
                {!relationsLoading && customers.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {relationsError ? "" : "No customers available. "}
                    <Link to="/customers" className="font-bold text-orange-600 underline hover:text-orange-700">
                      Add a customer
                    </Link>
                  </p>
                )}
              </div>
              <FormField label="Deal (optional)">
                <select
                  disabled={relationsLoading || dealsForCustomer.length === 0}
                  value={form.dealId}
                  onChange={(event) => {
                    const dealId = event.target.value;
                    const selectedDeal = deals.find((deal) => deal._id === dealId);
                    const dealCustomerId = selectedDeal
                      ? typeof selectedDeal.customerId === "string"
                        ? selectedDeal.customerId
                        : selectedDeal.customerId?._id
                      : undefined;
                    setForm({
                      ...form,
                      dealId,
                      ...(dealCustomerId ? { customerId: dealCustomerId } : {}),
                    });
                  }}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                >
                  <option value="">
                    {relationsLoading
                      ? "Loading deals…"
                      : dealsForCustomer.length
                        ? "No deal linked"
                        : form.customerId
                          ? "No deals for this customer"
                          : "No deals available"}
                  </option>
                  {dealsForCustomer.map((deal) => (
                    <option key={deal._id} value={deal._id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </FormField>
              {!relationsLoading && dealsForCustomer.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {form.customerId
                    ? "No deals are linked to this customer. "
                    : "No deals available. "}
                  <Link to="/deals" className="font-bold text-orange-600 underline hover:text-orange-700">
                    Create a deal
                  </Link>
                </p>
              )}
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.completed} onChange={(event) => setForm({ ...form, completed: event.target.checked })} className="h-4 w-4 accent-orange-500" /> Mark as completed</label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={saving} onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save task"}</button>
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
          .tasks-page [style*="animation"] { animation: none !important; }
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
  return <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={17} />{message}</div>;
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}
