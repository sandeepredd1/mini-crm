import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import api from "../services/api";
import type { Customer, DealStage, TaskPriority } from "../types";

interface RelatedDeal {
  _id: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
}

interface RelatedTask {
  _id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  dealId?: { title: string } | null;
}

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [deals, setDeals] = useState<RelatedDeal[]>([]);
  const [tasks, setTasks] = useState<RelatedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!id) return () => {
      active = false;
    };
    Promise.all([
        api.get<{ customer: Customer }>(`/api/customers/${id}`),
        api.get<{ deals: RelatedDeal[] }>("/api/deals", {
          params: { customerId: id },
        }),
        api.get<{ tasks: RelatedTask[] }>("/api/tasks", {
          params: { customerId: id },
        }),
      ])
      .then(([customerResponse, dealsResponse, tasksResponse]) => {
        if (!active) return;
        setError("");
        setCustomer(customerResponse.data.customer);
        setDeals(dealsResponse.data.deals);
        setTasks(tasksResponse.data.tasks);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const status =
          typeof requestError === "object" &&
          requestError !== null &&
          "response" in requestError
            ? (requestError as { response?: { status?: number } }).response?.status
            : undefined;
        setError(
          status === 404
            ? "This customer could not be found."
            : apiErrorMessage(requestError, "Unable to load customer details.")
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">
        Loading customer details…
      </div>
    );
  }

  if (error || !customer) {
    return (
      <section className="p-4 sm:p-8">
        <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm">
          <AlertCircle className="mx-auto text-rose-500" size={30} />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Unable to open customer</h1>
          <p className="mt-2 text-sm text-slate-600">{error || "Customer not found."}</p>
          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={() => { setLoading(true); setReloadKey((current) => current + 1); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"><RefreshCw size={15} /> Try again</button>
            <button type="button" onClick={() => navigate("/customers")} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">Customers</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/customers" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-900">
          <ArrowLeft size={16} /> Back to customers
        </Link>

        <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-2xl font-black text-white">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black text-slate-900">{customer.name}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Building2 size={15} />{customer.company}</p>
              </div>
            </div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${customer.status === "active" ? "bg-emerald-50 text-emerald-700" : customer.status === "inactive" ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-700"}`}>{customer.status}</span>
          </div>
          <div className="mt-6 grid gap-3 border-t border-orange-50 pt-5 sm:grid-cols-2">
            <a href={`mailto:${customer.email}`} className="flex min-w-0 items-center gap-3 rounded-xl bg-orange-50/60 p-3 text-sm text-slate-700"><Mail size={17} className="shrink-0 text-orange-500" /><span className="truncate">{customer.email}</span></a>
            <a href={`tel:${customer.phone}`} className="flex items-center gap-3 rounded-xl bg-orange-50/60 p-3 text-sm text-slate-700"><Phone size={17} className="shrink-0 text-orange-500" />{customer.phone}</a>
          </div>
          {customer.notes && <div className="mt-5 border-t border-orange-50 pt-5"><h2 className="text-sm font-bold text-slate-700">Notes</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{customer.notes}</p></div>}
        </article>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-lg font-bold text-slate-900">Deals</h2><p className="text-xs text-slate-500">{deals.length} linked {deals.length === 1 ? "deal" : "deals"}</p></div>
              <Link to={`/deals?customerId=${customer._id}`} className="text-sm font-semibold text-orange-600 hover:text-orange-800">View pipeline</Link>
            </div>
            {deals.length ? (
              <ul className="divide-y divide-orange-50">
                {deals.map((deal) => (
                  <li key={deal._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{deal.title}</p><p className="mt-1 text-xs text-slate-500">Expected {new Date(deal.expectedCloseDate).toLocaleDateString()}</p></div>
                    <div className="shrink-0 text-right"><p className="text-sm font-bold text-slate-900">₹{deal.value.toLocaleString("en-IN")}</p><p className="text-xs text-slate-500">{deal.stage}</p></div>
                  </li>
                ))}
              </ul>
            ) : <EmptyMessage icon={<Building2 size={18} />} message="No deals are linked to this customer yet." />}
          </section>

          <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-lg font-bold text-slate-900">Tasks</h2><p className="text-xs text-slate-500">{tasks.filter((task) => !task.completed).length} open tasks</p></div>
              <Link to={`/tasks?customerId=${customer._id}`} className="text-sm font-semibold text-orange-600 hover:text-orange-800">View tasks</Link>
            </div>
            {tasks.length ? (
              <ul className="divide-y divide-orange-50">
                {tasks.map((task) => (
                  <li key={task._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0"><p className={`truncate text-sm font-semibold ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</p><p className="mt-1 truncate text-xs text-slate-500">{task.dealId?.title ?? "Customer task"} · {task.priority}</p></div>
                    <span className={`inline-flex shrink-0 items-center gap-1 text-xs ${!task.completed && task.dueDate.slice(0, 10) < localDateKey() ? "text-rose-600" : "text-slate-500"}`}><CalendarDays size={13} />{new Date(task.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyMessage icon={<UserRound size={18} />} message="No tasks are linked to this customer yet." />}
          </section>
        </div>
      </div>
    </section>
  );
}

function EmptyMessage({ icon, message }: { icon: React.ReactNode; message: string }) {
  return <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-4 text-center text-sm text-slate-500">{icon}<p className="mt-2">{message}</p></div>;
}

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}
