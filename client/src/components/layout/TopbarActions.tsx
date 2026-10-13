import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Clock3,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Customer, DealStage, TaskPriority } from "../../types";

interface DealResultSource {
  _id: string;
  title: string;
  stage: DealStage;
}

interface TaskResultSource {
  _id: string;
  title: string;
  dueDate: string;
  customerId?: Pick<Customer, "_id" | "name"> | null;
}

interface SearchResult {
  id: string;
  title: string;
  detail: string;
  href: string;
  category: "Customer" | "Deal" | "Task";
}

interface NotificationTask {
  _id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
}

export default function TopbarActions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationTask[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
      if (!notificationRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 2) return;

    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchError("");
      Promise.all([
        api.get<{ customers: Customer[] }>("/api/customers", {
          params: { search: searchTerm, limit: 5 },
        }),
        api.get<{ deals: DealResultSource[] }>("/api/deals"),
        api.get<{ tasks: TaskResultSource[] }>("/api/tasks"),
      ])
        .then(([customerResponse, dealResponse, taskResponse]) => {
          if (!active) return;
          const term = searchTerm.toLowerCase();
          const customerResults: SearchResult[] = customerResponse.data.customers.map(
            (customer) => ({
              id: customer._id,
              title: customer.name,
              detail: `${customer.company} · ${customer.email}`,
              href: `/customers/${customer._id}`,
              category: "Customer",
            })
          );
          const dealResults: SearchResult[] = dealResponse.data.deals
            .filter((deal) => deal.title.toLowerCase().includes(term))
            .slice(0, 5)
            .map((deal) => ({
              id: deal._id,
              title: deal.title,
              detail: `Deal · ${deal.stage}`,
              href: `/deals?search=${encodeURIComponent(deal.title)}`,
              category: "Deal",
            }));
          const taskResults: SearchResult[] = taskResponse.data.tasks
            .filter((task) =>
              task.title.toLowerCase().includes(term) ||
              (task.customerId?.name.toLowerCase().includes(term) ?? false)
            )
            .slice(0, 5)
            .map((task) => ({
              id: task._id,
              title: task.title,
              detail: `Task · ${task.customerId?.name ?? new Date(task.dueDate).toLocaleDateString()}`,
              href: `/tasks?search=${encodeURIComponent(task.title)}`,
              category: "Task",
            }));
          setResults([...customerResults, ...dealResults, ...taskResults].slice(0, 10));
        })
        .catch(() => {
          if (active) setSearchError("Search is unavailable. Please try again.");
        })
        .finally(() => {
          if (active) setSearching(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const refreshNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const [overdueResponse, todayResponse] = await Promise.all([
        api.get<{ tasks: NotificationTask[] }>("/api/tasks", {
          params: { status: "overdue" },
        }),
        api.get<{ tasks: NotificationTask[] }>("/api/tasks", {
          params: { status: "today" },
        }),
      ]);
      setNotifications([
        ...overdueResponse.data.tasks,
        ...todayResponse.data.tasks,
      ].slice(0, 8));
    } catch {
      setNotificationsError("Unable to load task notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const toggleNotifications = () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (opening) void refreshNotifications();
  };

  const openResult = (result: SearchResult) => {
    navigate(result.href);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <>
      <div ref={searchRef} className="relative w-28 sm:w-[min(32vw,280px)]">
        <Search
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          aria-label="Search customers, deals, and tasks"
          aria-expanded={searchOpen}
          value={query}
          onFocus={() => setSearchOpen(true)}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setResults([]);
              setSearchError("");
              setSearching(false);
            }
            setSearchOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSearchOpen(false);
            if (event.key === "Enter" && results[0]) openResult(results[0]);
          }}
          placeholder="Search…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        )}
        {searchOpen && query.trim().length >= 2 && (
          <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(90vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
            <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Search results
            </div>
            {searching ? (
              <p className="px-4 py-5 text-sm text-slate-500">Searching your workspace…</p>
            ) : searchError ? (
              <p role="alert" className="px-4 py-5 text-sm text-rose-600">{searchError}</p>
            ) : results.length ? (
              <ul className="max-h-80 overflow-y-auto py-1">
                {results.map((result) => (
                  <li key={`${result.category}-${result.id}`}>
                    <button
                      type="button"
                      onClick={() => openResult(result)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-orange-50"
                    >
                      <span className="mt-0.5 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">
                        {result.category}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800">{result.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{result.detail}</span>
                      </span>
                      <ArrowUpRight size={14} className="ml-auto mt-1 shrink-0 text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-sm text-slate-500">No matching customers, deals, or tasks.</p>
            )}
          </div>
        )}
      </div>

      <div ref={notificationRef} className="relative">
        <button
          type="button"
          onClick={toggleNotifications}
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm"
        >
          <Bell size={19} className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {notifications.length}
            </span>
          )}
        </button>
        {notificationsOpen && (
          <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Task notifications</h3>
                <p className="mt-0.5 text-xs text-slate-500">Due today and overdue</p>
              </div>
              <button
                type="button"
                onClick={() => void refreshNotifications()}
                aria-label="Refresh notifications"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <RefreshCw size={15} />
              </button>
            </div>
            {notificationsLoading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Loading notifications…</p>
            ) : notificationsError ? (
              <div className="px-4 py-5 text-center">
                <p role="alert" className="text-sm text-rose-600">{notificationsError}</p>
                <button type="button" onClick={() => void refreshNotifications()} className="mt-2 text-xs font-bold text-orange-600">
                  Try again
                </button>
              </div>
            ) : notifications.length ? (
              <>
                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {notifications.map((task) => {
                    const overdue =
                      task.dueDate.slice(0, 10) < new Date().toISOString().slice(0, 10);
                    return (
                      <li key={task._id}>
                        <Link
                          to={`/tasks?status=${overdue ? "overdue" : "today"}`}
                          onClick={() => setNotificationsOpen(false)}
                          className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-orange-50"
                        >
                          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${overdue ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                            {overdue ? <AlertTriangle size={17} /> : <Clock3 size={17} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800">{task.title}</span>
                            <span className={`mt-1 block text-xs font-medium ${overdue ? "text-rose-600" : "text-slate-500"}`}>
                              {overdue ? "Overdue" : "Due today"} · {task.priority} priority
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  to="/tasks?status=overdue"
                  onClick={() => setNotificationsOpen(false)}
                  className="flex items-center justify-center gap-1 border-t border-slate-100 px-4 py-3 text-xs font-bold text-orange-600 hover:bg-orange-50"
                >
                  View tasks <ArrowRight size={13} />
                </Link>
              </>
            ) : (
              <div className="px-5 py-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Bell size={19} />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700">You’re all caught up</p>
                <p className="mt-1 text-xs text-slate-500">No overdue tasks or tasks due today.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
