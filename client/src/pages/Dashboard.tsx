
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import DashboardPipeline from "./DashboardPipeline";
import type { PipelineItem } from "../types";

interface DashboardData {
  summary: {
    totalCustomers: number;
    openPipelineValue: number;
    dealsWonThisMonth: number;
    tasksDueToday: number;
    overdueTasks: number;
  };
  pipeline: PipelineItem[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    api
      .get<DashboardData>("/dashboard")
      .then(({ data: result }) => {
        if (!active) return;

        setData({
          summary: {
            totalCustomers: result.summary.totalCustomers,
            openPipelineValue: result.summary.openPipelineValue,
            dealsWonThisMonth: result.summary.dealsWonThisMonth,
            tasksDueToday: result.summary.tasksDueToday,
            overdueTasks: result.summary.overdueTasks,
          },
          pipeline: Array.isArray(result.pipeline)
            ? result.pipeline
            : [],
        });
      })
      .catch((requestError: unknown) => {
        if (!active) return;

        if (axios.isAxiosError<{ message?: string }>(requestError)) {
          setError(
            requestError.response?.data?.message ||
              (requestError.response?.status === 401
                ? "Your session has expired. Please log in again."
                : requestError.response?.status === 404
                  ? "Dashboard endpoint not found. Check the API URL."
                  : "Unable to load dashboard. Please try again.")
          );
        } else {
          setError("Unable to load dashboard. Please try again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = () => {
    setLoading(true);
    setReloadKey((current) => current + 1);
  };

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.10),transparent_38%),linear-gradient(135deg,#f8fafc,#f8fafc_55%,#fff7ed)] p-4 sm:p-7 lg:p-9">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-64 rounded-[28px] bg-slate-200/70" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-36 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="h-80 rounded-[28px] bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fc] p-4 sm:p-7 lg:p-9">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Dashboard unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The dashboard data could not be loaded."}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Customers",
      value: data.summary.totalCustomers.toLocaleString("en-IN"),
      detail: "In your workspace",
      icon: Users,
      href: "/customers",
      iconStyle: "bg-blue-50 text-blue-600",
      accent: "bg-blue-500",
    },
    {
      title: "Open pipeline",
      value: `₹${data.summary.openPipelineValue.toLocaleString("en-IN")}`,
      detail: "Active deal value",
      icon: CircleDollarSign,
      href: "/deals",
      iconStyle: "bg-violet-50 text-violet-600",
      accent: "bg-violet-500",
    },
    {
      title: "Won this month",
      value: data.summary.dealsWonThisMonth.toLocaleString("en-IN"),
      detail: "Deals closed successfully",
      icon: Trophy,
      href: "/deals?stage=Won",
      iconStyle: "bg-emerald-50 text-emerald-600",
      accent: "bg-emerald-500",
    },
    {
      title: "Due today",
      value: data.summary.tasksDueToday.toLocaleString("en-IN"),
      detail: "Tasks on today's list",
      icon: CalendarDays,
      href: "/tasks?status=today",
      iconStyle: "bg-amber-50 text-amber-600",
      accent: "bg-amber-500",
    },
    {
      title: "Overdue",
      value: data.summary.overdueTasks.toLocaleString("en-IN"),
      detail: "Need your attention",
      icon: AlertTriangle,
      href: "/tasks?status=overdue",
      iconStyle:
        data.summary.overdueTasks > 0
          ? "bg-rose-50 text-rose-600"
          : "bg-slate-100 text-slate-500",
      accent:
        data.summary.overdueTasks > 0
          ? "bg-rose-500"
          : "bg-slate-300",
    },
  ];

  const shortcuts = [
    {
      title: "Customers",
      description: "Build and manage relationships",
      href: "/customers",
      icon: Users,
      style: "bg-blue-50 text-blue-600",
    },
    {
      title: "Deals pipeline",
      description: "Move opportunities forward",
      href: "/deals",
      icon: BriefcaseBusiness,
      style: "bg-violet-50 text-violet-600",
    },
    {
      title: "Tasks",
      description: "Plan the next follow-up",
      href: "/tasks",
      icon: CheckSquare,
      style: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.10),transparent_38%),linear-gradient(135deg,#f8fafc,#f8fafc_55%,#fff7ed)] p-4 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl">
        <header
          className="relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111827] via-[#1e293b] to-[#552b28] p-5 text-white shadow-2xl shadow-slate-900/15 sm:p-8 lg:p-10"
          style={{ animation: "fadeUp .45s ease-out both" }}
        >
          <div className="absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="absolute -bottom-44 left-1/3 -z-10 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute right-0 top-0 -z-10 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10),transparent_65%)]" />

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-orange-100 backdrop-blur">
                <Sparkles size={14} className="text-amber-300" />
                {greeting} · workspace overview
              </div>

              <h1 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Your business,{" "}
                <span className="bg-gradient-to-r from-orange-200 to-amber-400 bg-clip-text text-transparent">
                  in focus.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Keep every relationship moving. Here’s your snapshot of
                customers, opportunities, and today’s priorities.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-medium text-slate-200 backdrop-blur">
                  <CalendarDays size={16} className="text-orange-300" />
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                <button
                  type="button"
                  onClick={refresh}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-orange-50"
                >
                  <RefreshCw
                    size={15}
                    className="transition-transform group-hover:rotate-180"
                  />
                  Refresh overview
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-white/[0.08] p-5 shadow-xl shadow-black/10 backdrop-blur-md transition duration-300 hover:border-white/25 hover:bg-white/[0.10] sm:p-6">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-orange-300/10" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                      At a glance
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Your workspace pulse
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-300/15 text-orange-200">
                    <BriefcaseBusiness size={19} />
                  </span>
                </div>

                <Link
                  to="/deals"
                  className="group mt-5 flex items-end justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/20 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-950/35"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Open pipeline
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      ₹{data.summary.openPipelineValue.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="mb-1 shrink-0 text-orange-200 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to={
                    data.summary.overdueTasks > 0
                      ? "/tasks?status=overdue"
                      : "/tasks?status=today"
                  }
                  className="mt-3 flex items-center gap-3 rounded-xl px-1 py-2 transition hover:bg-white/5"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      data.summary.overdueTasks > 0
                        ? "bg-rose-400/15 text-rose-200"
                        : data.summary.tasksDueToday > 0
                          ? "bg-amber-300/15 text-amber-200"
                          : "bg-emerald-400/15 text-emerald-200"
                    }`}
                  >
                    {data.summary.overdueTasks > 0 ? (
                      <AlertTriangle size={17} />
                    ) : data.summary.tasksDueToday > 0 ? (
                      <CalendarDays size={17} />
                    ) : (
                      <CheckSquare size={17} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">
                      {data.summary.overdueTasks > 0
                        ? `${data.summary.overdueTasks} overdue ${
                            data.summary.overdueTasks === 1 ? "task" : "tasks"
                          }`
                        : data.summary.tasksDueToday > 0
                          ? `${data.summary.tasksDueToday} ${
                              data.summary.tasksDueToday === 1
                                ? "task"
                                : "tasks"
                            } due today`
                          : "You’re all caught up"}
                    </span>

                    <span className="mt-0.5 block text-xs text-slate-400">
                      {data.summary.overdueTasks > 0
                        ? "A little attention goes a long way"
                        : data.summary.tasksDueToday > 0
                          ? "Keep your follow-ups on schedule"
                          : "No tasks due today"}
                    </span>
                  </span>

                  <ArrowRight size={16} className="shrink-0 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section
          aria-label="CRM summary"
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <Link
                key={metric.title}
                to={metric.href}
                className="group relative overflow-hidden rounded-[24px] border border-white bg-white/90 p-5 shadow-lg shadow-slate-900/[0.035] ring-1 ring-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/[0.10] hover:ring-orange-200/70 sm:p-5"
                style={{
                  animation: `fadeUp .4s ease-out ${index * 55}ms both`,
                }}
              >
                <span
                  className={`absolute inset-x-0 top-0 h-1 ${metric.accent} transition-all duration-300 group-hover:h-1.5`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconStyle} shadow-sm transition duration-300 group-hover:rotate-3 group-hover:scale-110`}
                  >
                    <Icon size={20} />
                  </div>

                  <ArrowUpRight className="text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" size={17} />
                </div>

                <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  {metric.title}
                </p>

                <p className="mt-1 truncate text-[26px] font-bold tracking-tight text-slate-900">
                  {metric.value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {metric.detail}
                </p>
              </Link>
            );
          })}
        </section>

        <DashboardPipeline pipeline={data.pipeline} />

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Keep things moving
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Quick access
              </h2>
            </div>

            <span className="hidden text-sm text-slate-400 sm:block">
              Pick up where you left off
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;

              return (
                <Link
                  key={shortcut.title}
                  to={shortcut.href}
                  className="group flex items-center gap-4 rounded-[22px] border border-white bg-white/90 p-5 shadow-md shadow-slate-900/[0.035] ring-1 ring-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/[0.08] hover:ring-orange-200/70"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${shortcut.style} transition duration-300 group-hover:rotate-3 group-hover:scale-110`}
                  >
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">
                      {shortcut.title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {shortcut.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
