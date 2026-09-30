import {
  Bell,
  Menu,
  Search,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/customers": "Customers",
  "/deals": "Deals",
  "/tasks": "Tasks",
};

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const pageTitle =
    pageTitles[location.pathname] ||
    "Mini CRM";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-gray-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        {/* LEFT */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              {pageTitle}
            </h2>

            <p className="hidden text-xs text-gray-400 sm:block">
              Manage your business efficiently
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2 sm:gap-4">
          {/* SEARCH */}

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:flex"
          >
            <Search size={19} />
          </button>

          {/* NOTIFICATION */}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* DIVIDER */}

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          {/* USER */}

          <div className="flex items-center gap-2">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-gray-800">
                {user?.name || "User"}
              </p>

              <p className="text-[11px] text-gray-400">
                CRM User
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white shadow-md shadow-purple-100">
              {user?.name?.charAt(0).toUpperCase() ||
                "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}