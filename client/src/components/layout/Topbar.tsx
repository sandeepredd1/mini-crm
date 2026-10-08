import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);

  const pageTitle =
    pageTitles[location.pathname] ||
    "Mini CRM";

  /* CLOSE PROFILE WHEN CLICKING OUTSIDE */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* CLOSE PROFILE WHEN PAGE CHANGES */
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-orange-100 bg-white/90 px-4 shadow-sm shadow-orange-50 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">

        {/* ================= LEFT ================= */}

        <div className="flex items-center gap-3">

          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md lg:hidden"
          >
            <Menu
              size={20}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </button>

          {/* PAGE TITLE */}
          <div className="animate-[fadeRight_.4s_ease-out]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 shadow-sm shadow-orange-300 animate-pulse" />

              <h2 className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-lg font-black text-transparent sm:text-xl">
                {pageTitle}
              </h2>
            </div>

            <p className="hidden text-xs font-medium text-gray-400 sm:block">
              Manage your business efficiently
            </p>
          </div>
        </div>

        {/* ================= RIGHT ================= */}

        <div className="flex items-center gap-2 sm:gap-4">

          {/* SEARCH */}
          <button
            type="button"
            aria-label="Search"
            className="group hidden h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm sm:flex"
          >
            <Search
              size={19}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </button>

          {/* NOTIFICATION */}
          <button
            type="button"
            aria-label="Notifications"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm"
          >
            <Bell
              size={19}
              className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
            />

            {/* NOTIFICATION DOT */}
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* DIVIDER */}
          <div className="hidden h-8 w-px bg-orange-100 sm:block" />

          {/* ================= PROFILE ================= */}

          <div
            ref={profileRef}
            className="relative"
          >
            {/* PROFILE BUTTON */}
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (previous) => !previous
                )
              }
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              className={`group flex items-center gap-2 rounded-2xl border px-2 py-1.5 transition-all duration-300 ${
                profileOpen
                  ? "border-orange-200 bg-orange-50 shadow-md shadow-orange-100"
                  : "border-transparent hover:border-orange-100 hover:bg-orange-50/70 hover:shadow-sm"
              }`}
            >
              {/* USER NAME */}
              <div className="hidden text-right md:block">
                <p className="max-w-[150px] truncate text-sm font-black text-gray-800 transition-colors duration-300 group-hover:text-orange-600">
                  {user?.name || "User"}
                </p>

                <p className="text-[11px] font-medium text-gray-400">
                  CRM User
                </p>
              </div>

              {/* AVATAR */}
              <div className="relative">
                {/* AVATAR GLOW */}
                <div
                  className={`absolute inset-0 rounded-xl bg-orange-400 blur-md transition-all duration-300 ${
                    profileOpen
                      ? "opacity-40"
                      : "opacity-0 group-hover:opacity-30"
                  }`}
                />

                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-sm font-black text-white shadow-md shadow-orange-200 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 group-hover:shadow-lg">
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase() || "U"}

                  {/* ONLINE DOT */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                </div>
              </div>

              {/* CHEVRON */}
              <ChevronDown
                size={16}
                className={`hidden text-gray-400 transition-all duration-300 md:block ${
                  profileOpen
                    ? "rotate-180 text-orange-500"
                    : "group-hover:text-orange-500"
                }`}
              />
            </button>

            {/* ================= PROFILE DROPDOWN ================= */}

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[290px] origin-top-right animate-[profileDrop_.25s_ease-out]">

                {/* DROPDOWN CARD */}
                <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl shadow-orange-200/40">

                  {/* ORANGE TOP */}
                  <div className="relative h-20 overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500">
                    <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

                    <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />

                    <div className="absolute right-4 top-4">
                      <FlameIcon />
                    </div>
                  </div>

                  {/* PROFILE INFORMATION */}
                  <div className="relative px-5 pb-4">

                    {/* LARGE AVATAR */}
                    <div className="-mt-8 mb-3 flex items-end justify-between">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-orange-500 to-amber-500 text-xl font-black text-white shadow-xl shadow-orange-200">
                          {user?.name
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}

                          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                        </div>
                      </div>

                      <span className="mb-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-600 ring-1 ring-green-100">
                        Online
                      </span>
                    </div>

                    {/* NAME */}
                    <div>
                      <h3 className="truncate text-base font-black text-gray-900">
                        {user?.name || "User"}
                      </h3>

                      <p className="mt-1 truncate text-xs text-gray-400">
                        {user?.email || ""}
                      </p>
                    </div>

                    {/* USER ROLE */}
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <UserRound size={17} />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                          Account
                        </p>

                        <p className="text-xs font-bold text-orange-700">
                          CRM User
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="border-t border-orange-50" />

                  {/* LOGOUT */}
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 transition-all duration-300 group-hover:bg-red-100 group-hover:text-red-600">
                        <LogOut
                          size={17}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </span>

                      <span>Logout</span>

                      <span className="ml-auto text-xs opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ANIMATIONS ================= */}

      <style>{`
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

        @keyframes profileDrop {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </header>
  );
}

/* SMALL DECORATIVE ICON */
function FlameIcon() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white">
      <span className="text-sm">🔥</span>
    </div>
  );
}