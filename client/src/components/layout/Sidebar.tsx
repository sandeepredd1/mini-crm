import {
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
import { useAuth } from "../../context/AuthContext";

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

        <div className="relative flex h-[76px] items-center justify-between overflow-hidden border-b border-orange-50 px-5">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-100/50 blur-2xl" />

          <div className="relative flex items-center gap-3">
            {/* LOGO ICON */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-xl bg-orange-400 opacity-20 blur-md transition-all duration-500 group-hover:opacity-50 group-hover:blur-lg" />

              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-xl">
                <BarChart3
                  size={21}
                  className="transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 rounded-xl border border-white/20" />
              </div>
            </div>

            {/* BRAND */}
            <div className="animate-[fadeRight_.5s_ease-out]">
              <h1 className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
                Mini CRM
              </h1>

              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
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

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-4 flex items-center justify-between px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
              Main Menu
            </p>

            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-sm shadow-orange-300 animate-pulse" />
          </div>

          <nav className="space-y-2">
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
                    `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 animate-[fadeRight_.45s_ease-out_both] ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5 hover:shadow-xl"
                        : "text-gray-500 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* ACTIVE SHINE */}
                      {isActive && (
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      )}

                      {/* LEFT ACTIVE BAR */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                      )}

                      {/* ICON */}
                      <span
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-gray-50 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600"
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
                        <span className="relative h-2 w-2 rounded-full bg-white shadow-sm animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* SMALL INFO CARD */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200">
                <Flame size={15} />
              </div>

              <span className="text-xs font-black text-orange-700">
                CRM Workspace
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-orange-600/70">
              Manage customers, deals and tasks from one place.
            </p>
          </div>
        </div>

        {/* ================= USER / LOGOUT ================= */}

        <div className="border-t border-orange-50 bg-gradient-to-b from-white to-orange-50/40 p-4">
          {/* USER CARD */}
          <div className="group mb-3 flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100">
            {/* AVATAR */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 blur-md transition-all duration-300 group-hover:opacity-50" />

              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white shadow-md shadow-orange-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* ONLINE DOT */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm" />
            </div>

            {/* USER INFO */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-gray-800 transition-colors duration-300 group-hover:text-orange-600">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-semibold text-gray-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-100 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 transition-all duration-300 group-hover:bg-red-100 group-hover:text-red-600">
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