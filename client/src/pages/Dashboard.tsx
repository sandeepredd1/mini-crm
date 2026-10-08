import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  TrendingUp,
  Trophy,
  Clock3,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  RefreshCw,
  Flame,
  Target,
} from "lucide-react";

type PipelineItem = {
  stage: string;
  value: number;
  count: number;
};

type DashboardData = {
  summary: {
    totalCustomers: number;
    openPipelineValue: number;
    dealsWonThisMonth: number;
    tasksDueToday: number;
    overdueTasks: number;
  };
  pipeline: PipelineItem[];
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const stageColors: Record<string, string> = {
  Lead: "bg-orange-400",
  Qualified: "bg-amber-500",
  Proposal: "bg-orange-600",
  Won: "bg-green-500",
  Lost: "bg-red-500",
};

const stageTextColors: Record<string, string> = {
  Lead: "text-orange-600",
  Qualified: "text-amber-600",
  Proposal: "text-orange-700",
  Won: "text-green-600",
  Lost: "text-red-600",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<DashboardData>(
        `${API_URL}/api/dashboard`,
        {
          withCredentials: true,
        }
      );

      const result = response.data;

      setData({
        summary: {
          totalCustomers:
            result?.summary?.totalCustomers ?? 0,
          openPipelineValue:
            result?.summary?.openPipelineValue ?? 0,
          dealsWonThisMonth:
            result?.summary?.dealsWonThisMonth ?? 0,
          tasksDueToday:
            result?.summary?.tasksDueToday ?? 0,
          overdueTasks:
            result?.summary?.overdueTasks ?? 0,
        },
        pipeline: Array.isArray(result?.pipeline)
          ? result.pipeline
          : [],
      });
    } catch (error) {
      console.error("Dashboard request failed:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
        } else {
          setError(
            error.response?.data?.message ||
              "Unable to load dashboard."
          );
        }
      } else {
        setError("Unable to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const maxPipelineValue = useMemo(() => {
    if (!data?.pipeline?.length) {
      return 1;
    }

    return Math.max(
      ...data.pipeline.map((item) => item.value || 0),
      1
    );
  }, [data]);

  const cards = data
    ? [
        {
          title: "Total Customers",
          value:
            data.summary.totalCustomers.toLocaleString(),
          description: "Customer records",
          icon: Users,
          iconStyle:
            "bg-orange-50 text-orange-600",
          shadow:
            "shadow-orange-100",
        },
        {
          title: "Open Pipeline",
          value: `₹${data.summary.openPipelineValue.toLocaleString(
            "en-IN"
          )}`,
          description: "Active deal value",
          icon: TrendingUp,
          iconStyle:
            "bg-amber-50 text-amber-600",
          shadow:
            "shadow-amber-100",
        },
        {
          title: "Won This Month",
          value:
            data.summary.dealsWonThisMonth.toLocaleString(),
          description: "Successful deals",
          icon: Trophy,
          iconStyle:
            "bg-orange-100 text-orange-700",
          shadow:
            "shadow-orange-100",
        },
        {
          title: "Due Today",
          value:
            data.summary.tasksDueToday.toLocaleString(),
          description: "Tasks due today",
          icon: Clock3,
          iconStyle:
            "bg-yellow-50 text-yellow-600",
          shadow:
            "shadow-yellow-100",
        },
        {
          title: "Overdue",
          value:
            data.summary.overdueTasks.toLocaleString(),
          description: "Tasks need attention",
          icon: AlertTriangle,
          iconStyle:
            "bg-red-50 text-red-600",
          shadow:
            "shadow-red-100",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-56 rounded-xl bg-orange-100" />

          <div className="h-4 w-80 rounded bg-orange-100" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-36 rounded-3xl bg-white shadow-lg shadow-orange-100"
              />
            ))}
          </div>

          <div className="h-96 rounded-3xl bg-white shadow-lg shadow-orange-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-2xl shadow-orange-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-1 hover:from-orange-600 hover:to-amber-600 hover:shadow-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="animate-[fadeDown_.5s_ease-out]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-200 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
                <Flame className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  CRM Overview
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Track your customers, deals and tasks from one place.
                </p>
              </div>
            </div>

            <button
              onClick={fetchDashboard}
              className="group inline-flex w-fit items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50 hover:shadow-lg"
            >
              <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
              Refresh
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className={`group rounded-3xl border border-orange-100 bg-white p-5 shadow-lg ${card.shadow} transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-2xl`}
                style={{
                  animation: `fadeUp .55s ease-out ${
                    index * 80
                  }ms both`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconStyle} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-orange-500" />
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                  {card.title}
                </p>

                <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-orange-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-700 group-hover:w-full"
                    style={{
                      width: `${Math.max(
                        25,
                        100 - index * 12
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* PIPELINE */}
        <div
          className="mt-7 rounded-3xl border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/60 sm:p-7"
          style={{
            animation: "fadeUp .6s ease-out .45s both",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600">
                <BarChart3 className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Pipeline Value
                </h2>

                <p className="text-sm text-slate-500">
                  Deal value by pipeline stage
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">
              <Target className="h-4 w-4" />
              Live database data
            </div>
          </div>

          {data.pipeline.length === 0 ? (
            <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-100 bg-gradient-to-br from-orange-50/50 to-amber-50/50 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-orange-300 shadow-md">
                <BarChart3 className="h-7 w-7" />
              </div>

              <h3 className="mt-5 font-bold text-slate-700">
                No pipeline data yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Create your first deal and the pipeline value will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-7">
              {data.pipeline.map((item) => {
                const percentage =
                  (item.value / maxPipelineValue) * 100;

                return (
                  <div
                    key={item.stage}
                    className="group"
                  >
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            stageColors[item.stage] ||
                            "bg-orange-500"
                          } shadow-sm`}
                        />

                        <span
                          className={`text-sm font-bold ${
                            stageTextColors[item.stage] ||
                            "text-orange-600"
                          }`}
                        >
                          {item.stage}
                        </span>

                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-500">
                          {item.count}{" "}
                          {item.count === 1
                            ? "deal"
                            : "deals"}
                        </span>
                      </div>

                      <span className="text-sm font-black text-slate-800">
                        ₹{item.value.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-orange-50">
                      <div
                        className={`h-full rounded-full ${
                          stageColors[item.stage] ||
                          "bg-orange-500"
                        } shadow-sm transition-all duration-1000 ease-out group-hover:brightness-110`}
                        style={{
                          width: `${Math.max(
                            percentage,
                            3
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM CARDS */}
        <div
          className="mt-7 grid gap-5 md:grid-cols-2"
          style={{
            animation: "fadeUp .6s ease-out .55s both",
          }}
        >
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-7 text-white shadow-2xl shadow-orange-200 transition-all duration-500 hover:-translate-y-1 hover:shadow-orange-300">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-150" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <p className="text-sm font-bold text-orange-100">
                  Open Pipeline
                </p>
              </div>

              <p className="mt-5 text-4xl font-black">
                ₹
                {data.summary.openPipelineValue.toLocaleString(
                  "en-IN"
                )}
              </p>

              <p className="mt-2 text-sm text-orange-100">
                Total value of your active deals.
              </p>
            </div>
          </div>

          <div className="group rounded-3xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-100/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-all duration-300 group-hover:scale-110">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Attention Required
                </p>

                <p className="text-3xl font-black text-slate-900">
                  {data.summary.overdueTasks}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              overdue{" "}
              {data.summary.overdueTasks === 1
                ? "task needs"
                : "tasks need"}{" "}
              your attention.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-red-50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-500 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    Math.max(
                      data.summary.overdueTasks * 15,
                      data.summary.overdueTasks > 0
                        ? 10
                        : 0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}