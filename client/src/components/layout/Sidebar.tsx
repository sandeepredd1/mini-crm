import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Users,
  X,
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
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* LOGO */}

        <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 shadow-lg shadow-purple-200">
              <BarChart3
                size={21}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
                Mini CRM
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Business Manager
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-200"
                        : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={19}
                        className={
                          isActive
                            ? "text-white"
                            : "text-gray-400 transition-colors group-hover:text-purple-600"
                        }
                      />

                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* USER / LOGOUT */}

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() ||
                "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-800">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}