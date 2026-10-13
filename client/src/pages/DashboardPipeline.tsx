import { useMemo } from "react";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import type { PipelineItem } from "../types";

const stageStyles: Record<string, { bar: string; dot: string; text: string }> = {
  Lead: {
    bar: "from-sky-400 to-sky-500",
    dot: "bg-sky-500",
    text: "text-sky-700",
  },
  Qualified: {
    bar: "from-violet-400 to-violet-500",
    dot: "bg-violet-500",
    text: "text-violet-700",
  },
  Proposal: {
    bar: "from-amber-400 to-orange-500",
    dot: "bg-orange-500",
    text: "text-orange-700",
  },
  Won: {
    bar: "from-emerald-400 to-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  Lost: {
    bar: "from-rose-400 to-rose-500",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
};

export default function DashboardPipeline({
  pipeline,
}: {
  pipeline: PipelineItem[];
}) {
  const maxPipelineValue = useMemo(
    () => Math.max(...pipeline.map((item) => item.value || 0), 1),
    [pipeline]
  );
  const dealsCount = pipeline.reduce((total, item) => total + item.count, 0);

  return (
    <section
      className="mt-6 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] sm:p-7"
      aria-labelledby="pipeline-title"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
            <BarChart3 size={21} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="pipeline-title" className="text-lg font-bold tracking-tight text-slate-900">
                Pipeline by stage
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                {dealsCount} {dealsCount === 1 ? "deal" : "deals"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Value distribution across your opportunities</p>
          </div>
        </div>
        <Link
          to="/deals"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          View pipeline <ArrowUpRight size={15} />
        </Link>
      </div>

      {pipeline.length === 0 ? (
        <div className="mt-7 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
            <BarChart3 size={24} />
          </div>
          <h3 className="mt-4 font-bold text-slate-700">Your pipeline starts here</h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Add a deal to see how opportunity value is distributed across the stages.
          </p>
          <Link
            to="/deals"
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Create a deal
          </Link>
        </div>
      ) : (
        <div className="mt-7 space-y-5">
          {pipeline.map((item) => {
            const percentage = Math.min((item.value / maxPipelineValue) * 100, 100);
            const style = stageStyles[item.stage] ?? stageStyles.Lead;
            return (
              <div key={item.stage} className="group">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                    <span className={`text-sm font-bold ${style.text}`}>{item.stage}</span>
                    <span className="text-xs text-slate-400">
                      {item.count} {item.count === 1 ? "deal" : "deals"}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-slate-800">
                    ₹{item.value.toLocaleString("en-IN")}
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`${item.stage} pipeline value`}
                  aria-valuemin={0}
                  aria-valuemax={maxPipelineValue}
                  aria-valuenow={item.value}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-700 ease-out group-hover:brightness-105`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
