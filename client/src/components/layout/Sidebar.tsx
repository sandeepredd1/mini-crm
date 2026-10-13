import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Users,
  X,
  Flame,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth-state";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    name: "Deals",
    path: "/deals",
    icon: BriefcaseBusiness,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden animate-[fadeIn_.25s_ease-out]"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-orange-100 bg-white shadow-2xl shadow-orange-100/40 transition-all duration-500 ease-out lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0 shadow-orange-200/60"
            : "-translate-x-full"
        }`}
      >
        {/* ================= LOGO ================= */}

        <div className="relative flex h-[82px] items-center justify-between overflow-hidden border-b border-slate-100 bg-gradient-to-r from-white via-white to-orange-50/70 px-5">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-100/50 blur-2xl" />

          <div className="relative flex items-center gap-3">
            {/* LOGO ICON */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-xl bg-orange-400 opacity-20 blur-md transition-all duration-500 group-hover:opacity-50 group-hover:blur-lg" />

              <div className="relative flex h-11 w-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/80 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:rotate-2 group-hover:shadow-xl">
                <BarChart3
                  size={21}
                  className="transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 rounded-xl border border-white/20" />
              </div>
            </div>

            {/* BRAND */}
            <div className="animate-[fadeRight_.5s_ease-out]">
              <h1 className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-[19px] font-extrabold tracking-tight text-transparent">
                Mini CRM
              </h1>

              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                <Flame
                  size={9}
                  className="text-orange-500"
                />
                Business Manager
              </p>
            </div>
          </div>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-gray-400 transition-all duration-300 hover:rotate-90 hover:bg-orange-100 hover:text-orange-600 lg:hidden"
          >
            <X
              size={19}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-white to-orange-50/30 px-4 py-6">
          <div className="mb-4 flex items-center justify-between px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Main Menu
            </p>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-slate-400">
              04
            </span>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 animate-[fadeRight_.45s_ease-out_both] ${
                      isActive
                        ? "border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50/70 text-orange-700 shadow-sm shadow-orange-100/70"
                        : "border-transparent text-slate-500 hover:border-slate-100 hover:bg-white hover:text-slate-800 hover:shadow-sm"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* LEFT ACTIVE BAR */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-orange-400 to-amber-500" />
                      )}

                      {/* ICON */}
                      <span
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                          isActive
                          ? "bg-white text-orange-600 shadow-sm shadow-orange-200/70"
                          : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600"
                        }`}
                      >
                        <Icon
                          size={18}
                          className="transition-all duration-300 group-hover:scale-110"
                        />
                      </span>

                      {/* TEXT */}
                      <span className="relative flex-1">
                        {item.name}
                      </span>

                      {/* ACTIVE DOT */}
                      {isActive && (
                        <ArrowRight size={15} className="relative text-orange-400" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

        </div>

        {/* ================= USER / LOGOUT ================= */}

        <div className="border-t border-slate-100 bg-gradient-to-b from-white to-orange-50/50 p-4">
          {/* USER CARD */}
          <div className="group mb-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm shadow-slate-900/[0.025] transition-all duration-200 hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/70">
            {/* AVATAR */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 blur-md transition-all duration-300 group-hover:opacity-50" />

              <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white shadow-md shadow-orange-200/80 transition-all duration-300 group-hover:scale-105">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* ONLINE DOT */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm" />
            </div>

            {/* USER INFO */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-orange-600">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 transition-all duration-200 group-hover:bg-rose-100 group-hover:text-rose-600">
              <LogOut
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>

            <span>Logout</span>

            <span className="ml-auto text-xs font-bold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              →
            </span>
          </button>
        </div>
      </aside>

      {/* ================= ANIMATIONS ================= */}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes sidebarIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}